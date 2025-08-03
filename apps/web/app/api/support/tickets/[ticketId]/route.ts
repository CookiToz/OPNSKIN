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

// Mettre à jour un ticket
export async function PATCH(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const { status, priority } = await req.json();
    
    const supabase = createSupabaseClient();
    
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Vérifier que l'utilisateur est admin ou propriétaire du ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('SupportTicket')
      .select('*')
      .eq('id', params.ticketId)
      .single();
    
    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Vérifier les autorisations selon le type de modification
    if (status === 'RESOLVED' || status === 'CLOSED') {
      // Seuls les admins peuvent résoudre ou fermer un ticket
      if (!user.isAdmin) {
        return NextResponse.json({ 
          error: 'Seuls les administrateurs peuvent marquer un ticket comme résolu ou fermé' 
        }, { status: 403 });
      }
    } else if (status === 'OPEN') {
      // Le propriétaire du ticket ou un admin peut rouvrir un ticket
      if (!user.isAdmin && ticket.userId !== user.id) {
        return NextResponse.json({ 
          error: 'Vous n\'êtes pas autorisé à modifier ce ticket' 
        }, { status: 403 });
      }
    } else {
      // Pour les autres modifications, vérifier les autorisations standard
      if (!user.isAdmin && ticket.userId !== user.id) {
        return NextResponse.json({ 
          error: 'Vous n\'êtes pas autorisé à modifier ce ticket' 
        }, { status: 403 });
      }
    }
    
    // Préparer les données de mise à jour
    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    
    // Mettre à jour le ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from('SupportTicket')
      .update(updateData)
      .eq('id', params.ticketId)
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
    console.error('Support ticket update error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Récupérer un ticket spécifique
export async function GET(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const supabase = createSupabaseClient();
    
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Récupérer le ticket avec les relations
    const { data: ticket, error: ticketError } = await supabase
      .from('SupportTicket')
      .select(`
        *,
        user:User(id, name, steamId),
        messages:SupportMessage(
          *,
          sender:User(id, name, steamId)
        )
      `)
      .eq('id', params.ticketId)
      .single();
    
    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Vérifier les autorisations
    if (!user.isAdmin && ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Trier les messages par date de création
    const ticketWithSortedMessages = {
      ...ticket,
      messages: ticket.messages?.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ) || []
    };
    
    return NextResponse.json(ticketWithSortedMessages);
  } catch (e: any) {
    console.error('Support ticket fetch error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 