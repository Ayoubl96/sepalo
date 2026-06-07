import { GeneraPage } from '@/components/genera/GeneraPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Genera XML' };

export default function GeneraRoute() {
  return <GeneraPage />;
}
