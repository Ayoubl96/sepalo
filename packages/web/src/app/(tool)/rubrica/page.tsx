import { AddressBookPage } from '@/components/rubrica/AddressBookPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Address book — Sepalo' };

export default function RubricaPage() {
  return <AddressBookPage />;
}
