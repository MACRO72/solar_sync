import { MetadataRoute } from 'next'

const BASE_URL = 'https://solar-sync-x.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about'],
        disallow: ['/dashboard/', '/api/', '/login', '/signup', '/auth/'],
      },
      {
        // Block AI training crawlers
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        disallow: ['/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
