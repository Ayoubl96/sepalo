import { SettingsPage } from '@/components/impostazioni/SettingsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Impostazioni' };

export default function ImpostazioniPage() {
  return <SettingsPage />;
}
