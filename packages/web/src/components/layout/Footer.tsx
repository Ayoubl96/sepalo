import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm text-muted">
        <span>© 2026 Sepalo — MIT License</span>
        <div className="flex items-center gap-5">
          <Link href="/sicurezza" className="no-underline transition-colors hover:text-ink">
            Security
          </Link>
          <Link href="/about" className="no-underline transition-colors hover:text-ink">
            About
          </Link>
          <a
            href="https://github.com/ayoubl96/sepalo"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline transition-colors hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
