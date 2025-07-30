import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Créer un ticket
export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { subject, message } = await req.json();
    if (!subject || !message) return NextResponse.json({ error: 'Sujet et message requis' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        messages: {
          create: {
            senderId: user.id,
            senderRole: 'USER',
            content: message,
          },
        },
      },
      include: { messages: true },
    });
    return NextResponse.json(ticket);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Lister les tickets de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return NextResponse.json(tickets);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 