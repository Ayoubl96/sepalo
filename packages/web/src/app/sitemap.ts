import type { MetadataRoute } from 'next';

const BASE = 'https://sepalo.it';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/guida`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/sicurezza`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
