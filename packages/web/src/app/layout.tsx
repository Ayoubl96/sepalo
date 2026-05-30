import { TooltipProvider } from '@/components/ui/tooltip';
import { SITE_URL } from '@/lib/site';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Kalam } from 'next/font/google';
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

export const metadata: Metadata = {
  title: {
    default: 'Sepalo',
    template: '%s — Sepalo',
  },
  description:
    'Generate CBI XML files (CBIBdyPaymentRequest.00.04.01) directly in your browser. No account, no server, fully private.',
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${inter.variable} ${jetbrainsMono.variable} ${kalam.variable}`}>
      <head>
        <script
          src="https://rybbit.ayoublefhim.com/api/script.js"
          data-site-id="6fa4ecf749f3"
          defer
        />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
