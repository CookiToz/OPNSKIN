import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    const whereClause = sellerId 
      ? { sellerId } // Toutes les offres du vendeur
      : { status: 'AVAILABLE' as const }; // Seulement les offres disponibles
    
    const offers = await prisma.offer.findMany({
      where: whereClause,
      include: {
        transaction: {
          include: {
            buyer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(offers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 