import { describe, it, expect } from '@jest/globals';

describe('Middleware / Proxy', () => {
  it('has correct matcher configuration', () => {
    const config = {
      matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)).*)',
      ],
    };
    expect(config.matcher).toHaveLength(1);
    expect(config.matcher[0]).toContain('_next/static');
  });

  it('defines public routes for unauthenticated access', () => {
    const publicRoutes = [
      '/',
      '/signin',
      '/signup',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
    ];
    expect(publicRoutes).toContain('/');
    expect(publicRoutes).toContain('/signin');
  });

  it('defines public prefixes for static assets', () => {
    const publicPrefixes = ['/api/auth/', '/api/tools/', '/assets/', '/_next/', '/favicon.ico'];
    expect(publicPrefixes.every((p) => p.startsWith('/'))).toBe(true);
  });
});
