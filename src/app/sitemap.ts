import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mindcare.ai';
  const now = new Date();

  const staticRoutes = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly' as const, priority: 1 },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/agent-chat`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    { url: `${baseUrl}/mood`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 },
    {
      url: `${baseUrl}/journal`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/habits`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sleep`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/breathing`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },

    {
      url: `${baseUrl}/community`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/crisis`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/onboarding`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/therapists`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/academic-calendar`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ];

  return staticRoutes;
}
