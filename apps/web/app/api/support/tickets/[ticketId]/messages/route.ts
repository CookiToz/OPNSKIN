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

// Ajouter un message à un ticket
export async function POST(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const { content, senderRole } = await req.json();
    if (!content) return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    
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
    
    // Récupérer le ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('SupportTicket')
      .select('*')
      .eq('id', params.ticketId)
      .single();
    
    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Vérifier les autorisations
    if (senderRole !== 'ADMIN' && ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Créer le message
    const { data: message, error: messageError } = await supabase
      .from('SupportMessage')
      .insert([{
        ticketId: ticket.id,
        senderId: user.id,
        senderRole: senderRole || 'USER',
        content
      }])
      .select()
      .single();
    
    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }
    
    // Notifier l'utilisateur si c'est une réponse admin
    if ((senderRole === 'ADMIN' || user.id !== ticket.userId) && ticket) {
      await supabase
        .from('Notification')
        .insert([{
          userId: ticket.userId,
          type: 'SUPPORT_REPLY',
          title: 'Réponse du support',
          message: `Vous avez reçu une réponse du support à votre ticket : ${ticket.subject}`,
          read: false
        }]);
    }
    
    return NextResponse.json(message);
  } catch (e: any) {
    console.error('Support message creation error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Lister les messages d'un ticket
export async function GET(req: NextRequest, { params }: { params: { ticketId: string } }) {
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
    
    // Récupérer le ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('SupportTicket')
      .select('*')
      .eq('id', params.ticketId)
      .single();
    
    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Vérifier les autorisations
    if (ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Récupérer les messages
    const { data: messages, error: messagesError } = await supabase
      .from('SupportMessage')
      .select('*')
      .eq('ticketId', ticket.id)
      .order('createdAt', { ascending: true });
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
    
    return NextResponse.json(messages || []);
  } catch (e: any) {
    console.error('Support messages fetch error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 