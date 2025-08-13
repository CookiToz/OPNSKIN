import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { offerIds } = await req.json();
    if (!Array.isArray(offerIds) || offerIds.length === 0) {
      return NextResponse.json({ error: 'Aucune offre à acheter.' }, { status: 400 });
    }
    // Récupérer l'utilisateur
    const { data: buyer, error: buyerError } = await supabaseAdmin.from('User').select('*').eq('steamId', steamId).single();
    if (buyerError || !buyer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Récupérer toutes les offres
    const { data: offers, error: offersError } = await supabaseAdmin
      .from('Offer')
      .select('*')
      .in('id', offerIds);
    if (offersError) {
      return NextResponse.json({ error: offersError.message }, { status: 500 });
    }
    // Détails d'analyse
    const offerIdSet = new Set(offerIds);
    const foundIds = new Set((offers || []).map((o: any) => o.id));
    const missingIds = offerIds.filter((id: string) => !foundIds.has(id));

    // Pour chaque offre, créer la transaction si possible
    const results: any[] = [];
    let successTotalWithFees = 0;
    const successIds: string[] = [];
    for (const offer of offers) {
      if (!offer || offer.status !== 'AVAILABLE' || offer.sellerId === buyer.id) {
        results.push({ offerId: offer?.id, success: false, error: 'Offre non disponible ou invalide.' });
        continue;
      }
      
      // Calculer les frais pour cette offre
      const transactionFee = (offer.price || 0) * 0.05;
      
      // Créer la transaction
      const { data: transaction, error: transactionError } = await supabaseAdmin.from('Transaction').insert([{
        offerId: offer.id,
        buyerId: buyer.id,
        sellerId: offer.sellerId,
        transactionFee: transactionFee,
        status: 'PENDING',
      }]).select('*').single();
      if (transactionError) {
        results.push({ offerId: offer.id, success: false, error: transactionError.message });
        continue;
      }
      // Mettre à jour le statut de l'offre
      await supabaseAdmin.from('Offer').update({ status: 'PENDING_TRADE_OFFER' }).eq('id', offer.id);
      // Notification vendeur
      await supabaseAdmin.from('Notification').insert([{
        userId: offer.sellerId,
        type: 'NEW_SALE',
        title: 'Nouvelle vente à traiter',
        message: `Un acheteur a acheté votre skin ${offer.itemName || offer.itemId}. Veuillez procéder à l'échange Steam.`
      }]);
      results.push({ offerId: offer.id, success: true });
      successIds.push(offer.id);
      successTotalWithFees += (offer.price || 0) + transactionFee;
    }
    // Débiter seulement le total des offres validées
    if (successTotalWithFees > 0) {
      await supabaseAdmin.from('User').update({ walletBalance: buyer.walletBalance - successTotalWithFees }).eq('id', buyer.id);
      // Supprimer du panier uniquement les offres achetées
      await supabaseAdmin.from('CartItem').delete().match({ userId: buyer.id }).in('offerId', successIds);
    }
    // Notification acheteur (une seule fois)
    if (successIds.length > 0) {
      await supabaseAdmin.from('Notification').insert([{
        userId: buyer.id,
        type: 'PAYMENT_CONFIRMED',
        title: 'Paiement validé',
        message: `Votre paiement a bien été pris en compte. Attendez l'envoi du skin par le vendeur.`
      }]);
    }
    return NextResponse.json({ results, successIds, missingIds });
  } catch (error: any) {
    console.error('ERREUR BULK TRANSACTION:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 