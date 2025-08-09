import { NextRequest, NextResponse } from 'next/server';
import { fetchWithProxy } from '@/lib/proxy';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url') || 'https://ipv4.webshare.io/';
    const start = Date.now();
    const res = await fetchWithProxy(url, {
      headers: {
        'Accept-Encoding': 'identity',
        'User-Agent': 'OPNSKIN/1.0 (+fetchWithProxy)'
      },
      maxRetries: 1,
      backoffBaseMs: 300,
      signal: (AbortSignal as any).timeout?.(Number(process.env.PROXY_FETCH_TIMEOUT_MS || 15000))
    });
    const ct = res.headers.get('content-type') || '';
    const text = await res.text();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      contentType: ct,
      ms: Date.now() - start,
      sample: text.slice(0, 500)
    }, { status: res.ok ? 200 : res.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 502 });
  }
}


