import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const offerId = params.id;
    const { sellerId } = await req.json();
    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId requis' }, { status: 400 });
    }
    // 1. Vérifier que l'offre existe et appartient au vendeur
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) {
      return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 });
    }
    if (offer.sellerId !== sellerId) {
      return NextResponse.json({ error: 'Offre non autorisée pour ce vendeur' }, { status: 403 });
    }
    if (offer.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Offre déjà engagée ou annulée' }, { status: 409 });
    }
    // 2. Mettre à jour le statut en EXPIRED
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'EXPIRED' },
    });
    return NextResponse.json({ success: true, message: 'Offre annulée avec succès.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 