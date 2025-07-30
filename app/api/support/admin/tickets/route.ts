import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lister tous les tickets (admin)
export async function GET(req: NextRequest) {
  try {
    // Authentification admin
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user || !user.isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, steamId: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return NextResponse.json(tickets);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 