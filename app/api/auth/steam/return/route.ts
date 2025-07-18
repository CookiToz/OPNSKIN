import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

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

    // Création automatique de l'utilisateur si inexistant, avec infos Steam enrichies
    const { data: user, error } = await supabase
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
      const { error: insertError } = await supabase.from('User').insert([{ steamId, name: steamInfo.name, avatar: steamInfo.avatar, profileUrl: steamInfo.profileUrl }]);
      if (insertError) {
        console.error('[STEAM OPENID] Error inserting user:', insertError);
      } else {
        console.log('[STEAM OPENID] New user created for SteamID:', steamId, steamInfo);
      }
    }

    // Récupération du domaine depuis les headers de la requête
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    // Redirection vers le domaine Vercel après authentification réussie
    const response = NextResponse.redirect(`${baseUrl}/`);

    // Configuration du cookie pour le domaine Vercel
    response.cookies.set('steamid', steamId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true seulement en production
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
