import { createClient } from '@supabase/supabase-js';
import { fetchWithProxy } from '@/lib/proxy';
import pLimit from 'p-limit';

// Configuration
const CACHE_DURATION = 60 * 1000; // 60 secondes (informationnelle)
const STEAM_THROTTLE_DELAY = 500; // 500ms entre requêtes Steam
const MAX_PARALLEL_REQUESTS = 4; // 4 requêtes max en parallèle

// Cache des prix Steam
const steamPriceCache = new Map<string, { [currency: string]: { price: number; timestamp: number } }>();
const STEAM_CACHE_DURATION = 1000 * 60 * 60 * 6; // 6h

// Fonction helper pour créer le client Supabase
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERCE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('supabaseKey is required.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Fonction pour récupérer les prix Steam avec cache
async function getSteamMarketPrice(name: string, currency: string): Promise<number> {
  const now = Date.now();
  const cached = steamPriceCache.get(name)?.[currency];
  const isFresh = cached && (now - cached.timestamp < STEAM_CACHE_DURATION);

  if (isFresh) return cached!.price;

  try {
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
    
    // Appliquer décote 25%
    const adjusted = Math.round(price * 0.75 * 100) / 100;
    if (adjusted > 0) {
      if (!steamPriceCache.has(name)) steamPriceCache.set(name, {});
      steamPriceCache.get(name)![currency] = { price: adjusted, timestamp: now };
      return adjusted;
    } else {
      if (cached) return cached.price;
      return 0;
    }
  } catch (e) {
    if (cached) return cached.price;
    return 0;
  }
}

// Helper: fetch JSON via proxy avec fallback direct si besoin
async function fetchSteamJson(url: string): Promise<any> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'identity',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  } as Record<string, string>;

  const useProxy = (process.env.PROXY_STEAM_ENABLED || 'true').toLowerCase() !== 'false';

  // 1) Essai via proxy (si activé)
  if (useProxy) {
    try {
      const res = await fetchWithProxy(url, {
        headers,
        context: 'steam-inventory',
        maxRetries: 4,
        backoffBaseMs: 700,
        signal: (AbortSignal as any).timeout?.(Number(process.env.PROXY_FETCH_TIMEOUT_MS || 15000))
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const s = await res.text().catch(()=>'');
        throw new Error(`non-json via proxy (${ct}) sample=${s.slice(0,120)}`);
      }
      return await res.json();
    } catch (e) {
      console.warn('[INVENTORY CACHE] proxy fetch failed, will try direct:', String(e));
    }
  }

  // 2) Fallback direct (single try)
  const direct = await fetch(url, {
    headers,
    signal: (AbortSignal as any).timeout?.(Number(process.env.PROXY_FETCH_TIMEOUT_MS || 15000))
  });
  const ctd = direct.headers.get('content-type') || '';
  if (!ctd.includes('application/json')) {
    const s = await direct.text().catch(()=> '');
    throw new Error(`non-json direct (${ctd}) sample=${s.slice(0,120)}`);
  }
  return await direct.json();
}

// Fonction pour récupérer l'inventaire depuis Steam (pagination & fallback)
async function fetchInventoryFromSteam(steamId: string, appid: string, gameConfig: any): Promise<any> {
  console.log(`[INVENTORY CACHE] Fetching ${gameConfig.name} inventory for SteamID: ${steamId}`);

  const base = `https://steamcommunity.com/inventory/${steamId}/${appid}/${gameConfig.contextid}?l=english&count=100`;
  let more = true;
  let start_assetid: string | undefined;
  const merged = { assets: [] as any[], descriptions: [] as any[] };
  let safety = 0;

  while (more && safety < 15) {
    safety++;
    const url = start_assetid ? `${base}&start_assetid=${start_assetid}` : base;
    const page = await fetchSteamJson(url);
    if (page?.assets?.length) merged.assets.push(...page.assets);
    if (page?.descriptions?.length) merged.descriptions.push(...page.descriptions);
    more = !!page?.more;
    start_assetid = page?.last_assetid;
  }

  return merged;
}

