import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // URL de base simple
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = NextResponse.redirect(baseUrl);
    
    // Suppression des cookies
    response.cookies.set('steamid', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expire immédiatement
    });
    response.cookies.set('sid', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    console.log('[LOGOUT] User logged out successfully');
    return response;
  } catch (error) {
    console.error('[LOGOUT] Error during logout:', error);
    return NextResponse.redirect('/login?error=internal');
  }
}
