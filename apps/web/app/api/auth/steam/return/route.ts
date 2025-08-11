import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    // Vérification des variables d'environnement avec gestion de la faute de frappe
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERCE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[STEAM OPENID] Missing Supabase environment variables');
      console.error('[STEAM OPENID] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
      console.error('[STEAM OPENID] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING');
      console.error('[STEAM OPENID] SUPABASE_SERCE_ROLE_KEY:', process.env.SUPABASE_SERCE_ROLE_KEY ? 'OK' : 'MISSING');
      return NextResponse.redirect(new URL('/login?error=config', req.url));
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Basic OpenID anti-replay: validate "return_to" against our host
    const returnTo = searchParams.get('openid.return_to');
    if (returnTo) {
      try {
        const rt = new URL(returnTo);
        const host = req.headers.get('host') || '';
        if (rt.host !== host) {
          return NextResponse.redirect(new URL('/login?error=invalid_return_to', req.url));
        }
      } catch {
        return NextResponse.redirect(new URL('/login?error=invalid_return_to', req.url));
      }
    }

    // Log des paramètres pour debug
    console.log('[STEAM OPENID] Received params:', Object.fromEntries(searchParams.entries()));

    // Extraction directe du SteamID depuis openid.claimed_id selon la documentation Steam
    const claimedId = searchParams.get('openid.claimed_id');
    
    if (!claimedId) {
      console.error('[STEAM OPENID] Missing openid.claimed_id parameter');
      return NextResponse.redirect(new URL('/login?error=missing_params', req.url));
    }

    // Extraction du SteamID avec validation selon le format Steam : https://steamcommunity.com/openid/id/<steamid>
    const steamIdMatch = claimedId.match(/(?:https?:\/\/)?steamcommunity\.com\/openid\/id\/(\d+)/);
    
    if (!steamIdMatch || !steamIdMatch[1]) {
      console.error('[STEAM OPENID] SteamID not found in claimed_id:', claimedId);
      return NextResponse.redirect(new URL('/login?error=nosteamid', req.url));
    }

    const steamId = steamIdMatch[1];
    console.log('[STEAM OPENID] Successfully extracted SteamID:', steamId);

    // Création automatique de l'utilisateur si inexistant, avec infos Steam enrichies
    const { data: user, error } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('steamId', steamId)
      .single();

    if (!user) {
      let steamInfo = {
        name: `Steam User (${steamId})`,
        avatar: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default/${steamId.slice(-1)}.jpg`,
        profileUrl: `https://steamcommunity.com/profiles/${steamId}`
      };
      const apiKey = process.env.STEAM_API_KEY;
      console.log('[STEAM OPENID] API KEY:', apiKey ? 'OK' : 'MISSING');
      if (apiKey) {
        try {
          const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
          console.log('[STEAM OPENID] Fetching Steam profile:', steamApiUrl);
          const res = await fetch(steamApiUrl);
          console.log('[STEAM OPENID] Steam API response status:', res.status);
          if (res.ok) {
            const data = await res.json();
            console.log('[STEAM OPENID] Steam API data:', JSON.stringify(data));
            const player = data?.response?.players?.[0];
            if (player) {
              steamInfo = {
                name: player.personaname,
                avatar: player.avatarfull,
                profileUrl: player.profileurl
              };
              console.log('[STEAM OPENID] Player found:', steamInfo);
            } else {
              console.log('[STEAM OPENID] No player found in API response');
            }
          } else {
            console.log('[STEAM OPENID] Steam API call failed');
          }
        } catch (err) {
          console.error('[STEAM OPENID] Error fetching Steam profile:', err);
        }
      }
      const { error: insertError } = await supabaseAdmin.from('User').insert([{ steamId, name: steamInfo.name, avatar: steamInfo.avatar, profileUrl: steamInfo.profileUrl }]);
      if (insertError) {
        console.error('[STEAM OPENID] Error inserting user:', insertError);
      } else {
        console.log('[STEAM OPENID] New user created for SteamID:', steamId, steamInfo);
      }
    }

    // Récupération du domaine depuis les headers de la requête
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Redirection vers le domaine Vercel après authentification réussie
    const response = NextResponse.redirect(new URL('/', baseUrl));

    // Configuration du cookie pour le domaine Vercel
    // Legacy cookie for compatibility (will be phased out)
    response.cookies.set('steamid', steamId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    // New signed session cookie
    const token = signSession(steamId);
    response.cookies.set('sid', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log('[STEAM OPENID] Authentication successful, redirecting to:', baseUrl);
    return response;

  } catch (error) {
    console.error('[STEAM OPENID] Unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=internal', req.url));
  }
}
