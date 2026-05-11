import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

const PUBLIC_PREFIXES = [
  '/api/auth/',
  '/api/tools/',
  '/assets/',
  '/_next/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/og-image.png',
];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;

  const isLoggedIn = !!session?.user;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route
  );

  const isPublicPrefix = PUBLIC_PREFIXES.some(
    (prefix) => pathname.startsWith(prefix)
  );

  const isApiRoute = pathname.startsWith('/api/');

  // Allow public routes/assets/apis
  if (isPublicRoute || isPublicPrefix) {
    // Redirect signed-in users away from auth pages/home
    if (
      isLoggedIn &&
      (pathname === '/' ||
        pathname === '/signin' ||
        pathname === '/signup')
    ) {
      return NextResponse.redirect(
        new URL('/onboarding', req.url)
      );
    }

    return NextResponse.next();
  }

  // Allow API routes (except auth already handled above)
  if (isApiRoute && !pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Require auth
  if (!isLoggedIn) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set(
      'callbackUrl',
      pathname + search
    );

    return NextResponse.redirect(signInUrl);
  }

  // Admin protection
  if (
    pathname.startsWith('/admin') &&
    session.user?.role !== 'admin'
  ) {
    return NextResponse.redirect(
      new URL('/dashboard', req.url)
    );
  }

  // Mentor protection
  if (
    pathname.startsWith('/mentor') &&
    session.user?.role !== 'mentor' &&
    session.user?.role !== 'admin'
  ) {
    return NextResponse.redirect(
      new URL('/dashboard', req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)).*)',
  ],
};