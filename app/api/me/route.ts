// app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const steamId = req.cookies.get('steamid')?.value;
    
    if (!steamId) {
      return NextResponse.json({ 
        loggedIn: false,
        error: 'No Steam ID found'
      });
    }

    // Rediriger vers l'API utilisateur
    const userResponse = await fetch(`${req.nextUrl.origin}/api/users/me`, {
      headers: {
        'Cookie': `steamid=${steamId}`
      }
    });

    const userData = await userResponse.json();
    return NextResponse.json(userData);

  } catch (error: any) {
    console.error('[ME API] Error:', error);
    return NextResponse.json({ 
      loggedIn: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
