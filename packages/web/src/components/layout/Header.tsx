import Link from 'next/link';
import { Logo } from './Logo';

const navLinks = [
  { href: '/guida', label: 'Guide' },
  { href: '/sicurezza', label: 'Security' },
  { href: '/about', label: 'About' },
];

export function Header() {
  return (
    <header className="h-14 border-b border-line bg-surface">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="no-underline">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm text-muted no-underline transition-colors hover:bg-paper-2 hover:text-ink"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/genera"
            className="ml-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-paper no-underline transition-colors hover:bg-primary-ink"
          >
            Open app
          </Link>
        </nav>
      </div>
    </header>
  );
}
