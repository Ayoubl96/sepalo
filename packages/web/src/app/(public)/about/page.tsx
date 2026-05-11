import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Sepalo — mission, open source, and how to contribute.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-ink">About</h1>
      <p className="mt-3 text-muted">About page coming in milestone M5.</p>
    </div>
  );
}
