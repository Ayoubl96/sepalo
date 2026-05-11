import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guide',
  description: 'Learn how to use Sepalo to generate CBI XML payment files from CSV or XLSX.',
};

export default function GuidaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-ink">Guide</h1>
      <p className="mt-3 text-muted">Documentation coming in milestone M5.</p>
    </div>
  );
}
