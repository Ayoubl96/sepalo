import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sepalo — Generate CBI/SEPA XML files free, in your browser',
  description:
    'Upload a CSV or XLSX file with your payments and generate a valid CBIBdyPaymentRequest.00.04.01 XML file — 100% in your browser, zero data sent to any server.',
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          Open source · MIT · Privacy first
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-ink">
          Mass payments, no hassle
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Upload a CSV or XLSX file, review your transactions, and download a CBI-compliant XML file
          — everything happens in your browser. No account, no server, no risk.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/genera"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-paper no-underline transition-colors hover:bg-primary-ink"
          >
            Generate XML
          </Link>
          <Link
            href="/guida"
            className="rounded-lg border border-line bg-surface px-6 py-3 font-semibold text-ink no-underline transition-colors hover:bg-paper-2"
          >
            See how it works
          </Link>
        </div>
      </div>

      <div className="mt-24 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'Privacy by design',
            body: 'Your payment data is processed entirely in the browser. Nothing is ever sent to a server.',
          },
          {
            title: 'MIT open source',
            body: 'The code is public and auditable. No black boxes, no hidden tracking.',
          },
          {
            title: 'Zero account',
            body: 'No sign-up, no email, no subscription. Your profile is stored locally and encrypted with your PIN.',
          },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
