import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    let user = await prisma.user.findUnique({
      where: { steamId },
      include: {
        offers: {
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          include: {
            offer: true
          },
          orderBy: { startedAt: 'desc' }
        },
        notifications: {
          where: { read: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Si l'utilisateur n'existe pas, le créer
    if (!user) {
      console.log('[USER API] Creating new user for SteamID:', steamId);
      
      // Récupérer les infos Steam si possible
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
        } catch (error) {
          console.error('[USER API] Error fetching Steam info:', error);
        }
      }

      user = await prisma.user.create({
        data: {
          steamId,
          name: steamInfo.name,
          avatar: steamInfo.avatar,
          profileUrl: steamInfo.profileUrl
        },
        include: {
          offers: {
            orderBy: { createdAt: 'desc' }
          },
          transactions: {
            include: {
              offer: true
            },
            orderBy: { startedAt: 'desc' }
          },
          notifications: {
            where: { read: false },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    }

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
        offersCount: user.offers.length,
        transactionsCount: user.transactions.length,
        unreadNotificationsCount: user.notifications.length
      }
    });

  } catch (error: any) {
    console.error('[USER API] Error:', error);
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

    const user = await prisma.user.update({
      where: { steamId },
      data: { tradeUrl },
      include: {
        offers: {
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          include: {
            offer: true
          },
          orderBy: { startedAt: 'desc' }
        },
        notifications: {
          where: { read: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

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
    console.error('[USER API] Error updating user:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
} 