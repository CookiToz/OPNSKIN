import { NextRequest, NextResponse } from 'next/server';

const floatCache = new Map<string, { float: number; csfloatLink?: string; timestamp: number }>();
const FLOAT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let lastFloatFetch = 0;
const FLOAT_MIN_INTERVAL = 1000; // 1 second between requests

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('market_hash_name');
  if (!name) return NextResponse.json({ error: 'Missing market_hash_name' }, { status: 400 });

  const now = Date.now();
  const cached = floatCache.get(name);
  if (cached && now - cached.timestamp < FLOAT_CACHE_DURATION) {
    return NextResponse.json({ float: cached.float, csfloatLink: cached.csfloatLink });
  }
  if (now - lastFloatFetch < FLOAT_MIN_INTERVAL) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  lastFloatFetch = now;

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
      return NextResponse.json({ error: errorText }, { status: res.status });
    }
    const json = await res.json();
    const listing = json?.results?.[0];
    const float = listing?.float_value || 0;
    const csfloatLink = listing?._id ? `https://csfloat.com/item/${listing._id}` : undefined;
    floatCache.set(name, { float, csfloatLink, timestamp: now });
    return NextResponse.json({ float, csfloatLink });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur CSFloat' }, { status: 500 });
  }
} 