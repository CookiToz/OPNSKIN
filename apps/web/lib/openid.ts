// OpenID 2.0 verification helper for Steam

type VerifyResult = { valid: boolean };

// Simple in-memory nonce store to prevent replay for a short time window
const seenNonces = new Map<string, number>();
const NONCE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function rememberNonce(nonce: string): boolean {
  const now = Date.now();
  // Cleanup
  for (const [k, ts] of Array.from(seenNonces.entries())) {
    if (now - ts > NONCE_TTL_MS) seenNonces.delete(k);
  }
  if (seenNonces.has(nonce)) return false;
  seenNonces.set(nonce, now);
  return true;
}

export async function verifySteamOpenID(params: URLSearchParams): Promise<VerifyResult> {
  const endpoint = 'https://steamcommunity.com/openid/login';
  const body = new URLSearchParams(params);
  body.set('openid.mode', 'check_authentication');

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const text = await res.text();
    const isValid = /is_valid\s*:\s*true/.test(text);
    return { valid: isValid };
  } catch {
    return { valid: false };
  }
}

export function validateOpenIDNonce(responseNonce: string | null): boolean {
  if (!responseNonce) return false;
  return rememberNonce(responseNonce);
}


