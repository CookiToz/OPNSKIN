import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const steamId = req.cookies.get('steamid')?.value;
    console.log('[PING] steamId reçu:', steamId);
    
    // Si pas de steamId, retourner une réponse silencieuse (pas d'erreur)
    if (!steamId) {
      return NextResponse.json({ 
        success: false,
        message: 'User not logged in',
        online: false
      }, { status: 200 }); // Changé de 401 à 200 pour éviter les erreurs
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id, steamId')
      .eq('steamId', steamId)
      .single();

    console.log('[PING] user trouvé:', user);

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found', debug: { userError } }, { status: 404 });
    }

    // Mettre à jour last_seen
    const { error } = await supabaseAdmin
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