import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Address book' };

export default function RubricaPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-ink">Address book</h1>
      <p className="mt-2 text-sm text-muted">Beneficiary management coming in milestone M4.</p>
    </div>
  );
}
