import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transactionId = params.id;
    const { buyerId } = await req.json();
    if (!buyerId) {
      return NextResponse.json({ error: 'buyerId requis' }, { status: 400 });
    }
    // 1. Vérifier que la transaction existe
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 });
    }
    if (transaction.buyerId !== buyerId) {
      return NextResponse.json({ error: 'Transaction non autorisée pour cet utilisateur' }, { status: 403 });
    }
    if (transaction.status !== 'WAITING_TRADE') {
      return NextResponse.json({ error: 'Transaction déjà confirmée ou annulée' }, { status: 409 });
    }
    // 2. Mettre à jour la transaction et l'offre liée
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'DONE',
        completedAt: new Date(),
      },
    });
    await prisma.offer.update({
      where: { id: transaction.offerId },
      data: { status: 'COMPLETED' },
    });
    return NextResponse.json({ success: true, message: 'Transaction confirmée et offre marquée comme complétée.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 