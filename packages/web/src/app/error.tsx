'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: error boundary must log unexpected errors
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper">
      <p className="text-5xl font-bold text-line-strong">Oops</p>
      <h1 className="mt-4 text-xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-muted">
        An unexpected error occurred. Your data has not been sent anywhere.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-primary-ink"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink no-underline transition-colors hover:bg-paper-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
