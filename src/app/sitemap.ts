import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Hardcoding the correct domain so Vercel env vars don't override it accidentally!
  const baseUrl = 'https://solar-sync-x.vercel.app';

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
