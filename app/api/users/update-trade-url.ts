import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isValidTradeUrl(url: string) {
  return url.startsWith('https://steamcommunity.com/tradeoffer/new/');
}

export async function POST(req: NextRequest) {
  try {
    const { userId, tradeUrl } = await req.json();
    if (!userId || !tradeUrl) {
      return NextResponse.json({ error: 'userId et tradeUrl requis' }, { status: 400 });
    }
    if (!isValidTradeUrl(tradeUrl)) {
      return NextResponse.json({ error: 'Format du tradeUrl invalide' }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { tradeUrl },
    });
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 