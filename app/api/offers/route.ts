import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Créer une nouvelle offre
export async function POST(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { itemId, itemName, itemImage, game, price } = await req.json();
    if (!itemId || !price || price <= 0) {
      return NextResponse.json({ error: 'Invalid offer data' }, { status: 400 });
    }
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase.from('User').select('*').eq('steamId', steamId).single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Vérifier qu'il n'existe pas déjà une offre active pour ce skin
    const { data: existingOffer } = await supabase
      .from('Offer')
      .select('*')
      .eq('itemId', itemId)
      .eq('sellerId', user.id)
      .eq('status', 'AVAILABLE')
      .single();

    if (existingOffer) {
      return NextResponse.json({ error: "Vous avez déjà une offre active pour ce skin." }, { status: 400 });
    }
    // Validation stricte du champ game
    const allowedGames = ['cs2', 'dota2', 'rust', 'tf2'];
    let offerGame = (game || '').toLowerCase();
    if (!allowedGames.includes(offerGame)) {
      offerGame = 'cs2';
    }
    // Créer l'offre
    const { data: offer, error: offerError } = await supabase.from('Offer').insert([{
      sellerId: user.id,
      itemId,
      itemName: itemName || `Item ${itemId}`,
      itemImage: itemImage || '',
      game: offerGame,
      price: parseFloat(price),
      status: 'AVAILABLE',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }]).select('*').single();
    if (offerError) {
      return NextResponse.json({ error: offerError.message }, { status: 500 });
    }
    // Créer une notification pour le vendeur
    await supabase.from('Notification').insert([{
      userId: user.id,
      type: 'OFFER_CREATED',
      title: 'Offre créée',
      message: `Votre offre pour ${offer.itemName} a été créée avec succès.`
    }]);
    return NextResponse.json({ offer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Lister toutes les offres disponibles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get('game');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {
      status: 'AVAILABLE'
    };

    if (game) {
      where.game = game;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Récupérer les offres
    const { data: offers, error: offersError, count: total } = await supabase
      .from('Offer')
      .select('*', { count: 'exact' })
      .eq('status', 'AVAILABLE')
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1);

    if (offersError) {
      return NextResponse.json({ error: offersError.message }, { status: 500 });
    }

    // Si besoin d'infos sur le vendeur, faire une requête séparée ici avec offer.sellerId
    return NextResponse.json({
      offers: offers.map(offer => ({
        id: offer.id,
        itemId: offer.itemId,
        itemName: offer.itemName,
        itemImage: offer.itemImage,
        game: offer.game,
        price: offer.price,
        status: offer.status,
        createdAt: offer.createdAt,
        sellerId: offer.sellerId
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 