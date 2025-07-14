import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Créer une nouvelle transaction (acheter une offre)
export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      console.log('ERREUR: Pas de steamId dans les cookies');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { offerId } = await req.json();
    console.log('--- ACHAT DEBUG ---');
    console.log('offerId reçu:', offerId);
    // Récupérer l'acheteur
    const { data: buyer, error: buyerError } = await supabase.from('User').select('*').eq('steamId', steamId).single();
    console.log('buyer:', buyer, 'Erreur:', buyerError);
    if (buyerError || !buyer) {
      console.log('ERREUR: User not found', buyerError, buyer);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Récupérer l'offre
    console.log('offerId envoyé:', offerId, typeof offerId);
    const { data: offer, error: offerError } = await supabase
      .from('Offer')
      .select('*')
      .eq('id', String(offerId).trim())
      .single();
    console.log('offre trouvée:', offer, 'Erreur:', offerError);
    if (offerError || !offer) {
      console.log('ERREUR: Offer not found', offerError, offer);
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    if (offer.status !== 'AVAILABLE') {
      console.log('ERREUR: Offer is not available', offer.status);
      return NextResponse.json({ error: 'Offer is not available' }, { status: 400 });
    }
    if (offer.sellerId === buyer.id) {
      console.log('ERREUR: Cannot buy your own offer', offer.sellerId, buyer.id);
      return NextResponse.json({ error: 'Cannot buy your own offer' }, { status: 400 });
    }
    if (buyer.walletBalance < offer.price) {
      console.log('ERREUR: Insufficient wallet balance', buyer.walletBalance, offer.price);
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }
    // Créer la transaction
    const { data: transaction, error: transactionError } = await supabase.from('Transaction').insert([{
      offerId,
      buyerId: buyer.id,
      escrowAmount: offer.price,
      status: 'WAITING_TRADE',
      startedAt: new Date().toISOString()
    }]).select('*,Offer(*),User:buyerId(id,name,tradeUrl,avatar)').single();
    if (transactionError) {
      console.log('ERREUR: transactionError', transactionError);
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }
    // Ici, tu peux ajouter la logique de mise à jour du solde, etc.
    console.log('Transaction créée avec succès:', transaction);
    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.log('ERREUR: Exception générale', error);
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
    // Correction : on fait deux requêtes séparées pour éviter l'erreur de parsing
    // 1. Transactions où l'utilisateur est acheteur
    const { data: buyerTx, error: buyerTxError } = await supabase
      .from('Transaction')
      .select('*,Offer(*),User:buyerId(id,name,tradeUrl,avatar)')
      .eq('buyerId', user.id)
      .order('startedAt', { ascending: false });
    // 2. Transactions où l'utilisateur est vendeur (via offerId.sellerId)
    const { data: sellerTx, error: sellerTxError } = await supabase
      .from('Transaction')
      .select('*,Offer(*),User:buyerId(id,name,tradeUrl,avatar)')
      .order('startedAt', { ascending: false });
    // On filtre côté JS pour sellerId
    const sellerTxFiltered = (sellerTx || []).filter(t => t.Offer?.sellerId === user.id);
    // On fusionne et on déduplique
    const allTx = [...(buyerTx || []), ...sellerTxFiltered].filter((tx, idx, arr) =>
      arr.findIndex(t => t.id === tx.id) === idx
    );
    if (buyerTxError || sellerTxError) {
      return NextResponse.json({ error: (buyerTxError?.message || sellerTxError?.message) }, { status: 500 });
    }
    return NextResponse.json({
      transactions: (allTx || []).map(t => ({
        id: t.id,
        offerId: t.offerId,
        escrowAmount: t.escrowAmount,
        status: t.status,
        startedAt: t.startedAt,
        completedAt: t.completedAt,
        cancelledAt: t.cancelledAt,
        offer: t.Offer || null, // retourne l'objet complet de l'offre
        buyer: t.User || null, // retourne l'objet complet du buyer
        isBuyer: t.buyerId === user.id,
        isSeller: t.Offer?.sellerId === user.id
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 