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

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      
      case 'transfer.paid':
        await handleTransferPaid(event.data.object as Stripe.Transfer);
        break;
      
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.metadata?.type === 'deposit') {
    // Mettre à jour le statut du dépôt
    await supabaseAdmin
      .from('StripeDeposit')
      .update({ status: 'succeeded' })
      .eq('stripeSessionId', session.id);

    // Créditer le wallet de l'utilisateur
    const userId = session.metadata.userId;
    const amount = session.amount_total! / 100; // Convertir en euros

    const { data: user } = await supabaseAdmin
      .from('User')
      .select('walletBalance')
      .eq('id', userId)
      .single();

    if (user) {
      await supabaseAdmin
        .from('User')
        .update({ walletBalance: user.walletBalance + amount })
        .eq('id', userId);

      // Marquer le dépôt comme crédité
      await supabaseAdmin
        .from('StripeDeposit')
        .update({ walletCredited: true })
        .eq('stripeSessionId', session.id);

      // Créer une notification
      await supabaseAdmin.from('Notification').insert({
        userId: userId,
        type: 'TRANSACTION_COMPLETED',
        title: 'Dépôt réussi',
        message: `Votre dépôt de ${amount.toFixed(2)}€ a été crédité sur votre wallet.`,
      });
    }
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Gérer les paiements directs (si nécessaire)
  console.log('Payment intent succeeded:', paymentIntent.id);
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  if (transfer.metadata?.type === 'withdrawal') {
    // Mettre à jour le statut du retrait
    await supabaseAdmin
      .from('StripeWithdrawal')
      .update({ status: 'pending' })
      .eq('stripeTransferId', transfer.id);
  }
}

async function handleTransferPaid(transfer: Stripe.Transfer) {
  if (transfer.metadata?.type === 'withdrawal') {
    // Mettre à jour le statut du retrait
    await supabaseAdmin
      .from('StripeWithdrawal')
      .update({ status: 'succeeded' })
      .eq('stripeTransferId', transfer.id);

    // Créer une notification
    const userId = transfer.metadata.userId;
    const amount = transfer.amount / 100; // Convertir en euros

    await supabaseAdmin.from('Notification').insert({
      userId: userId,
      type: 'TRANSACTION_COMPLETED',
      title: 'Retrait réussi',
      message: `Votre retrait de ${amount.toFixed(2)}€ a été traité avec succès.`,
    });
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  // Mettre à jour les informations du compte Stripe
  await supabaseAdmin
    .from('StripeAccount')
    .update({
      businessProfile: account.business_profile,
      requirements: account.requirements,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      updatedAt: new Date().toISOString(),
    })
    .eq('stripeAccountId', account.id);
}
