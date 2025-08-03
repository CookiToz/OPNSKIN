import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lister tous les tickets (admin)
export async function GET(req: NextRequest) {
  try {
    // Authentification admin
    const steamId = req.cookies.get('steamid')?.value;
    console.log('🔍 Debug admin auth - steamId:', steamId);
    
    if (!steamId) {
      console.log('❌ No steamId found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({ where: { steamId } });
    console.log('🔍 Debug admin auth - user found:', user ? 'yes' : 'no');
    console.log('🔍 Debug admin auth - user.isAdmin:', user?.isAdmin);
    
    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.isAdmin) {
      console.log('❌ User is not admin');
      return NextResponse.json({ error: 'Not authorized - not admin' }, { status: 403 });
    }
    
    console.log('✅ Admin access granted');
    
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, steamId: true } },
        messages: { 
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, steamId: true } }
          }
        },
      },
    });

    // Ajouter des priorités par défaut si non définies
    const ticketsWithPriority = tickets.map(ticket => ({
      ...ticket,
      priority: ticket.priority || 'MEDIUM' // Priorité par défaut
    }));

    return NextResponse.json(ticketsWithPriority);
  } catch (e: any) {
    console.error('❌ Error in admin tickets API:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Mettre à jour un ticket (admin)
export async function PATCH(req: NextRequest) {
  try {
    // Authentification admin
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user || !user.isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const { ticketId, status, priority } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, steamId: true } },
        messages: { 
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, steamId: true } }
          }
        },
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 