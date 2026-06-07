import { TooltipProvider } from '@/components/ui/tooltip';
import { OG_IMAGE } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Kalam } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const kalam = Kalam({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-kalam',
  display: 'swap',
});

const SITE_TITLE = 'Sepalo — Bonifici massivi CBI da Excel a XML, nel browser';
const SITE_DESCRIPTION =
  "Genera bonifici massivi CBI da un CSV o un Excel: scarica un XML CBIBdyPaymentRequest.00.04.01 valido per l'home banking. 100% nel tuo browser, nessun server, open source.";

export const metadata: Metadata = {
  title: {
    default: 'Sepalo',
    template: '%s — Sepalo',
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: 'Sepalo',
  keywords: [
    'CBI',
    'XML CBI',
    'bonifici massivi',
    'CBIBdyPaymentRequest.00.04.01',
    'SEPA',
    'home banking',
    'CSV',
    'XLSX',
    'pagamenti',
    'open source',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Sepalo',
    locale: 'it_IT',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${inter.variable} ${jetbrainsMono.variable} ${kalam.variable}`}>
      <body>
        <Script
          src="https://rybbit.ayoublefhim.com/api/script.js"
          data-site-id="6fa4ecf749f3"
          strategy="afterInteractive"
        />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
