import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Log des paramètres pour debug
    console.log('[STEAM OPENID] Received params:', Object.fromEntries(searchParams.entries()));

    // Extraction directe du SteamID depuis openid.claimed_id selon la documentation Steam
    const claimedId = searchParams.get('openid.claimed_id');
    
    if (!claimedId) {
      console.error('[STEAM OPENID] Missing openid.claimed_id parameter');
      return NextResponse.redirect('/login?error=missing_params');
    }

    // Extraction du SteamID avec validation selon le format Steam : https://steamcommunity.com/openid/id/<steamid>
    const steamIdMatch = claimedId.match(/(?:https?:\/\/)?steamcommunity\.com\/openid\/id\/(\d+)/);
    
    if (!steamIdMatch || !steamIdMatch[1]) {
      console.error('[STEAM OPENID] SteamID not found in claimed_id:', claimedId);
      return NextResponse.redirect('/login?error=nosteamid');
    }

    const steamId = steamIdMatch[1];
    console.log('[STEAM OPENID] Successfully extracted SteamID:', steamId);

    // Redirection vers localhost après authentification réussie
    const response = NextResponse.redirect('http://localhost:3000');

    // Configuration du cookie pour localhost
    response.cookies.set('steamid', steamId, {
      httpOnly: true,
      secure: false, // false pour localhost HTTP
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    console.log('[STEAM OPENID] Authentication successful, redirecting to localhost');
    return response;

  } catch (error) {
    console.error('[STEAM OPENID] Unexpected error:', error);
    return NextResponse.redirect('/login?error=internal');
  }
}
