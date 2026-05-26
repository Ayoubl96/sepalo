import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';

const navLinks = [
  { href: '/genera', label: 'Genera' },
  { href: '/guida', label: 'Guida' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/sicurezza', label: 'Sicurezza' },
];

export function Header() {
  return (
    <header className="h-14 border-b border-line bg-surface">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="no-underline">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm text-muted no-underline transition-colors hover:bg-paper-2 hover:text-ink"
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/ayoubl96/sepalo"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-3 py-1.5 text-sm text-muted no-underline transition-colors hover:bg-paper-2 hover:text-ink"
          >
            GitHub
          </a>
        </nav>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="size-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-surface p-6">
            <SheetTitle className="sr-only">Navigazione</SheetTitle>
            <nav className="mt-6 flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-2.5 text-sm text-ink no-underline transition-colors hover:bg-paper-2"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/genera"
                className="mt-3 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-paper no-underline transition-colors hover:bg-primary-ink"
              >
                Apri app
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
