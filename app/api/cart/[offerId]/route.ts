import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// DELETE /api/cart/[offerId] : retirer une offre du panier
export async function DELETE(req: NextRequest, { params }: { params: { offerId: string } }) {
  const steamId = req.cookies.get('steamid')?.value;
  if (!steamId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const offerId = params.offerId;
  if (!offerId) {
    return NextResponse.json({ error: 'offerId requis' }, { status: 400 });
  }
  // Récupérer l'utilisateur
  const { data: user, error: userError } = await supabase.from('User').select('id').eq('steamId', steamId).single();
  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  // Supprimer l'item du panier
  const { error: delError } = await supabase.from('CartItem').delete().eq('userId', user.id).eq('offerId', offerId);
  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 