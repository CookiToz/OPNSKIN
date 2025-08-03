import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fonction helper pour créer le client Supabase
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERCE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('supabaseKey is required.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Récupérer les skins les plus populaires
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get('game') || '730'; // CS2 par défaut
    const limit = parseInt(searchParams.get('limit') || '8'); // 8 skins par défaut
    
    const supabase = createSupabaseClient();
    
    console.log(`[POPULAR SKINS] Fetching popular skins for game: ${game}, limit: ${limit}`);
    
    // Récupérer les offres les plus populaires basées sur les transactions
    const { data: popularOffers, error: offersError } = await supabase
      .from('Offer')
      .select(`
        *,
        transactions:Transaction(count)
      `)
      .eq('game', game)
      .eq('status', 'AVAILABLE')
      .order('createdAt', { ascending: false })
      .limit(limit);
    
    if (offersError) {
      console.error('Error fetching popular offers:', offersError);
      return NextResponse.json({ error: 'Failed to fetch popular offers' }, { status: 500 });
    }
    
    // Si pas assez d'offres populaires, récupérer les plus récentes
    if (!popularOffers || popularOffers.length < limit) {
      console.log(`[POPULAR SKINS] Not enough popular offers, fetching recent offers`);
      
      const { data: recentOffers, error: recentError } = await supabase
        .from('Offer')
        .select('*')
        .eq('game', game)
        .eq('status', 'AVAILABLE')
        .order('createdAt', { ascending: false })
        .limit(limit);
      
      if (recentError) {
        console.error('Error fetching recent offers:', recentError);
        return NextResponse.json({ error: 'Failed to fetch recent offers' }, { status: 500 });
      }
      
      console.log(`[POPULAR SKINS] Found ${recentOffers?.length || 0} recent offers`);
      return NextResponse.json(recentOffers || []);
    }
    
    console.log(`[POPULAR SKINS] Found ${popularOffers?.length || 0} popular offers`);
    return NextResponse.json(popularOffers || []);
    
  } catch (error: any) {
    console.error('Error in popular skins API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 