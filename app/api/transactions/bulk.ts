import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { offerIds } = await req.json();
    if (!Array.isArray(offerIds) || offerIds.length === 0) {
      return NextResponse.json({ error: 'Aucune offre à acheter.' }, { status: 400 });
    }
    // Récupérer l'utilisateur
    const { data: buyer, error: buyerError } = await supabase.from('User').select('*').eq('steamId', steamId).single();
    if (buyerError || !buyer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Récupérer toutes les offres
    const { data: offers, error: offersError } = await supabase
      .from('Offer')
      .select('*')
      .in('id', offerIds);
    if (offersError) {
      return NextResponse.json({ error: offersError.message }, { status: 500 });
    }
    // Calculer le total
    const total = offers.reduce((sum, offer) => sum + (offer.price || 0), 0);
    if (buyer.walletBalance < total) {
      return NextResponse.json({ error: 'Solde insuffisant pour acheter tous les items.' }, { status: 400 });
    }
    // Pour chaque offre, créer la transaction si possible
    const results = [];
    for (const offer of offers) {
      if (!offer || offer.status !== 'AVAILABLE' || offer.sellerId === buyer.id) {
        results.push({ offerId: offer?.id, success: false, error: 'Offre non disponible ou invalide.' });
        continue;
      }
      // Créer la transaction
      const { data: transaction, error: transactionError } = await supabase.from('Transaction').insert([{
        offerId: offer.id,
        buyerId: buyer.id,
        escrowAmount: offer.price,
        status: 'WAITING_TRADE',
        startedAt: new Date().toISOString()
      }]).select('*').single();
      if (transactionError) {
        results.push({ offerId: offer.id, success: false, error: transactionError.message });
        continue;
      }
      // Mettre à jour le statut de l'offre
      await supabase.from('Offer').update({ status: 'PENDING_TRADE_OFFER' }).eq('id', offer.id);
      results.push({ offerId: offer.id, success: true });
    }
    // Débiter le solde total de l'utilisateur
    await supabase.from('User').update({ walletBalance: buyer.walletBalance - total }).eq('id', buyer.id);
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('ERREUR BULK TRANSACTION:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 