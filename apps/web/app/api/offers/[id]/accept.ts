import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const offerId = params.id;
    const { buyerId, escrowAmount } = await req.json();
    if (!buyerId || typeof escrowAmount !== 'number') {
      return NextResponse.json({ error: 'buyerId et escrowAmount requis' }, { status: 400 });
    }
    // 1. Vérifier que l'offre existe et est AVAILABLE
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) {
      return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 });
    }
    if (offer.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Offre déjà achetée ou non disponible' }, { status: 409 });
    }
    // 2. Créer la transaction
    const transaction = await prisma.transaction.create({
      data: {
        offerId,
        buyerId,
        escrowAmount,
        status: 'WAITING_TRADE',
      },
    });
    // 3. Mettre à jour l'offre en PENDING_TRADE_OFFER
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'PENDING_TRADE_OFFER' },
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 