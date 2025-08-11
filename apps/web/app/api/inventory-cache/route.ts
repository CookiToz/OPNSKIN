import { NextRequest, NextResponse } from 'next/server';
import { getSteamIdFromRequest } from '@/lib/session';
export const runtime = 'nodejs';
import { getOrFetchInventory } from '@/lib/inventory-cache';
import { rateLimit, extractClientIp } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const steamId = getSteamIdFromRequest(req);
    if (!steamId) {
      return NextResponse.json({ error: 'Non connecté à Steam' }, { status: 401 });
    }

    // Récupérer les paramètres de l'URL
    const { searchParams } = new URL(req.url);
    const appid = searchParams.get('appid') || undefined;
    const currency = searchParams.get('currency') || 'EUR';
    if (!appid) {
      return NextResponse.json({ error: 'appid requis' }, { status: 400 });
    }

    console.log(`[INVENTORY CACHE API] Request for SteamID: ${steamId}, Game: ${appid}, Currency: ${currency}`);

    // Rate limit per user and IP
    const ip = extractClientIp(req.headers);
    const keyUser = `inv:${steamId}`;
    const keyIp = `invip:${ip}`;
    const u = rateLimit(keyUser, 10, 60_000); // 10/min par utilisateur
    const i = rateLimit(keyIp, 60, 60_000);   // 60/min par IP
    if (!u.allowed || !i.allowed) {
      const retry = Math.max(u.retryAfter || 0, i.retryAfter || 0);
      // Si l'utilisateur a atteint sa propre limite → bloquer seulement lui, pas l'IP entière
      if (!u.allowed) {
        return NextResponse.json({ error: 'Rate limit user', retryAfter: retry }, { status: 429 });
      }
      // Sinon, l'IP a atteint la limite (possiblement du spam): on renvoie un retry sans bloquer d'autres users/account si possible
      return NextResponse.json({ error: 'Rate limit ip', retryAfter: retry }, { status: 429 });
    }

    // Utiliser la fonction de cache: par défaut, préférer le cache existant
    const forceFresh = (searchParams.get('force') === 'true');
    const result = await getOrFetchInventory(steamId, appid, currency, { forceFresh, preferCache: !forceFresh });

    // Retourner la réponse avec les métadonnées
    return NextResponse.json({
      items: result.items || [],
      lastUpdated: result.lastUpdated || 0,
      stale: !!result.stale,
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