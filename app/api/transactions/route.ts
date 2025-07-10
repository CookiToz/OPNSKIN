import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Créer une nouvelle transaction (acheter une offre)
export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { offerId } = await req.json();
    if (!offerId) {
      return NextResponse.json({ error: 'Offer ID required' }, { status: 400 });
    }
    // Récupérer l'acheteur
    const { data: buyer, error: buyerError } = await supabase.from('User').select('*').eq('steamId', steamId).single();
    if (buyerError || !buyer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Récupérer l'offre
    const { data: offer, error: offerError } = await supabase.from('Offer').select('*,seller(*)').eq('id', offerId).single();
    if (offerError || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    if (offer.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Offer is not available' }, { status: 400 });
    }
    if (offer.sellerId === buyer.id) {
      return NextResponse.json({ error: 'Cannot buy your own offer' }, { status: 400 });
    }
    if (buyer.walletBalance < offer.price) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }
    // Créer la transaction
    const { data: transaction, error: transactionError } = await supabase.from('Transaction').insert([{
      offerId,
      buyerId: buyer.id,
      escrowAmount: offer.price,
      status: 'WAITING_TRADE',
      startedAt: new Date().toISOString()
    }]).select('*,offer(*),buyer(*)').single();
    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }
    // Ici, tu peux ajouter la logique de mise à jour du solde, etc.
    return NextResponse.json({ transaction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Lister les transactions de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { data: user, error: userError } = await supabase.from('User').select('*').eq('steamId', steamId).single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { data: transactions, error: txError } = await supabase
      .from('Transaction')
      .select('*,offer(*,seller(id,steamId,name,avatar)),buyer(id,steamId,name,avatar)')
      .or(`buyerId.eq.${user.id},offer.sellerId.eq.${user.id}`)
      .order('startedAt', { ascending: false });
    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }
    return NextResponse.json({
      transactions: (transactions || []).map(t => ({
        id: t.id,
        offerId: t.offerId,
        escrowAmount: t.escrowAmount,
        status: t.status,
        startedAt: t.startedAt,
        completedAt: t.completedAt,
        cancelledAt: t.cancelledAt,
        offer: t.offer,
        buyer: t.buyer,
        isBuyer: t.buyerId === user.id,
        isSeller: t.offer?.sellerId === user.id
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 