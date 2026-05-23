import { Logo } from '@/components/layout/Logo';
import { TooltipProvider } from '@/components/ui/tooltip';
import Link from 'next/link';

const workLinks = [{ href: '/genera', label: 'Generate' }];

const configLinks = [
  { href: '/profilo', label: 'Profile' },
  { href: '/impostazioni', label: 'Settings' },
];

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex h-14 items-center border-b border-line px-4">
          <Link href="/" className="no-underline">
            <Logo size={18} />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="mb-4">
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-2">
              Work
            </p>
            {workLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block rounded-md px-3 py-2 text-sm text-ink no-underline transition-colors hover:bg-paper-2"
              >
                {label}
              </Link>
            ))}
          </div>

          <div>
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-2">
              Configuration
            </p>
            {configLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block rounded-md px-3 py-2 text-sm text-ink no-underline transition-colors hover:bg-paper-2"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-line px-2 py-3">
          <Link
            href="/guida"
            className="block rounded-md px-3 py-2 text-sm text-muted no-underline transition-colors hover:bg-paper-2 hover:text-ink"
          >
            Guide
          </Link>
          <a
            href="https://github.com/ayoubl96/sepalo"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md px-3 py-2 text-sm text-muted no-underline transition-colors hover:bg-paper-2 hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <TooltipProvider>{children}</TooltipProvider>
      </main>
    </div>
  );
}
