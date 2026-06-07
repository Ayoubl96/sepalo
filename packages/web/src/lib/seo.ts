import type { Metadata } from 'next';
import { SITE_URL } from './site';

type PageMetadataInput = {
  /** Page name. The root layout template appends " — Sepalo" to build the <title>. */
  title: string;
  /** Meta description, ideally 120–160 characters, in Italian (user-facing). */
  description: string;
  /** Absolute path starting with "/", e.g. "/guida". Used for the canonical URL and og:url. */
  path: string;
  /** When set, used verbatim for the <title> and social title, bypassing the layout template. */
  absoluteTitle?: string;
};

/** Shared 1200x630 social-share image, served as a static asset from public/. */
export const OG_IMAGE = '/og.png';

/**
 * Builds per-page metadata with a canonical URL plus OpenGraph and Twitter cards,
 * including the shared social-share image.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
}: PageMetadataInput): Metadata {
  const socialTitle = absoluteTitle ?? `${title} — Sepalo`;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: 'Sepalo',
      locale: 'it_IT',
      url: `${SITE_URL}${path}`,
      title: socialTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [OG_IMAGE],
    },
  };
}
