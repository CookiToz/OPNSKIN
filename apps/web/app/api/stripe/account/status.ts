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

export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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

    if (!user.stripeAccountId) {
      return NextResponse.json({ 
        hasAccount: false,
        message: 'No Stripe account found'
      });
    }

    // Récupérer les informations du compte Stripe
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    
    // Récupérer les dépôts et retraits récents
    const { data: deposits } = await supabaseAdmin
      .from('StripeDeposit')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(5);

    const { data: withdrawals } = await supabaseAdmin
      .from('StripeWithdrawal')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(5);

    return NextResponse.json({
      hasAccount: true,
      account: {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: account.requirements,
        businessProfile: account.business_profile,
      },
      deposits: deposits || [],
      withdrawals: withdrawals || [],
    });

  } catch (error: any) {
    console.error('Error getting account status:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to get account status' 
    }, { status: 500 });
  }
}
