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

    if (user.walletBalance < amount / 100) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    if (!user.stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe account found. Please set up your account first.' }, { status: 400 });
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    if (!account.payouts_enabled) {
      return NextResponse.json({ error: 'Your Stripe account is not ready for payouts. Please complete the onboarding process.' }, { status: 400 });
    }

    const transfer = await stripe.transfers.create({
      amount: amount,
      currency: 'eur',
      destination: user.stripeAccountId,
      metadata: { userId: user.id, steamId: user.steamId, type: 'withdrawal' },
    });

    await supabaseAdmin.from('StripeWithdrawal').insert({
      userId: user.id,
      stripeTransferId: transfer.id,
      amount: amount,
      currency: 'eur',
      status: 'pending',
    });

    await supabaseAdmin
      .from('User')
      .update({ walletBalance: user.walletBalance - (amount / 100) })
      .eq('id', user.id);

    await supabaseAdmin
      .from('StripeWithdrawal')
      .update({ walletDebited: true })
      .eq('stripeTransferId', transfer.id);

    return NextResponse.json({ success: true, transferId: transfer.id });
  } catch (error: any) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json({ error: error.message || 'Failed to create withdrawal' }, { status: 500 });
  }
}
