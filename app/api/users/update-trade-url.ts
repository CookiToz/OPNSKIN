import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { userId, tradeUrl } = await req.json();
    if (!userId || !tradeUrl) {
      return NextResponse.json({ error: 'userId et tradeUrl requis' }, { status: 400 });
    }
    if (!tradeUrl.startsWith('https://steamcommunity.com/tradeoffer/new/')) {
      return NextResponse.json({ error: 'Format du tradeUrl invalide' }, { status: 400 });
    }
    const { data: user, error } = await supabaseAdmin.from('User').update({ tradeUrl }).eq('id', userId).select().single();
    if (error) {
      return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 