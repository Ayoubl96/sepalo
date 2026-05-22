import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/genera', '/profilo', '/rubrica', '/impostazioni'],
    },
    sitemap: 'https://sepalo.it/sitemap.xml',
  };
}
