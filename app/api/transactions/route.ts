import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Créer une nouvelle transaction (acheter une offre)
export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    
    if (!steamId) {
      return NextResponse.json({ 
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { offerId } = await req.json();

    if (!offerId) {
      return NextResponse.json({ 
        error: 'Offer ID required'
      }, { status: 400 });
    }

    // Récupérer l'acheteur
    const buyer = await prisma.user.findUnique({
      where: { steamId }
    });

    if (!buyer) {
      return NextResponse.json({ 
        error: 'User not found'
      }, { status: 404 });
    }

    // Récupérer l'offre
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { seller: true }
    });

    if (!offer) {
      return NextResponse.json({ 
        error: 'Offer not found'
      }, { status: 404 });
    }

    if (offer.status !== 'AVAILABLE') {
      return NextResponse.json({ 
        error: 'Offer is not available'
      }, { status: 400 });
    }

    if (offer.sellerId === buyer.id) {
      return NextResponse.json({ 
        error: 'Cannot buy your own offer'
      }, { status: 400 });
    }

    // Vérifier le solde de l'acheteur
    if (buyer.walletBalance < offer.price) {
      return NextResponse.json({ 
        error: 'Insufficient wallet balance'
      }, { status: 400 });
    }

    // Créer la transaction
    const transaction = await prisma.transaction.create({
      data: {
        offerId: offer.id,
        buyerId: buyer.id,
        escrowAmount: offer.price,
        status: 'WAITING_TRADE'
      },
      include: {
        offer: {
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
        },
        buyer: {
          select: {
            id: true,
            steamId: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Mettre à jour le statut de l'offre
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'PENDING_TRADE_OFFER' }
    });

    // Créer des notifications
    await Promise.all([
      // Notification pour l'acheteur
      prisma.notification.create({
        data: {
          userId: buyer.id,
          type: 'TRANSACTION_STARTED',
          title: 'Transaction démarrée',
          message: `Vous avez acheté ${offer.itemName} pour ${offer.price}€. En attente de l'échange Steam.`
        }
      }),
      // Notification pour le vendeur
      prisma.notification.create({
        data: {
          userId: offer.sellerId,
          type: 'OFFER_SOLD',
          title: 'Offre vendue',
          message: `${buyer.name} a acheté votre ${offer.itemName} pour ${offer.price}€. En attente de l'échange Steam.`
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        offerId: transaction.offerId,
        escrowAmount: transaction.escrowAmount,
        status: transaction.status,
        startedAt: transaction.startedAt,
        offer: transaction.offer,
        buyer: transaction.buyer
      }
    });

  } catch (error: any) {
    console.error('[TRANSACTIONS API] Error creating transaction:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// Lister les transactions de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    
    if (!steamId) {
      return NextResponse.json({ 
        error: 'Authentication required'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { steamId }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found'
      }, { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId: user.id },
          { offer: { sellerId: user.id } }
        ]
      },
      include: {
        offer: {
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
        },
        buyer: {
          select: {
            id: true,
            steamId: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        offerId: t.offerId,
        escrowAmount: t.escrowAmount,
        status: t.status,
        startedAt: t.startedAt,
        completedAt: t.completedAt,
        cancelledAt: t.cancelledAt,
        offer: t.offer,
        buyer: t.buyer,
        isBuyer: t.buyerId === user.id,
        isSeller: t.offer.sellerId === user.id
      }))
    });

  } catch (error: any) {
    console.error('[TRANSACTIONS API] Error fetching transactions:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
} 