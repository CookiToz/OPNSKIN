import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    console.log('[PING] steamId reçu:', steamId);
    if (!steamId) {
      return NextResponse.json({ error: 'Not authenticated', debug: { steamId } }, { status: 401 });
    }

    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, steamId')
      .eq('steamId', steamId)
      .single();

    console.log('[PING] user trouvé:', user);

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found', debug: { userError } }, { status: 404 });
    }

    // Mettre à jour last_seen
    const { error } = await supabase
      .from('User')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message, debug: { userId: user.id, updateError: error, user } }, { status: 500 });
    }

    return NextResponse.json({ success: true, debug: { userId: user.id } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack, debug: { user: null } }, { status: 500 });
  }
} 