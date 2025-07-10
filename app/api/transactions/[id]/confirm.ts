import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transactionId = params.id;
    const { buyerId } = await req.json();
    if (!buyerId) {
      return NextResponse.json({ error: 'buyerId requis' }, { status: 400 });
    }
    // 1. Vérifier que la transaction existe
    const { data: transaction, error: txError } = await supabase.from('Transaction').select('*').eq('id', transactionId).single();
    if (txError || !transaction) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 });
    }
    if (transaction.buyerId !== buyerId) {
      return NextResponse.json({ error: 'Transaction non autorisée pour cet utilisateur' }, { status: 403 });
    }
    if (transaction.status !== 'WAITING_TRADE') {
      return NextResponse.json({ error: 'Transaction déjà confirmée ou annulée' }, { status: 409 });
    }
    // 2. Mettre à jour la transaction et l'offre liée
    await supabase.from('Transaction').update({ status: 'DONE', completedAt: new Date().toISOString() }).eq('id', transactionId);
    await supabase.from('Offer').update({ status: 'COMPLETED' }).eq('id', transaction.offerId);
    return NextResponse.json({ success: true, message: 'Transaction confirmée et offre marquée comme complétée.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
} 