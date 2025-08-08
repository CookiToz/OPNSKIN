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

    if (!user.stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe account found. Please create one first.' }, { status: 400 });
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?refresh=stripe`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?success=stripe`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ success: true, url: accountLink.url });
  } catch (error: any) {
    console.error('Error creating account link:', error);
    return NextResponse.json({ error: error.message || 'Failed to create account link' }, { status: 500 });
  }
}
