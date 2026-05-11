import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security',
  description: 'How Sepalo protects your data — architecture, encryption, and threat model.',
};

export default function SicurezzaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-ink">Security</h1>
      <p className="mt-3 text-muted">Threat model and security details coming in milestone M5.</p>
    </div>
  );
}
