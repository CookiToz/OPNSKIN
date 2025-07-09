import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Récupérer les notifications de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    
    if (!steamId) {
      return NextResponse.json({ 
        error: 'Authentication required'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { steamId }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found'
      }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly && { read: false })
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt
      }))
    });

  } catch (error: any) {
    console.error('[NOTIFICATIONS API] Error fetching notifications:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// Marquer une notification comme lue
export async function PUT(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    
    if (!steamId) {
      return NextResponse.json({ 
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json({ 
        error: 'Notification ID required'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { steamId }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found'
      }, { status: 404 });
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id
      }
    });

    if (!notification) {
      return NextResponse.json({ 
        error: 'Notification not found'
      }, { status: 404 });
    }

    // Marquer comme lue
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error: any) {
    console.error('[NOTIFICATIONS API] Error updating notification:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
} 