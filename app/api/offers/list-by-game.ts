import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get('game');
    if (!game) {
      return NextResponse.json({ error: 'Paramètre game requis' }, { status: 400 });
    }
    // On suppose que le champ itemId encode le jeu, ou qu'il y a un champ game dans Offer
    // À adapter selon ton modèle réel
    const offers = await prisma.offer.findMany({
      where: {
        status: 'AVAILABLE',
        itemId: { contains: game, mode: 'insensitive' }, // à adapter si besoin
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(offers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 