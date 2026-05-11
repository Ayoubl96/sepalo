import { TooltipProvider } from '@/components/ui/tooltip';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: {
    default: 'Sepalo',
    template: '%s — Sepalo',
  },
  description:
    'Generate CBI XML files (CBIBdyPaymentRequest.00.04.01) directly in your browser. No account, no server, fully private.',
  metadataBase: new URL('https://sepalo.it'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
