import { SITE_URL } from '@/lib/site';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/genera', '/profilo', '/impostazioni'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
