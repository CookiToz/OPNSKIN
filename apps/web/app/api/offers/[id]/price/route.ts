import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const UpdatePriceSchema = z.object({ price: z.number().min(0.01).max(10000) });

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('steamId', steamId)
      .single();
    if (userError || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const parsed = UpdatePriceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }
    const { price } = parsed.data;

    const { data: offer, error: offerError } = await supabaseAdmin
      .from('Offer')
      .select('sellerId,status')
      .eq('id', params.id)
      .single();
    if (offerError || !offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    if (offer.sellerId !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    if (offer.status !== 'AVAILABLE') return NextResponse.json({ error: 'Cannot change price when not AVAILABLE' }, { status: 400 });

    const { error: updateError } = await supabaseAdmin
      .from('Offer')
      .update({ price, updatedAt: new Date().toISOString() })
      .eq('id', params.id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}
