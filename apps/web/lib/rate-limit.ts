// Simple in-memory rate limiter with sliding window per key
type Key = string;

const buckets = new Map<Key, { count: number; ts: number }>();

export function rateLimit(
  key: Key,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.ts > windowMs) {
    buckets.set(key, { count: 1, ts: now });
    return { allowed: true };
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfter: Math.max(0, windowMs - (now - bucket.ts)) };
  }
  bucket.count++;
  return { allowed: true };
}

// Helper to extract a stable client IP from common headers
export function extractClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff && xff.length > 0) {
    // first IP in the list
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const xri = headers.get('x-real-ip');
  if (xri) return xri;
  const cfip = headers.get('cf-connecting-ip');
  if (cfip) return cfip;
  return 'ip:unknown';
}


