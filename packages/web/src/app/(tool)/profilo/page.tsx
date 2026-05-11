import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfiloPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-ink">Profile</h1>
      <p className="mt-2 text-sm text-muted">Initiator profile form coming in milestone M2.</p>
    </div>
  );
}
