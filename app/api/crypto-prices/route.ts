import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana,ripple,litecoin,tron,game-market-coin&vs_currencies=eur,usd';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(COINGECKO_URL, {
      headers: {
        'Accept': 'application/json',
      },
      // Important: force le fetch côté serveur
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Erreur API CoinGecko' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur CoinGecko' }, { status: 500 });
  }
} 