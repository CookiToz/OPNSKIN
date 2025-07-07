import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Log des paramètres pour debug
    console.log('[STEAM OPENID] Received params:', Object.fromEntries(searchParams.entries()));

    // Vérification si l'utilisateur est déjà connecté
    const existingSteamId = req.cookies.get('steamid')?.value;
    if (existingSteamId) {
      console.log('[STEAM OPENID] User already logged in with SteamID:', existingSteamId);
      // Redirection vers la page d'accueil si déjà connecté
      const host = req.headers.get('host');
      const protocol = req.headers.get('x-forwarded-proto') || 'https';
      const baseUrl = `${protocol}://${host}`;
      return NextResponse.redirect(`${baseUrl}/`);
    }

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

    // Récupération du domaine depuis les headers de la requête
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    // Redirection vers le domaine Vercel après authentification réussie
    const response = NextResponse.redirect(`${baseUrl}/`);

    // Configuration du cookie pour le domaine Vercel
    response.cookies.set('steamid', steamId, {
      httpOnly: true,
      secure: true, // true pour HTTPS en production
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    console.log('[STEAM OPENID] Authentication successful, redirecting to:', baseUrl);
    return response;

  } catch (error) {
    console.error('[STEAM OPENID] Unexpected error:', error);
    return NextResponse.redirect('/login?error=internal');
  }
}
