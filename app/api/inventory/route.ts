import { NextRequest, NextResponse } from 'next/server';
import { convertCurrency } from '@/lib/utils';
import { Currency } from '@/hooks/use-currency-store';
import pLimit from 'p-limit';

// Cache local pour les prix CSFloat
const priceCache = new Map<string, { price: number; float?: number; link?: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 heure

// Nouveau cache pour les prix Steam par devise
const steamPriceCache = new Map<string, { [currency: string]: { price: number; timestamp: number } }>();
const STEAM_CACHE_DURATION = 1000 * 60 * 60 * 6; // 6h
const STEAM_THROTTLE_DELAY = 200; // 200ms entre requêtes

let lastInventoryFetch = 0;
const INVENTORY_MIN_INTERVAL = 5000; // 5 seconds between inventory fetches

async function getMarketData(name: string): Promise<{ price: number; float?: number; link?: string }> {
  const now = Date.now();
  const cached = priceCache.get(name);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return {
      price: cached.price,
      float: cached.float,
      link: cached.link,
    };
  }

  const url = `https://api.csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(name)}&limit=1`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.CSFLOAT_API_KEY || ''}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ CSFloat ${res.status} - ${res.statusText}: ${errorText}`);
      return { price: 0 };
    }

    const json = await res.json();
    const listing = json?.results?.[0];

    const price = listing?.price || 0;
    const float = listing?.float_value;
    const link = listing?._id ? `https://csfloat.com/item/${listing._id}` : undefined;

    priceCache.set(name, { price, float, link, timestamp: now });
    return { price, float, link };
  } catch (error) {
    console.error(`❌ Erreur prix CSFloat pour "${name}"`, error);
    return { price: 0 };
  }
}

