import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Changer le statut d'un ticket
export async function PATCH(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { status } = await req.json();
    if (!status || !['OPEN', 'RESOLVED', 'CLOSED'].includes(status)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.ticketId } });
    if (!ticket || ticket.userId !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 