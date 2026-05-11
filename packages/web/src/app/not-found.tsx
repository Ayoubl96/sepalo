import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper">
      <p className="text-7xl font-bold text-line-strong">404</p>
      <h1 className="mt-4 text-xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-paper no-underline transition-colors hover:bg-primary-ink"
      >
        Back to home
      </Link>
    </div>
  );
}
