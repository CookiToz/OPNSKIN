import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ 
        loggedIn: false,
        error: 'No Steam ID found'
      });
    }

    // Chercher l'utilisateur par steamId
    let { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ loggedIn: false, error: error.message });
    }

    // Si l'utilisateur n'existe pas, le créer
    if (!user) {
      const apiKey = process.env.STEAM_API_KEY;
      let steamInfo = {
        name: `Steam User (${steamId})`,
        avatar: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default/${steamId.slice(-1)}.jpg`,
        profileUrl: `https://steamcommunity.com/profiles/${steamId}`
      };
      if (apiKey) {
        try {
          const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
          const res = await fetch(steamApiUrl);
          if (res.ok) {
            const data = await res.json();
            const player = data?.response?.players?.[0];
            if (player) {
              steamInfo = {
                name: player.personaname,
                avatar: player.avatarfull,
                profileUrl: player.profileurl
              };
            }
          }
        } catch {}
      }
      const { data: createdUser, error: createError } = await supabase
        .from('User')
        .insert([{ steamId, name: steamInfo.name, avatar: steamInfo.avatar, profileUrl: steamInfo.profileUrl }])
        .select()
        .single();
      if (createError) {
        return NextResponse.json({ loggedIn: false, error: createError.message });
      }
      user = createdUser;
    }

    // Récupérer les offres, transactions, notifications
    const [{ data: offers = [] }, { data: transactions = [] }, { data: notifications = [] }] = await Promise.all([
      supabase.from('Offer').select('*').eq('sellerId', user.id).order('createdAt', { ascending: false }),
      supabase.from('Transaction').select('*,offer(*)').or(`buyerId.eq.${user.id},offer.sellerId.eq.${user.id}`).order('startedAt', { ascending: false }),
      supabase.from('Notification').select('*').eq('userId', user.id).eq('read', false).order('createdAt', { ascending: false })
    ]);

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: user.id,
        steamId: user.steamId,
        name: user.name,
        avatar: user.avatar,
        profileUrl: user.profileUrl,
        tradeUrl: user.tradeUrl,
        walletBalance: user.walletBalance,
        offersCount: offers.length,
        transactionsCount: transactions.length,
        unreadNotificationsCount: notifications.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      loggedIn: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ 
        error: 'No Steam ID found'
      }, { status: 401 });
    }
    const { tradeUrl } = await req.json();
    if (tradeUrl && !tradeUrl.startsWith('https://steamcommunity.com/tradeoffer/new/')) {
      return NextResponse.json({ 
        error: 'Invalid Steam Trade URL format'
      }, { status: 400 });
    }
    // Mettre à jour l'utilisateur
    const { data: user, error } = await supabase
      .from('User')
      .update({ tradeUrl })
      .eq('steamId', steamId)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        steamId: user.steamId,
        name: user.name,
        avatar: user.avatar,
        profileUrl: user.profileUrl,
        tradeUrl: user.tradeUrl,
        walletBalance: user.walletBalance
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
} 