// Fonction principale pour récupérer ou mettre en cache l'inventaire
export async function getOrFetchInventory(
  steamId: string,
  appid: string = '730',
  currency: string = 'EUR',
  options: { forceFresh?: boolean; preferCache?: boolean } = { forceFresh: false, preferCache: true }
): Promise<{
  items: any[];
  lastUpdated: number;
  stale?: boolean;
  message?: string;
}> {
  const supabase = createSupabaseClient();
  const now = Date.now();
  
  // Configuration du jeu
  const gameConfigs = {
    '730': { name: 'CS2', contextid: '2' },
    '570': { name: 'Dota2', contextid: '2' },
    '252490': { name: 'Rust', contextid: '2' },
    '440': { name: 'TF2', contextid: '2' },
  };
  
  const gameConfig = gameConfigs[appid as keyof typeof gameConfigs];
  if (!gameConfig) {
    throw new Error('Jeu non supporté');
  }
  
  // 1. Vérifier le cache en base de données
  const cacheKey = `${steamId}-${appid}-${currency}`;
  const { data: cachedData } = await supabase
    .from('InventoryCache')
    .select('*')
    .eq('steamId', steamId)
    .eq('gameId', appid)
    .eq('currency', currency)
    .single();
  
  // 2. Si le cache existe et qu'on préfère le cache (comportement par défaut), le retourner
  if (cachedData && !options.forceFresh && options.preferCache !== false) {
    console.log(`[INVENTORY CACHE] Using cached data for ${gameConfig.name} (preferCache)`);
    return {
      items: cachedData.data.items || [],
      lastUpdated: Math.floor((now - new Date(cachedData.updatedAt).getTime()) / 1000)
    };
  }
  
  // 3. Sinon, essayer de récupérer depuis Steam
  try {
    console.log(`[INVENTORY CACHE] Fetching fresh data for ${gameConfig.name}`);
    
    const steamData = await fetchInventoryFromSteam(steamId, appid, gameConfig);
    
    if (!steamData || !steamData.assets || !steamData.descriptions) {
      throw new Error('Aucun inventaire disponible');
    }
    
    // Blacklist des types à exclure
    const EXCLUDED_TYPES = appid === '730' ? [
      'Graffiti', 'Patch', 'Music Kit', 'Collectible', 'Gift', 'Coupon',
    ] : appid === '570' ? [
      'Treasure', 'Bundle', 'Gift', 'Coupon',
    ] : appid === '252490' ? [
      'Blueprint', 'Gift', 'Coupon',
    ] : appid === '440' ? [
      'Gift', 'Coupon', 'Tool',
    ] : [];
    
    // Helper pour trouver la description (fallback si instanceid ne matche pas)
    const findDesc = (asset: any) => {
      let d = steamData.descriptions.find(
        (x: any) => x.classid === asset.classid && x.instanceid === asset.instanceid
      );
      if (!d) {
        d = steamData.descriptions.find((x: any) => x.classid === asset.classid);
      }
      return d;
    };

    // Filtrer les assets
    const filteredAssets = steamData.assets.filter((asset: any) => {
      const desc = findDesc(asset);
      if (!desc) return false;
      if (desc.tradable !== 1) return false;
      if (desc.marketable !== 1) return false;
      if (EXCLUDED_TYPES.some(type => desc.type && desc.type.includes(type))) return false;
      return true;
    });
    
    // FAST INVENTORY: on ne calcule pas les prix dans le chemin critique.
    // Les prix seront résolus côté client via /api/inventory/prices
    const computePricesInline = (process.env.FAST_INVENTORY || 'true').toLowerCase() === 'false';
    const priceMap: Record<string, number> = {};
    if (computePricesInline) {
      const uniqueNames = new Set<string>();
      const namesToFetch: string[] = [];
      for (const asset of filteredAssets) {
        const desc = findDesc(asset);
        const name = desc?.market_hash_name || 'Unknown Item';
        if (!uniqueNames.has(name)) {
          uniqueNames.add(name);
          namesToFetch.push(name);
        }
      }
      const limit = pLimit(MAX_PARALLEL_REQUESTS);
      await Promise.all(
        namesToFetch.map((name, index) =>
          limit(() => 
            new Promise(resolve => {
              setTimeout(() => {
                getSteamMarketPrice(name, currency).then(price => { 
                  priceMap[name] = price; 
                  resolve(undefined);
                });
              }, index * STEAM_THROTTLE_DELAY);
            })
          )
        )
      );
    }
    
    // Générer les items
    const items = filteredAssets.map((asset: any) => {
      const desc = findDesc(asset);
      const name = desc?.market_hash_name || 'Unknown Item';
      const marketPrice = computePricesInline ? (priceMap[name] || 0) : undefined;
      
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
    
    // 4. Sauvegarder en cache
    const cacheData = {
      items,
      steamData: {
        assets: steamData.assets,
        descriptions: steamData.descriptions
      }
    };
    
    // Remplacer l'ancien en deux étapes pour éviter les exigences de contrainte unique
    await supabase
      .from('InventoryCache')
      .delete()
      .eq('steamId', steamId)
      .eq('gameId', appid)
      .eq('currency', currency);
    await supabase
      .from('InventoryCache')
      .insert({
        id: (globalThis.crypto?.randomUUID?.() || require('node:crypto').randomUUID()),
        steamId,
        gameId: appid,
        currency,
        data: cacheData,
        updatedAt: new Date().toISOString()
      });
    
    console.log(`[INVENTORY CACHE] Saved fresh data for ${gameConfig.name}`);
    
    return {
      items,
      lastUpdated: 0
    };
    
  } catch (error) {
    console.error(`[INVENTORY CACHE] Error fetching from Steam:`, error);
    
    // 5. Si erreur Steam ET cache existe, retourner le cache avec flag stale
    if (cachedData) {
      console.log(`[INVENTORY CACHE] Returning stale cache due to Steam error`);
      return {
        items: cachedData.data.items || [],
        lastUpdated: Math.floor((now - new Date(cachedData.updatedAt).getTime()) / 1000),
        stale: true,
        message: "Inventaire temporairement indisponible, ancienne version affichée."
      };
    }
    
    // 6. Sinon, retourner une erreur propre
    throw new Error(error instanceof Error ? error.message : 'Erreur lors du chargement de l\'inventaire');
  }
} 