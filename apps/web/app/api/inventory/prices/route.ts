import { NextRequest, NextResponse } from 'next/server';
import { getSteamIdFromRequest } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';
import pLimit from 'p-limit';

const STEAM_CACHE_MS = 1000 * 60 * 60 * 6; // 6h
const PARALLEL = 4; // réduire pression sur Steam
const STEP_DELAY_MS = 200; // délai un peu plus long

const memoryCache = new Map<string, { price: number; ts: number }>();

async function fetchPrice(name: string, currency: string): Promise<number> {
  const now = Date.now();
  const key = `${currency}:${name}`;
  const cached = memoryCache.get(key);
  if (cached && now - cached.ts < STEAM_CACHE_MS) return cached.price;

  const currencyMap: Record<string, number> = { EUR: 3, USD: 1, GBP: 2, RUB: 5, CNY: 23 };
  const steamCurrency = currencyMap[currency] || 3;
  const url = `https://steamcommunity.com/market/priceoverview/?currency=${steamCurrency}&appid=730&market_hash_name=${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity'
      },
      cache: 'no-store'
    });
    if (!res.ok) return 0;
    const json = await res.json().catch(() => ({}));
    let price = 0;
    if (json.lowest_price) {
      const match = String(json.lowest_price).replace(',', '.').replace(/[^0-9.]/g, '');
      price = parseFloat(match);
      if (isNaN(price)) price = 0;
    }
    const adjusted = Math.round(price * 0.75 * 100) / 100;
    const finalPrice = adjusted > 0 ? adjusted : 0;
    memoryCache.set(key, { price: finalPrice, ts: now });
    return finalPrice;
  } catch {
    return 0;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require authenticated user to fetch prices (prevents abuse)
    const steamId = getSteamIdFromRequest(req);
    if (!steamId) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    // Rate limit per user and IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const keyUser = `prices:${steamId}`;
    const keyIp = `pricesip:${ip}`;
    const u = rateLimit(keyUser, 10, 60_000);
    const i = rateLimit(keyIp, 40, 60_000);
    if (!u.allowed || !i.allowed) {
      const retry = Math.max(u.retryAfter || 0, i.retryAfter || 0);
      return NextResponse.json({ error: 'Rate limit', retryAfter: retry }, { status: 429 });
    }

    const { names, currency = 'EUR' } = await req.json();
    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ prices: {} });
    }
    const limit = pLimit(PARALLEL);
    const results: Record<string, number> = {};
    await Promise.all(
      names.map((name: string, i: number) =>
        limit(() => new Promise<void>(resolve => {
          setTimeout(async () => {
            results[name] = await fetchPrice(name, currency);
            resolve();
          }, Math.floor(i / PARALLEL) * STEP_DELAY_MS);
        }))
      )
    );
    return NextResponse.json({ prices: results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'failed' }, { status: 500 });
  }
}


