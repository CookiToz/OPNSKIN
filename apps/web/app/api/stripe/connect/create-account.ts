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

    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Vérifier si l'utilisateur a déjà un compte Stripe
    if (user.stripeAccountId) {
      return NextResponse.json({ 
        error: 'User already has a Stripe account',
        accountId: user.stripeAccountId 
      }, { status: 400 });
    }

    // Créer le compte Stripe Connect
    const account = await stripe.accounts.create({
      business_profile: {
        name: user.name || 'OPNSKIN User',
        url: 'https://opnskin.com',
      },
      country: 'fr',
      controller: {
        losses: {
          payments: 'application',
        },
        stripe_dashboard: {
          type: 'express',
        },
        fees: {
          payer: 'application',
        },
        requirement_collection: 'stripe',
      },
    });

    // Sauvegarder l'ID du compte dans la base de données
    await supabaseAdmin
      .from('User')
      .update({ stripeAccountId: account.id })
      .eq('id', user.id);

    // Créer l'enregistrement StripeAccount
    await supabaseAdmin.from('StripeAccount').insert({
      userId: user.id,
      stripeAccountId: account.id,
      businessProfile: account.business_profile,
      requirements: account.requirements,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });

    return NextResponse.json({ 
      success: true, 
      accountId: account.id,
      message: 'Stripe account created successfully'
    });

  } catch (error: any) {
    console.error('Error creating Stripe account:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create Stripe account' 
    }, { status: 500 });
  }
}
