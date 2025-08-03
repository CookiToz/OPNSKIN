import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fonction helper pour créer le client Supabase
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERCE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('supabaseKey is required.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Lister tous les tickets (admin)
export async function GET(req: NextRequest) {
  try {
    // Authentification admin
    const steamId = req.cookies.get('steamId')?.value;
    console.log('🔍 Debug admin auth - steamId:', steamId);
    
    if (!steamId) {
      console.log('❌ No steamId found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const supabase = createSupabaseClient();
    
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();
    
    console.log('🔍 Debug admin auth - user found:', user ? 'yes' : 'no');
    console.log('🔍 Debug admin auth - user.isAdmin:', user?.isAdmin);
    
    if (userError || !user) {
      console.log('❌ User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.isAdmin) {
      console.log('❌ User is not admin');
      return NextResponse.json({ error: 'Not authorized - not admin' }, { status: 403 });
    }
    
    console.log('✅ Admin access granted');
    
    // Récupérer tous les tickets avec les relations
    const { data: tickets, error: ticketsError } = await supabase
      .from('SupportTicket')
      .select(`
        *,
        user:User(id, name, steamId),
        messages:SupportMessage(
          *,
          sender:User(id, name, steamId)
        )
      `)
      .order('createdAt', { ascending: false });
    
    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
    
    // Trier les messages par date de création et ajouter des priorités par défaut
    const ticketsWithPriority = tickets?.map(ticket => ({
      ...ticket,
      priority: ticket.priority || 'MEDIUM', // Priorité par défaut
      messages: ticket.messages?.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ) || []
    })) || [];

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
    const steamId = req.cookies.get('steamId')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const supabase = createSupabaseClient();
    
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();
    
    if (userError || !user || !user.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { ticketId, status, priority } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    // Mettre à jour le ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from('SupportTicket')
      .update(updateData)
      .eq('id', ticketId)
      .select(`
        *,
        user:User(id, name, steamId),
        messages:SupportMessage(
          *,
          sender:User(id, name, steamId)
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating ticket:', updateError);
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    // Trier les messages par date de création
    const ticketWithSortedMessages = {
      ...updatedTicket,
      messages: updatedTicket.messages?.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ) || []
    };

    return NextResponse.json(ticketWithSortedMessages);
  } catch (e: any) {
    console.error('Error in admin ticket update:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 