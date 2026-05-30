import { GitHubLink } from '@/components/ui/github-link';
import Link from 'next/link';
import { Logo } from './Logo';

const columns = [
  {
    title: 'Sepalo',
    links: [
      { label: 'Genera File', href: '/genera' },
      { label: 'Profilo', href: '/profilo' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Risorse',
    links: [
      { label: 'Guida utente', href: '/guida' },
      { label: 'Documentazione @sepalo/core', href: '/docs' },
      { label: 'Sicurezza', href: '/sicurezza' },
      {
        label: 'Schema XSD CBI',
        href: 'https://www.cbi-org.eu',
        external: true,
      },
    ],
  },
  {
    title: 'Comunità',
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/ayoubl96/sepalo',
        external: true,
      },
      {
        label: 'npm · @sepalo/core',
        href: 'https://www.npmjs.com/package/@sepalo/core',
        external: true,
      },
      {
        label: 'Segnala un bug',
        href: 'https://github.com/ayoubl96/sepalo/issues',
        external: true,
      },
      {
        label: 'Contribuisci',
        href: 'https://github.com/ayoubl96/sepalo/blob/main/CONTRIBUTING.md',
        external: true,
      },
      {
        label: 'Licenza MIT',
        href: 'https://github.com/ayoubl96/sepalo/blob/main/LICENSE',
        external: true,
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-360 px-14 py-14">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-12">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-70">
              Webapp open source per generare file XML CBI. Dal foglio Excel all&apos;XML in 30
              secondi, tutto nel tuo browser.
            </p>
            <div className="mt-5 flex gap-2">
              <GitHubLink className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-2 no-underline transition-colors hover:bg-paper-2" />
            </div>
          </div>
          {columns.map(({ title, links }) => (
            <div key={title}>
              <p className="eyebrow mb-4">{title}</p>
              <div className="flex flex-col gap-2.5">
                {links.map(({ label, href, external }) =>
                  external ? (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink-2 no-underline transition-colors hover:text-ink"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      key={label}
                      href={href}
                      className="text-sm text-ink-2 no-underline transition-colors hover:text-ink"
                    >
                      {label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-line pt-6 flex items-center justify-between text-xs text-muted">
          <span>
            © 2026 Sepalo · MIT License · maintained con ☕ dalla{' '}
            <a
              href="https://github.com/Ayoubl96/sepalo/graphs/contributors"
              target="_blank"
              rel="noreferrer"
            >
              community
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
