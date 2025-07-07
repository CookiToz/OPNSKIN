import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // URL de base simple
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = NextResponse.redirect(baseUrl);
    
    // Suppression du cookie Steam
    response.cookies.set('steamid', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immédiatement
    });

    console.log('[LOGOUT] User logged out successfully');
    return response;
  } catch (error) {
    console.error('[LOGOUT] Error during logout:', error);
    return NextResponse.redirect('/login?error=internal');
  }
}
