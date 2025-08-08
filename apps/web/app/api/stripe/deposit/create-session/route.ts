import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { amount } = await req.json();
    if (!amount || amount < 500) {
      return NextResponse.json({ error: 'Invalid amount. Minimum 5€ required.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = user.stripeCustomerId as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: { steamId: user.steamId, userId: user.id },
      });
      customerId = customer.id;
      await supabaseAdmin.from('User').update({ stripeCustomerId: customerId }).eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?success=deposit&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?cancel=deposit`,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'Dépôt OPNSKIN', description: 'Recharge de votre wallet OPNSKIN' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: { userId: user.id, steamId: user.steamId, type: 'deposit' },
    });

    await supabaseAdmin.from('StripeDeposit').insert({
      userId: user.id,
      stripePaymentIntentId: session.payment_intent as string,
      stripeSessionId: session.id,
      amount: amount,
      currency: 'eur',
      status: 'pending',
    });

    return NextResponse.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating deposit session:', error);
    return NextResponse.json({ error: error.message || 'Failed to create deposit session' }, { status: 500 });
  }
}
