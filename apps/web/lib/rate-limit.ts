// Simple in-memory rate limiter (IP + userId) with sliding window

type Key = string;

const buckets = new Map<Key, { count: number; ts: number }>();

export function rateLimit(key: Key, limit: number, windowMs: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.ts > windowMs) {
    buckets.set(key, { count: 1, ts: now });
    return { allowed: true };
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfter: windowMs - (now - bucket.ts) };
  }
  bucket.count++;
  return { allowed: true };
}


