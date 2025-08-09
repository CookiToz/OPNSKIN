import type { Dispatcher, RequestInit } from 'undici';
import { ProxyAgent } from 'undici';

type FetchInit = RequestInit & { headers?: Record<string, string> };

// In-memory state (per instance)
const failedProxyUntil: Map<string, number> = new Map();
const lastRequestPerHost: Map<string, number> = new Map();

function getEnv(name: string, fallback?: string): string | undefined {
  const v = process.env[name];
  return (v === undefined || v === '') ? fallback : v;
}

function now() { return Date.now(); }

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

function getProxyPool(): string[] {
  const pool = getEnv('PROXY_POOL');
  if (!pool) return [];
  return pool.split(',').map(s => s.trim()).filter(Boolean);
}

function getRotatingProxy(): string | undefined {
  return getEnv('WEBSHARE_PROXY_URL') || getEnv('ROTATING_PROXY_URL');
}

let poolIndex = 0;
function pickProxy(): string | undefined {
  const strategy = (getEnv('PROXY_ROTATION_STRATEGY', 'rotating') || 'rotating').toLowerCase();
  const blockTtlMs = Number(getEnv('PROXY_BLOCK_TTL_MS', '600000')); // 10 min

  if (strategy === 'pool') {
    const pool = getProxyPool();
    if (pool.length === 0) return getRotatingProxy();
    for (let i = 0; i < pool.length; i++) {
      const idx = (poolIndex + i) % pool.length;
      const proxy = pool[idx];
      const blockedUntil = failedProxyUntil.get(proxy) || 0;
      if (blockedUntil <= now()) {
        poolIndex = (idx + 1) % pool.length;
        return proxy;
      }
    }
    // if all blocked, clear expired
    for (const [p, t] of failedProxyUntil) {
      if (t <= now()) failedProxyUntil.delete(p);
    }
    return getRotatingProxy();
  }
  return getRotatingProxy();
}

function markProxyAsFailed(proxy: string | undefined) {
  if (!proxy) return;
  const blockTtlMs = Number(getEnv('PROXY_BLOCK_TTL_MS', '600000'));
  failedProxyUntil.set(proxy, now() + blockTtlMs);
}

function buildDispatcher(proxyUrl?: string): Dispatcher | undefined {
  if (!proxyUrl) return undefined;
  try {
    return new ProxyAgent(proxyUrl);
  } catch {
    return undefined;
  }
}

function shouldThrottle(host: string) {
  const minDelay = Number(getEnv('PROXY_REQUEST_MIN_DELAY_MS', '1100'));
  const last = lastRequestPerHost.get(host) || 0;
  const wait = Math.max(0, minDelay - (now() - last));
  return wait;
}

export type FetchWithProxyOptions = FetchInit & {
  context?: string; // e.g., 'steam-inventory'
  maxRetries?: number;
  backoffBaseMs?: number;
};

export async function fetchWithProxy(url: string, init: FetchWithProxyOptions = {}) {
  const host = new URL(url).host;
  const maxRetries = init.maxRetries ?? Number(getEnv('PROXY_MAX_RETRIES', '3'));
  const backoffBase = init.backoffBaseMs ?? Number(getEnv('PROXY_BACKOFF_BASE_MS', '500'));

  let attempt = 0;
  let lastError: any;

  while (attempt <= maxRetries) {
    const proxy = pickProxy();
    const dispatcher = buildDispatcher(proxy);

    const wait = shouldThrottle(host);
    if (wait > 0) await sleep(wait);

    try {
      const controller = new AbortController();
      const timeoutMs = Number(getEnv('PROXY_FETCH_TIMEOUT_MS', '15000'));
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, {
        ...init,
        dispatcher,
        signal: init.signal || controller.signal,
      } as RequestInit & { dispatcher?: Dispatcher });
      clearTimeout(timeout);

      lastRequestPerHost.set(host, now());

      // Clone to inspect text for captcha while keeping stream for caller
      const textSample = await res.clone().text().catch(() => '');
      const status = res.status;
      const isBlocked = status === 429 || status === 403 || /captcha|access denied|forbidden/i.test(textSample);
      if (isBlocked) {
        markProxyAsFailed(proxy);
        throw new Error(`Proxy/Steam blocked (${status})`);
      }

      if (!res.ok) {
        throw new Error(`Bad status ${status}`);
      }

      return res;
    } catch (e: any) {
      lastError = e;
      attempt += 1;
      const backoff = Math.min(5000, backoffBase * Math.pow(2, attempt - 1));
      await sleep(backoff);
      continue;
    }
  }

  throw lastError || new Error('fetchWithProxy failed');
}


