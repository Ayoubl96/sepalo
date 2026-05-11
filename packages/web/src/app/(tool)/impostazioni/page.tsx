import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings' };

export default function ImpostazioniPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>
      <p className="mt-2 text-sm text-muted">PIN, passphrase and reset coming in milestone M4.</p>
    </div>
  );
}
