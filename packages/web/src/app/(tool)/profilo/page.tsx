import { ProfilePage } from '@/components/profile/ProfilePage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profilo' };

export default function ProfiloPage() {
  return <ProfilePage />;
}
