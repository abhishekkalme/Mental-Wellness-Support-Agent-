import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/onboarding',
          '/reset-password',
          '/forgot-password',
          '/verify-email',
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mindcare.ai'}/sitemap.xml`,
  };
}
