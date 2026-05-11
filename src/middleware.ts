import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

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
  '/og-image.png',
];

type Session = {
  user?: {
    id?: string;
    role?: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

export default auth(async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
  const isPublicPrefix = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isApiRoute = pathname.startsWith('/api/');

  if (isPublicRoute || isPublicPrefix) {
    return NextResponse.next();
  }

  if (isApiRoute && !pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const session = (req as unknown as { auth: Session | null }).auth;
  if (!session?.user) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith('/admin') && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (
    pathname.startsWith('/mentor') &&
    session.user.role !== 'mentor' &&
    session.user.role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)).*)',
  ],
};
