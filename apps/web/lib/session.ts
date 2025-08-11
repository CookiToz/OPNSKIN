import type { NextRequest } from 'next/server';
import crypto from 'node:crypto';

// Lightweight HMAC-signed session token storing steamId
// Format: base64url(json).base64url(hmac)

const DEFAULT_SECRET = 'dev-session-secret-change-me';

function getSecret(): string {
  return process.env.SESSION_SECRET || DEFAULT_SECRET;
}

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function signSession(steamId: string, maxAgeSec: number = 60 * 60 * 24 * 7): string {
  const header = { alg: 'HS256', typ: 'OPN' };
  const payload = {
    sid: steamId,
    exp: Math.floor(Date.now() / 1000) + maxAgeSec,
  };
  const head = base64url(JSON.stringify(header));
  const body = base64url(JSON.stringify(payload));
  const data = `${head}.${body}`;
  const h = crypto.createHmac('sha256', getSecret()).update(data).digest();
  const sig = base64url(h);
  return `${data}.${sig}`;
}

export function verifySession(token: string | undefined | null): { valid: boolean; steamId?: string } {
  if (!token) return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false };
  const [head, body, sig] = parts;
  const data = `${head}.${body}`;
  const expected = base64url(crypto.createHmac('sha256', getSecret()).update(data).digest());
  if (sig !== expected) return { valid: false };
  try {
    const json = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (json.exp && typeof json.exp === 'number' && json.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }
    if (typeof json.sid !== 'string' || json.sid.length === 0) return { valid: false };
    return { valid: true, steamId: json.sid };
  } catch {
    return { valid: false };
  }
}

export function getSteamIdFromRequest(req: NextRequest): string | null {
  // Prefer signed session cookie
  const sid = req.cookies.get('sid')?.value;
  const v = verifySession(sid);
  if (v.valid && v.steamId) return v.steamId;
  // Fallback to legacy cookie
  return req.cookies.get('steamid')?.value || null;
}


