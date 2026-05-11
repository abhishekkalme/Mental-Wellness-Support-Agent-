import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const publicPaths = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session;
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublicPath) {
    if (isLoggedIn && (pathname === '/signin' || pathname === '/signup' || pathname === '/')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL('/signin', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/chat|api/tools|api/sleep|api/mood|api/journal|api/habits|api/breathing|api/community|api/academic-calendar|api/therapists|api/crisis|api/meditation|api/admin).*)',
  ],
};
