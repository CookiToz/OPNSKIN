import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Récupérer une offre spécifique
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: offer, error } = await supabase
      .from('Offer')
      .select('*,seller(id,steamId,name,avatar),transaction(buyer(id,steamId,name,avatar))')
      .eq('id', params.id)
      .single();
    if (error || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    return NextResponse.json({ offer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Annuler une offre (seulement le vendeur)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { data: user, error: userError } = await supabase.from('User').select('*').eq('steamId', steamId).single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { data: offer, error: offerError } = await supabase.from('Offer').select('*,transaction(*)').eq('id', params.id).single();
    if (offerError || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    if (offer.sellerId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to cancel this offer' }, { status: 403 });
    }
    if (offer.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Cannot cancel offer that is not available' }, { status: 400 });
    }
    await supabase.from('Offer').delete().eq('id', params.id);
    await supabase.from('Notification').insert([{
      userId: user.id,
      type: 'OFFRE_CANCELLED',
      title: 'Offre annulée',
      message: `Votre offre pour ${offer.itemName} a été annulée.`
    }]);
    return NextResponse.json({ success: true, message: 'Offer cancelled successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Confirmer une transaction (vendeur confirme l'échange)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { action } = await req.json();
    const { data: user, error: userError } = await supabase.from('User').select('*').eq('steamId', steamId).single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { data: offer, error: offerError } = await supabase.from('Offer').select('*,transaction(buyer(id,steamId,name))').eq('id', params.id).single();
    if (offerError || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    if (offer.sellerId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to modify this offer' }, { status: 403 });
    }
    // Ici, tu peux ajouter la logique de confirmation de transaction si besoin
    // Par exemple, mettre à jour le statut de l'offre et de la transaction
    return NextResponse.json({ success: true, message: 'Offer/transaction update logic to implement.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 