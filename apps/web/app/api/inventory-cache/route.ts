import { NextRequest, NextResponse } from 'next/server';
import { getOrFetchInventory } from '@/lib/inventory-cache';

export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    if (!steamId) {
      return NextResponse.json({ error: 'Non connecté à Steam' }, { status: 401 });
    }

    // Récupérer les paramètres de l'URL
    const { searchParams } = new URL(req.url);
    const appid = searchParams.get('appid') || '730';
    const currency = searchParams.get('currency') || 'EUR';

    console.log(`[INVENTORY CACHE API] Request for SteamID: ${steamId}, Game: ${appid}, Currency: ${currency}`);

    // Utiliser la fonction de cache
    const result = await getOrFetchInventory(steamId, appid, currency);

    // Retourner la réponse avec les métadonnées
    return NextResponse.json({
      items: result.items,
      lastUpdated: result.lastUpdated,
      stale: result.stale || false,
      message: result.message,
      success: true
    });

  } catch (error: any) {
    console.error('[INVENTORY CACHE API] Error:', error);
    
    // Gestion spécifique des erreurs Steam
    if (error.message?.includes('403')) {
      return NextResponse.json({ 
        error: 'Inventaire privé ou non accessible. Vérifiez que votre profil Steam est public.',
        success: false
      }, { status: 403 });
    }
    
    if (error.message?.includes('404')) {
      return NextResponse.json({ 
        error: 'Aucun inventaire trouvé pour ce compte Steam.',
        success: false
      }, { status: 404 });
    }
    
    if (error.message?.includes('429')) {
      return NextResponse.json({ 
        error: 'Steam limite temporairement les requêtes. Veuillez patienter.',
        success: false
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur',
      success: false
    }, { status: 500 });
  }
} 