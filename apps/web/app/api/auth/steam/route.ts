import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Récupération du domaine depuis les headers de la requête
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    console.log('[STEAM AUTH] Using base URL:', baseUrl);

    // Construction de l'URL Steam OpenID avec nonce anti-replay
    const steamLoginUrl = new URL("https://steamcommunity.com/openid/login");
    const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
    steamLoginUrl.search = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": `${baseUrl}/api/auth/steam/return?nonce=${encodeURIComponent(nonce)}`,
      "openid.realm": baseUrl,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
    }).toString();

    console.log('[STEAM AUTH] Redirecting to Steam OpenID:', steamLoginUrl.toString());
    return NextResponse.redirect(steamLoginUrl.toString());
  } catch (error) {
    console.error('[STEAM AUTH] Error in auth route:', error);
    return NextResponse.redirect('/login?error=internal');
  }
}
