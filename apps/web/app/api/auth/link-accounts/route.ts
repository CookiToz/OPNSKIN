import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

// Fonction helper pour créer le client Supabase
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERCE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('supabaseKey is required.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Lier un compte Google à un compte Steam existant
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { steamId } = await req.json();
    if (!steamId) {
      return NextResponse.json({ error: 'steamId requis' }, { status: 400 });
    }

    const supabase = createSupabaseClient();
    
    // Vérifier si le steamId existe déjà
    const { data: existingSteamUser } = await supabase
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();
    
    if (!existingSteamUser) {
      return NextResponse.json({ error: 'Compte Steam non trouvé' }, { status: 404 });
    }

    // Vérifier si l'utilisateur Google existe
    const { data: googleUser } = await supabase
      .from('User')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (!googleUser) {
      return NextResponse.json({ error: 'Compte Google non trouvé' }, { status: 404 });
    }

    // Si le compte Steam a déjà un email différent
    if (existingSteamUser.email && existingSteamUser.email !== session.user.email) {
      return NextResponse.json({ 
        error: 'Ce compte Steam est déjà lié à un autre email' 
      }, { status: 409 });
    }

    // Mettre à jour le compte Steam avec les informations Google
    const { error: updateError } = await supabase
      .from('User')
      .update({
        email: session.user.email,
        googleId: googleUser.googleId,
        updatedAt: new Date().toISOString()
      })
      .eq('steamId', steamId);
    
    if (updateError) {
      console.error('Error linking accounts:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la liaison' }, { status: 500 });
    }

    // Supprimer le compte Google séparé
    const { error: deleteError } = await supabase
      .from('User')
      .delete()
      .eq('id', googleUser.id);
    
    if (deleteError) {
      console.error('Error deleting Google account:', deleteError);
      // Ne pas échouer si la suppression échoue
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Comptes liés avec succès' 
    });

  } catch (error: any) {
    console.error('Error in link accounts:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur interne' 
    }, { status: 500 });
  }
}

// Vérifier si un compte Steam peut être lié
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const steamId = searchParams.get('steamId');
    
    if (!steamId) {
      return NextResponse.json({ error: 'steamId requis' }, { status: 400 });
    }

    const supabase = createSupabaseClient();
    
    // Vérifier si le steamId existe
    const { data: steamUser } = await supabase
      .from('User')
      .select('*')
      .eq('steamId', steamId)
      .single();
    
    if (!steamUser) {
      return NextResponse.json({ 
        canLink: false, 
        reason: 'Compte Steam non trouvé' 
      });
    }

    // Vérifier si le compte Steam a déjà un email
    if (steamUser.email && steamUser.email !== session.user.email) {
      return NextResponse.json({ 
        canLink: false, 
        reason: 'Ce compte Steam est déjà lié à un autre email' 
      });
    }

    return NextResponse.json({ 
      canLink: true, 
      steamUser: {
        name: steamUser.name,
        avatar: steamUser.avatar,
        hasEmail: !!steamUser.email
      }
    });

  } catch (error: any) {
    console.error('Error checking link possibility:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur interne' 
    }, { status: 500 });
  }
} 