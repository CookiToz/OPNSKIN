import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Créer une nouvelle offre
export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    
    if (!steamId) {
      return NextResponse.json({ 
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { itemId, itemName, itemImage, game, price } = await req.json();

    // Validation
    if (!itemId || !price || price <= 0) {
      return NextResponse.json({ 
        error: 'Invalid offer data'
      }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { steamId }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found'
      }, { status: 404 });
    }

    // Créer l'offre
    const offer = await prisma.offer.create({
      data: {
        sellerId: user.id,
        itemId,
        itemName: itemName || `Item ${itemId}`,
        itemImage: itemImage || '',
        game: game || 'cs2',
        price: parseFloat(price),
        status: 'AVAILABLE',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      },
      include: {
        seller: {
          select: {
            id: true,
            steamId: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Créer une notification pour le vendeur
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'OFFER_CREATED',
        title: 'Offre créée',
        message: `Votre offre pour ${offer.itemName} a été créée avec succès.`
      }
    });

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        itemId: offer.itemId,
        itemName: offer.itemName,
        itemImage: offer.itemImage,
        game: offer.game,
        price: offer.price,
        status: offer.status,
        createdAt: offer.createdAt,
        seller: offer.seller
      }
    });

  } catch (error: any) {
    console.error('[OFFERS API] Error creating offer:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// Lister toutes les offres disponibles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get('game');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {
      status: 'AVAILABLE'
    };

    if (game) {
      where.game = game;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Récupérer les offres
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              steamId: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.offer.count({ where })
    ]);

    return NextResponse.json({
      offers: offers.map(offer => ({
        id: offer.id,
        itemId: offer.itemId,
        itemName: offer.itemName,
        itemImage: offer.itemImage,
        game: offer.game,
        price: offer.price,
        status: offer.status,
        createdAt: offer.createdAt,
        seller: offer.seller
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('[OFFERS API] Error fetching offers:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
} 