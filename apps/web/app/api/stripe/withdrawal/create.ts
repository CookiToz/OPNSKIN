import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { amount } = await req.json();
    
    if (!amount || amount < 500) { // Minimum 5€
      return NextResponse.json({ error: 'Invalid amount. Minimum 5€ required.' }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Vérifier le solde du wallet
    if (user.walletBalance < amount / 100) { // amount est en centimes
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // Vérifier que l'utilisateur a un compte Stripe Connect
    if (!user.stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe account found. Please set up your account first.' }, { status: 400 });
    }

    // Vérifier le statut du compte Stripe
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    if (!account.payouts_enabled) {
      return NextResponse.json({ error: 'Your Stripe account is not ready for payouts. Please complete the onboarding process.' }, { status: 400 });
    }

    // Créer le transfert
    const transfer = await stripe.transfers.create({
      amount: amount, // Montant en centimes
      currency: 'eur',
      destination: user.stripeAccountId,
      metadata: {
        userId: user.id,
        steamId: user.steamId,
        type: 'withdrawal',
      },
    });

    // Créer l'enregistrement de retrait
    await supabaseAdmin.from('StripeWithdrawal').insert({
      userId: user.id,
      stripeTransferId: transfer.id,
      amount: amount,
      currency: 'eur',
      status: 'pending',
    });

    // Débiter le wallet de l'utilisateur
    await supabaseAdmin
      .from('User')
      .update({ walletBalance: user.walletBalance - (amount / 100) })
      .eq('id', user.id);

    // Marquer le retrait comme débité
    await supabaseAdmin
      .from('StripeWithdrawal')
      .update({ walletDebited: true })
      .eq('stripeTransferId', transfer.id);

    return NextResponse.json({ 
      success: true, 
      transferId: transfer.id,
      message: 'Withdrawal created successfully'
    });

  } catch (error: any) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create withdrawal' 
    }, { status: 500 });
  }
}
