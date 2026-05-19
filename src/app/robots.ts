import type { MetadataRoute } from 'next';

const SITE_URL = 'https://scilog12.iotok.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/login',
          '/register',
          '/interview/',
        ],
      },
      { userAgent: 'Yeti', allow: '/', disallow: ['/api/', '/admin/', '/dashboard/', '/interview/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
