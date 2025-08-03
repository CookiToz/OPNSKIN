import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ajouter un message à un ticket
export async function POST(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { content, senderRole } = await req.json();
    if (!content) return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.ticketId } });
    if (!ticket || (senderRole !== 'ADMIN' && ticket.userId !== user.id)) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    const message = await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: user.id,
        senderRole: senderRole || 'USER',
        content,
      },
    });
    // Notifier l'utilisateur si c'est une réponse admin
    if ((senderRole === 'ADMIN' || user.id !== ticket.userId) && ticket) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: 'SUPPORT_REPLY',
          title: 'Réponse du support',
          message: `Vous avez reçu une réponse du support à votre ticket : ${ticket.subject}`,
          read: false,
        }
      });
    }
    return NextResponse.json(message);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Lister les messages d'un ticket
export async function GET(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.ticketId } });
    if (!ticket || ticket.userId !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    const messages = await prisma.supportMessage.findMany({
      where: { ticketId: ticket.id },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 