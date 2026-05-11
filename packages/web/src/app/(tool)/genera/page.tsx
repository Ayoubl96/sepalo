import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Generate XML' };

export default function GeneraPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-12 text-center">
      <h1 className="text-2xl font-semibold text-ink">Generate XML</h1>
      <p className="mt-2 text-sm text-muted">Upload flow coming in milestone M3.</p>
    </div>
  );
}
