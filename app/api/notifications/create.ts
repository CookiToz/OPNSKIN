import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, type, message } = await req.json();
    if (!userId || !type || !message) {
      return NextResponse.json({ error: 'userId, type et message requis' }, { status: 400 });
    }
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        createdAt: new Date(),
      },
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 