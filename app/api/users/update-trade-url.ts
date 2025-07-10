import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { userId, tradeUrl } = await req.json();
    if (!userId || !tradeUrl) {
      return NextResponse.json({ error: 'userId et tradeUrl requis' }, { status: 400 });
    }
    if (!tradeUrl.startsWith('https://steamcommunity.com/tradeoffer/new/')) {
      return NextResponse.json({ error: 'Format du tradeUrl invalide' }, { status: 400 });
    }
    const { data: user, error } = await supabase.from('User').update({ tradeUrl }).eq('id', userId).select().single();
    if (error) {
      return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 