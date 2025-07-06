// app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting par IP pour éviter l'abus
const rateLimitMap = new Map<string, number>();
const STEAM_PROFILE_MIN_INTERVAL = 2000; // 2 seconds between requests

export async function GET(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  try {
    // Rate limiting par IP
    const lastRequest = rateLimitMap.get(clientIp) || 0;
    if (now - lastRequest < STEAM_PROFILE_MIN_INTERVAL) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please wait before retrying.',
        loggedIn: false 
      }, { status: 429 });
    }
    rateLimitMap.set(clientIp, now);

    const steamId = req.cookies.get('steamid')?.value;
    const apiKey = process.env.STEAM_API_KEY;

    if (!steamId) {
      return NextResponse.json({ loggedIn: false });
    }

    if (!apiKey) {
      console.error('[STEAM API] Missing STEAM_API_KEY environment variable');
      return NextResponse.json({ 
        loggedIn: true, 
        steamId,
        error: 'Steam API not configured'
      });
    }

    // Validation du SteamID
    if (!/^\d{17}$/.test(steamId)) {
      console.error('[STEAM API] Invalid SteamID format:', steamId);
      return NextResponse.json({ 
        loggedIn: false,
        error: 'Invalid SteamID format'
      });
    }

    const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;

    console.log('[STEAM API] Fetching profile for SteamID:', steamId);

    const res = await fetch(steamApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      console.error('[STEAM API] Steam API request failed:', res.status, res.statusText);
      return NextResponse.json({ 
        loggedIn: true, 
        steamId,
        error: 'Steam API unavailable'
      });
    }

    const data = await res.json();
    const player = data?.response?.players?.[0];

    if (!player) {
      console.warn('[STEAM API] No player data found for SteamID:', steamId);
      return NextResponse.json({ 
        loggedIn: true, 
        steamId,
        error: 'Player profile not found'
      });
    }

    console.log('[STEAM API] Successfully fetched profile for:', player.personaname);

    return NextResponse.json({
      loggedIn: true,
      steamId,
      name: player.personaname,
      avatar: player.avatarfull,
      profileUrl: player.profileurl,
    });

  } catch (error) {
    console.error('[STEAM API] Unexpected error:', error);
    return NextResponse.json({ 
      loggedIn: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
