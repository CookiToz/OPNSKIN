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
    
    if (!amount || amount < 100) { // Minimum 1€
      return NextResponse.json({ error: 'Invalid amount. Minimum 1€ required.' }, { status: 400 });
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

    // Créer ou récupérer le customer Stripe
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          steamId: user.steamId,
          userId: user.id,
        },
      });
      
      customerId = customer.id;
      
      // Sauvegarder l'ID du customer
      await supabaseAdmin
        .from('User')
        .update({ stripeCustomerId: customerId })
        .eq('id', user.id);
    }

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?success=deposit&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?cancel=deposit`,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Dépôt OPNSKIN',
              description: 'Recharge de votre wallet OPNSKIN',
            },
            unit_amount: amount, // Montant en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        userId: user.id,
        steamId: user.steamId,
        type: 'deposit',
      },
    });

    // Créer l'enregistrement de dépôt
    await supabaseAdmin.from('StripeDeposit').insert({
      userId: user.id,
      stripePaymentIntentId: session.payment_intent as string,
      stripeSessionId: session.id,
      amount: amount,
      currency: 'eur',
      status: 'pending',
    });

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url,
      message: 'Deposit session created successfully'
    });

  } catch (error: any) {
    console.error('Error creating deposit session:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create deposit session' 
    }, { status: 500 });
  }
}
