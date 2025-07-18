import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Récupérer les notifications de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { data: user, error: userError } = await supabaseAdmin.from('User').select('*').eq('steamId', steamId).single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    let query = supabaseAdmin.from('Notification').select('*').eq('userId', user.id);
    if (unreadOnly) query = query.eq('read', false);
    query = query.order('createdAt', { ascending: false }).limit(limit);
    const { data: notifications, error: notifError } = await query;
    if (notifError) {
      return NextResponse.json({ error: notifError.message }, { status: 500 });
    }
    return NextResponse.json({
      notifications: (notifications || []).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Marquer une notification comme lue
export async function PUT(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }
    const { data: user, error: userError } = await supabaseAdmin.from('User').select('*').eq('steamId', steamId).single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Vérifier que la notification appartient à l'utilisateur
    const { data: notification, error: notifError } = await supabaseAdmin.from('Notification').select('*').eq('id', notificationId).eq('userId', user.id).single();
    if (notifError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    // Marquer comme lue
    const { error: updateError } = await supabaseAdmin.from('Notification').update({ read: true }).eq('id', notificationId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 