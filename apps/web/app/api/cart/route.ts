import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fonction helper pour créer le client Supabase avec gestion de la faute de frappe
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERCE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[CART API] Missing Supabase environment variables');
    console.error('[CART API] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
    console.error('[CART API] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING');
    console.error('[CART API] SUPABASE_SERCE_ROLE_KEY:', process.env.SUPABASE_SERCE_ROLE_KEY ? 'OK' : 'MISSING');
    throw new Error('supabaseKey is required.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseClient();
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabaseAdmin.from('User').select('id').eq('steamId', steamId).single();
    if (userError || !user) {
      console.error('Supabase userError:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Récupérer les items du panier
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('CartItem')
      .select('id, offerId')
      .eq('userId', user.id)
      .order('addedAt', { ascending: false });
    if (cartError) {
      console.error('Supabase cartError:', cartError);
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }
    
    // Récupérer les offres correspondantes
    if (cartItems && cartItems.length > 0) {
      const offerIds = cartItems.map(item => item.offerId);
      const { data: offers, error: offersError } = await supabaseAdmin
        .from('Offer')
        .select('*')
        .in('id', offerIds);
      
      if (offersError) {
        console.error('Supabase offersError:', offersError);
        return NextResponse.json({ error: offersError.message }, { status: 500 });
      }
      
      // Combiner les données
      const cartWithOffers = cartItems.map(cartItem => {
        const offer = offers.find(o => o.id === cartItem.offerId);
        return {
          ...cartItem,
          offer
        };
      });
      
      return NextResponse.json({ cart: cartWithOffers });
    }
    
    return NextResponse.json({ cart: [] });
  } catch (error: any) {
    console.error('ERREUR API CART:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseClient();
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { offerId } = await req.json();
    if (!offerId) {
      return NextResponse.json({ error: 'offerId requis' }, { status: 400 });
    }
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabaseAdmin.from('User').select('id').eq('steamId', steamId).single();
    if (userError || !user) {
      console.error('Supabase userError:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Vérifier que l'item n'est pas déjà dans le panier
    const { data: existing } = await supabaseAdmin
      .from('CartItem')
      .select('id')
      .eq('userId', user.id)
      .eq('offerId', offerId)
      .single();
    if (existing) {
      return NextResponse.json({ error: 'Cet item est déjà dans le panier.' }, { status: 409 });
    }
    // Ajouter au panier
    const { data: cartItem, error: addError } = await supabaseAdmin
      .from('CartItem')
      .insert([{ userId: user.id, offerId }])
      .select('id, offerId, Offer(*)')
      .single();
    if (addError) {
      console.error('Supabase addError:', addError);
      return NextResponse.json({ error: addError.message }, { status: 500 });
    }
    return NextResponse.json({ cartItem });
  } catch (error: any) {
    console.error('ERREUR API CART:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseClient();
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabaseAdmin.from('User').select('id').eq('steamId', steamId).single();
    if (userError || !user) {
      console.error('Supabase userError:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Supprimer tous les items du panier
    const { error: delError } = await supabaseAdmin.from('CartItem').delete().eq('userId', user.id);
    if (delError) {
      console.error('Supabase delError:', delError);
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('ERREUR API CART:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 