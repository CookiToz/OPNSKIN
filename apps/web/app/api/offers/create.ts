import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { itemId, itemName, itemImage, rarityCode, game, price } = await req.json();
    if (!itemId || typeof price !== 'number') {
      return NextResponse.json({ error: 'Champs manquants ou invalides' }, { status: 400 });
    }
    
    // Récupérer l'utilisateur connecté
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { steamId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    const offer = await prisma.offer.create({
      data: {
        sellerId: user.id,
        itemId,
        itemName,
        itemImage,
        rarityCode,
        game,
        price,
        status: 'AVAILABLE',
      },
    });
    return NextResponse.json(offer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 