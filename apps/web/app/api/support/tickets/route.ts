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

// Créer un ticket
export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const { subject, message } = await req.json();
    if (!subject || !message) return NextResponse.json({ error: 'Sujet et message requis' }, { status: 400 });
    
    const supabase = createSupabaseClient();
    
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id')
      .eq('steamId', steamId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Créer le ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('SupportTicket')
      .insert([{
        userId: user.id,
        subject,
        status: 'OPEN',
        priority: 'MEDIUM'
      }])
      .select()
      .single();
    
    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
    
    // Créer le premier message
    const { error: messageError } = await supabase
      .from('SupportMessage')
      .insert([{
        ticketId: ticket.id,
        senderId: user.id,
        senderRole: 'USER',
        content: message
      }]);
    
    if (messageError) {
      console.error('Error creating message:', messageError);
      // Supprimer le ticket si le message échoue
      await supabase.from('SupportTicket').delete().eq('id', ticket.id);
      return NextResponse.json({ error: 'Failed to create ticket message' }, { status: 500 });
    }
    
    return NextResponse.json(ticket);
  } catch (e: any) {
    console.error('Support ticket creation error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Lister les tickets de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const supabase = createSupabaseClient();
    
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id')
      .eq('steamId', steamId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Récupérer les tickets avec les messages
    const { data: tickets, error: ticketsError } = await supabase
      .from('SupportTicket')
      .select(`
        *,
        messages:SupportMessage(*)
      `)
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });
    
    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
    
    // Trier les messages par date de création
    const ticketsWithSortedMessages = tickets?.map(ticket => ({
      ...ticket,
      messages: ticket.messages?.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ) || []
    })) || [];
    
    return NextResponse.json(ticketsWithSortedMessages);
  } catch (e: any) {
    console.error('Support tickets fetch error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 