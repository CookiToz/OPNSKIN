import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic security headers without risking CSP breakage. CSP can be added later once audited fully.
function applySecurityHeaders(resp: NextResponse) {
  resp.headers.set('X-Frame-Options', 'DENY');
  resp.headers.set('X-Content-Type-Options', 'nosniff');
  resp.headers.set('Referrer-Policy', 'no-referrer');
  resp.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  if (process.env.NODE_ENV === 'production') {
    resp.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}

// Allow Stripe webhook and health probes to bypass CSRF origin checks
const CSRF_EXCEPTIONS: RegExp[] = [
  /^\/api\/stripe\/webhook(?:\/.*)?$/,
  /^\/api\/proxy-test(?:\/.*)?$/,
];

function isCsrfExempt(pathname: string): boolean {
  return CSRF_EXCEPTIONS.some((re) => re.test(pathname));
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Default allow
  const response = NextResponse.next();
  applySecurityHeaders(response);

  // CSRF protection for mutating API routes: require same-origin
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isApi = pathname.startsWith('/api');
  if (isApi && isMutating && !isCsrfExempt(pathname)) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    // Allow only same-origin requests
    if (!origin || !host || new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all paths except Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)',
  ],
};


