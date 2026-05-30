import { SITE_URL } from '@/lib/site';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/guida`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/docs`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/roadmap`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/sicurezza`, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
