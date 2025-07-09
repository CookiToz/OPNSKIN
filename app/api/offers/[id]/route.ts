import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Récupérer une offre spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            steamId: true,
            name: true,
            avatar: true
          }
        },
        transaction: {
          include: {
            buyer: {
              select: {
                id: true,
                steamId: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!offer) {
      return NextResponse.json({ 
        error: 'Offer not found'
      }, { status: 404 });
    }

    return NextResponse.json({ offer });

  } catch (error: any) {
    console.error('[OFFER API] Error fetching offer:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// Annuler une offre (seulement le vendeur)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: { transaction: true }
    });

    if (!offer) {
      return NextResponse.json({ 
        error: 'Offer not found'
      }, { status: 404 });
    }

    if (offer.sellerId !== user.id) {
      return NextResponse.json({ 
        error: 'Not authorized to cancel this offer'
      }, { status: 403 });
    }

    if (offer.status !== 'AVAILABLE') {
      return NextResponse.json({ 
        error: 'Cannot cancel offer that is not available'
      }, { status: 400 });
    }

    // Supprimer l'offre
    await prisma.offer.delete({
      where: { id: params.id }
    });

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'OFFRE_CANCELLED',
        title: 'Offre annulée',
        message: `Votre offre pour ${offer.itemName} a été annulée.`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Offer cancelled successfully'
    });

  } catch (error: any) {
    console.error('[OFFER API] Error cancelling offer:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// Confirmer une transaction (vendeur confirme l'échange)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    
    if (!steamId) {
      return NextResponse.json({ 
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { action } = await req.json();

    const user = await prisma.user.findUnique({
      where: { steamId }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found'
      }, { status: 404 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: { 
        transaction: {
          include: {
            buyer: {
              select: {
                id: true,
                steamId: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!offer) {
      return NextResponse.json({ 
        error: 'Offer not found'
      }, { status: 404 });
    }

    if (offer.sellerId !== user.id) {
      return NextResponse.json({ 
        error: 'Not authorized to modify this offer'
      }, { status: 403 });
    }

    if (action === 'confirm_trade') {
      if (offer.status !== 'PENDING_TRADE_OFFER' || !offer.transaction) {
        return NextResponse.json({ 
          error: 'No pending transaction to confirm'
        }, { status: 400 });
      }

      // Confirmer la transaction
      await Promise.all([
        prisma.transaction.update({
          where: { id: offer.transaction.id },
          data: { 
            status: 'DONE',
            completedAt: new Date()
          }
        }),
        prisma.offer.update({
          where: { id: params.id },
          data: { status: 'COMPLETED' }
        }),
        // Transférer l'argent au vendeur
        prisma.user.update({
          where: { id: user.id },
          data: { 
            walletBalance: {
              increment: offer.price
            }
          }
        }),
        // Déduire l'argent de l'acheteur
        prisma.user.update({
          where: { id: offer.transaction.buyerId },
          data: { 
            walletBalance: {
              decrement: offer.price
            }
          }
        })
      ]);

      // Créer des notifications
      await Promise.all([
        prisma.notification.create({
          data: {
            userId: user.id,
            type: 'TRANSACTION_COMPLETED',
            title: 'Transaction terminée',
            message: `Vente de ${offer.itemName} terminée. ${offer.price}€ ajoutés à votre portefeuille.`
          }
        }),
        prisma.notification.create({
          data: {
            userId: offer.transaction.buyerId,
            type: 'TRANSACTION_COMPLETED',
            title: 'Transaction terminée',
            message: `Achat de ${offer.itemName} terminé. L'item a été ajouté à votre inventaire.`
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: 'Transaction confirmed successfully'
      });

    } else if (action === 'cancel_transaction') {
      if (offer.status !== 'PENDING_TRADE_OFFER' || !offer.transaction) {
        return NextResponse.json({ 
          error: 'No pending transaction to cancel'
        }, { status: 400 });
      }

      // Annuler la transaction
      await Promise.all([
        prisma.transaction.update({
          where: { id: offer.transaction.id },
          data: { 
            status: 'REFUSED',
            cancelledAt: new Date()
          }
        }),
        prisma.offer.update({
          where: { id: params.id },
          data: { status: 'AVAILABLE' }
        })
      ]);

      // Créer des notifications
      await Promise.all([
        prisma.notification.create({
          data: {
            userId: user.id,
            type: 'TRANSACTION_COMPLETED',
            title: 'Transaction annulée',
            message: `Transaction pour ${offer.itemName} annulée. L'offre est de nouveau disponible.`
          }
        }),
        prisma.notification.create({
          data: {
            userId: offer.transaction.buyerId,
            type: 'TRANSACTION_COMPLETED',
            title: 'Transaction annulée',
            message: `Transaction pour ${offer.itemName} annulée par le vendeur.`
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: 'Transaction cancelled successfully'
      });

    } else {
      return NextResponse.json({ 
        error: 'Invalid action'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[OFFER API] Error updating offer:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
} 