async function getSteamMarketPrice(name: string, currency: string): Promise<number> {
  const now = Date.now();
  const cached = steamPriceCache.get(name)?.[currency];
  const isFresh = cached && (now - cached.timestamp < STEAM_CACHE_DURATION);

  // Si le cache est frais, on le retourne direct
  if (isFresh) return cached!.price;

  // Sinon, on tente de fetch Steam
  try {
    // currency param: 3=EUR, 1=USD, 2=GBP, 5=RUB, 23=CNY
    const currencyMap: Record<string, number> = { EUR: 3, USD: 1, GBP: 2, RUB: 5, CNY: 23 };
    const steamCurrency = currencyMap[currency] || 3;
    const url = `https://steamcommunity.com/market/priceoverview/?currency=${steamCurrency}&appid=730&market_hash_name=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) {
      if (cached) return cached.price;
      return 0;
    }
    const json = await res.json();
    let price = 0;
    if (json.lowest_price) {
      const match = json.lowest_price.replace(',', '.').replace(/[^0-9.]/g, '');
      price = parseFloat(match);
      if (isNaN(price)) price = 0;
    }
    // DEBUG LOG
    console.log('[STEAM PRICE]', { name, currency, url, response: json, parsedPrice: price });
    // Appliquer décote 25%
    const adjusted = Math.round(price * 0.75 * 100) / 100;
    if (adjusted > 0) {
      if (!steamPriceCache.has(name)) steamPriceCache.set(name, {});
      steamPriceCache.get(name)![currency] = { price: adjusted, timestamp: now };
      return adjusted;
    } else {
      // Steam n'a pas de prix, on garde l'ancien si dispo
      if (cached) return cached.price;
      return 0;
    }
  } catch (e) {
    // En cas d'erreur réseau, on garde l'ancien prix si dispo
    if (cached) return cached.price;
    return 0;
  }
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  if (now - lastInventoryFetch < INVENTORY_MIN_INTERVAL) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait before retrying.' }, { status: 429 });
  }
  lastInventoryFetch = now;

  const steamId = req.cookies.get('steamid')?.value;
  if (!steamId) {
    return NextResponse.json({ error: 'Non connecté à Steam' }, { status: 401 });
  }

  // Récupère la devise et l'appid demandés dans l'URL
  const { searchParams } = new URL(req.url);
  const currency = (searchParams.get('currency') as Currency) || 'EUR';
  const appid = searchParams.get('appid') || '730'; // 730 = CS2 par défaut

  // Mapping des appids vers les jeux
  const gameConfigs = {
    '730': { name: 'CS2', contextid: '2' },
    '570': { name: 'Dota2', contextid: '2' },
    '252490': { name: 'Rust', contextid: '2' },
    '440': { name: 'TF2', contextid: '2' },
  };

  const gameConfig = gameConfigs[appid as keyof typeof gameConfigs];
  if (!gameConfig) {
    return NextResponse.json({ error: 'Jeu non supporté' }, { status: 400 });
  }

  const url = `https://steamcommunity.com/inventory/${steamId}/${appid}/${gameConfig.contextid}?l=english&count=1000`;

  console.log(`[INVENTORY] Fetching ${gameConfig.name} inventory for SteamID: ${steamId}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log(`[INVENTORY] Response status for ${gameConfig.name}:`, response.status, response.statusText);

    if (!response.ok) {
      console.error(`[INVENTORY] Steam API error for ${gameConfig.name}:`, response.status, response.statusText);
      
      // Gestion spécifique des erreurs Steam
      if (response.status === 403) {
        return NextResponse.json({ 
          error: `Inventaire ${gameConfig.name} privé ou non accessible. Vérifiez que votre profil Steam est public.`,
          game: gameConfig.name 
        }, { status: 403 });
      }
      
      if (response.status === 404) {
        return NextResponse.json({ 
          error: `Aucun inventaire ${gameConfig.name} trouvé pour ce compte Steam.`,
          game: gameConfig.name 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: `Erreur Steam (${response.status}): ${response.statusText}`,
        game: gameConfig.name 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log(`[INVENTORY] Data received for ${gameConfig.name}:`, {
      hasAssets: !!data?.assets,
      hasDescriptions: !!data?.descriptions,
      assetsCount: data?.assets?.length || 0,
      descriptionsCount: data?.descriptions?.length || 0
    });

    if (!data || !data.assets || !data.descriptions) {
      console.warn(`[INVENTORY] No data for ${gameConfig.name} inventory`);
      return NextResponse.json({ 
        items: [], 
        game: gameConfig.name,
        message: `Aucun inventaire ${gameConfig.name} disponible`
      });
    }

    // Blacklist des types à exclure (spécifique par jeu)
    const EXCLUDED_TYPES = appid === '730' ? [
      'Graffiti',
      'Patch',
      'Music Kit',
      'Collectible',
      'Gift',
      'Coupon',
    ] : appid === '570' ? [
      'Treasure',
      'Bundle',
      'Gift',
      'Coupon',
    ] : appid === '252490' ? [
      'Blueprint',
      'Gift',
      'Coupon',
    ] : appid === '440' ? [
      'Gift',
      'Coupon',
      'Tool',
    ] : [];

    // On ne garde que les items tradables, marketables, et non exclus
    const filteredAssets = data.assets.filter((asset: any) => {
      const desc = data.descriptions.find(
        (d: any) => d.classid === asset.classid && d.instanceid === asset.instanceid
      );
      if (!desc) return false;
      if (desc.tradable !== 1) return false;
      if (desc.marketable !== 1) return false;
      if (EXCLUDED_TYPES.some(type => desc.type && desc.type.includes(type))) return false;
      return true;
    });

    const uniqueNames = new Set<string>();
    const priceMap: Record<string, number> = {};
    const namesToFetch: string[] = [];
    for (const asset of filteredAssets) {
      const desc = data.descriptions.find(
        (d: any) => d.classid === asset.classid && d.instanceid === asset.instanceid
      );
      const name = desc?.market_hash_name || 'Unknown Item';
      if (!uniqueNames.has(name)) {
        uniqueNames.add(name);
        namesToFetch.push(name);
      }
    }

    // Parallélisation contrôlée des fetchs de prix
    const limit = pLimit(8); // 8 fetchs max en parallèle
    await Promise.all(
      namesToFetch.map(name =>
        limit(() => getSteamMarketPrice(name, currency).then(price => { priceMap[name] = price; }))
      )
    );

    // Génération des items (affichage immédiat possible côté frontend, même si marketPrice=0)
    const items = filteredAssets.map((asset: any) => {
      const desc = data.descriptions.find(
        (d: any) => d.classid === asset.classid && d.instanceid === asset.instanceid
      );
      const name = desc?.market_hash_name || 'Unknown Item';
      const marketPrice = priceMap[name] || 0;
      // Extraction du code de rareté (internal_name du tag Rarity)
      let rarityCode = undefined;
      if (desc?.tags && Array.isArray(desc.tags)) {
        const rarityTag = desc.tags.find((tag: any) => tag.category === 'Rarity');
        if (rarityTag && rarityTag.internal_name) {
          rarityCode = rarityTag.internal_name;
        }
      }
      return {
        id: asset.assetid,
        name,
        icon: `https://steamcommunity-a.akamaihd.net/economy/image/${desc?.icon_url}/300x300`,
        marketPrice,
        float: undefined,
        csfloatLink: undefined,
        rarityCode,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erreur lors du chargement de l'inventaire Steam", error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}