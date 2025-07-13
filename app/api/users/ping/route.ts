import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    for (const cookie of cookieStore) {
      console.log('[PING] cookie:', cookie);
    }
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated', debug: { user, userError } }, { status: 401 });
    }

    // Log l'utilisateur détecté
    console.log('[PING] user:', user);

    const { error } = await supabase
      .from('User')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', user.id);

    // Log le résultat de l'update
    console.log('[PING] update User.last_seen for id:', user.id, 'error:', error);

    if (error) {
      return NextResponse.json({ error: error.message, debug: { userId: user.id, updateError: error, user } }, { status: 500 });
    }

    return NextResponse.json({ success: true, debug: { userId: user.id } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack, debug: { user: null } }, { status: 500 });
  }
} 