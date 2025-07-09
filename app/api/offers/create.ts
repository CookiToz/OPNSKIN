import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { sellerId, steamItemId, price } = await req.json();
    if (!sellerId || !steamItemId || typeof price !== 'number') {
      return NextResponse.json({ error: 'Champs manquants ou invalides' }, { status: 400 });
    }
    const offer = await prisma.offer.create({
      data: {
        sellerId,
        itemId: steamItemId,
        price,
        status: 'AVAILABLE',
        createdAt: new Date(),
      },
    });
    return NextResponse.json(offer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 