import { GitHubLink } from '@/components/ui/github-link';
import { pageMetadata } from '@/lib/seo';
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  CheckIcon,
  ShieldIcon,
} from 'lucide-react';

export const metadata = pageMetadata({
  title: 'Sicurezza e privacy',
  description:
    'Come Sepalo protegge i tuoi dati: elaborazione 100% client-side, dati di pagamento mai salvati, profilo cifrato con AES-256, threat model e rischi residui.',
  path: '/sicurezza',
});

const guarantees = [
  'Il file Excel/CSV viene processato esclusivamente nel browser.',
  'Profilo ordinante e dati di sessione sono salvati in IndexedDB del tuo browser.',
  'Nessun cookie, nessuna analytics invasiva, nessun CDN third-party in esecuzione.',
  'Codice sorgente completo verificabile su GitHub.',
];

const limits = [
  "L'integrità del tuo sistema operativo o del browser.",
  'Che estensioni installate non leggano la pagina (lo possono fare).',
  "Che l'home banking destinatario importi correttamente l'XML.",
  'Compromissioni a monte: keylogger, malware, supply-chain attack al browser.',
];

const threats = [
  {
    threat: 'XSS via dipendenza compromessa',
    likelihood: 'Bassa',
    impact: 'Alto',
    mitigation: 'Lockfile, audit npm, Subresource Integrity',
  },
  {
    threat: 'Estensione browser malevola',
    likelihood: 'Media',
    impact: 'Alto',
    mitigation: 'Dati di pagamento mai persistiti, solo profilo',
  },
  {
    threat: 'Browser fingerprinting',
    likelihood: 'N/A',
    impact: 'N/A',
    mitigation: 'Nessuna analytics; richieste in uscita = 0',
  },
  {
    threat: 'Errore utente: IBAN errato',
    likelihood: 'Alta',
    impact: 'Alto',
    mitigation: 'Validazione checksum + warning su duplicati',
  },
];

function likelihoodClass(v: string) {
  if (v === 'Alta') return 'bg-error-soft text-error';
  if (v === 'Media') return 'bg-warn-soft text-warn';
  return 'bg-paper-2 text-muted';
}

function impactClass(v: string) {
  if (v === 'Alto') return 'bg-warn-soft text-warn';
  return 'bg-paper-2 text-muted';
}

export default function SicurezzaPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="eyebrow mb-4 flex items-center gap-2">
          <ShieldIcon size={12} />
          Pagina sicurezza · aggiornata maggio 2026
        </p>
        <h1 className="display-l mb-4" style={{ fontSize: 52 }}>
          I tuoi dati restano nel tuo browser.
        </h1>
        <p className="max-w-2xl text-lg text-muted leading-relaxed">
          Questa pagina spiega in modo onesto cosa Sepalo fa, cosa non fa, e quali sono i rischi
          residui che dovresti conoscere prima di usarlo per i pagamenti della tua azienda.
        </p>
      </div>

      {/* Guarantee / Limits cards */}
      <div className="grid grid-cols-1 gap-6 mb-12 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <CheckCircleIcon size={18} className="text-accent" />
            <span className="font-semibold text-ink">Cosa garantiamo</span>
          </div>
          <ul className="flex flex-col gap-3">
            {guarantees.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-2">
                <CheckIcon size={14} className="mt-0.5 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <AlertTriangleIcon size={18} className="text-warn" />
            <span className="font-semibold text-ink">Cosa NON possiamo garantire</span>
          </div>
          <ul className="flex flex-col gap-3">
            {limits.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-2">
                <AlertCircleIcon size={14} className="mt-0.5 shrink-0 text-warn" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Threat model */}
      <p className="eyebrow mb-5">Threat model</p>
      <div className="rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-2">
              <th className="px-4 py-3 text-left font-semibold text-ink">Minaccia</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Probabilità</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Impatto</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Mitigazione</th>
            </tr>
          </thead>
          <tbody>
            {threats.map((row, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static threat list
              <tr key={i} className="border-b border-line last:border-0 bg-surface">
                <td className="px-4 py-3 font-medium text-ink">{row.threat}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${likelihoodClass(row.likelihood)}`}
                  >
                    {row.likelihood}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${impactClass(row.impact)}`}
                  >
                    {row.impact}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{row.mitigation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Architecture note */}
      <div className="mt-12 rounded-xl border border-line bg-paper-2 p-6">
        <p className="eyebrow mb-3">Architettura</p>
        <p className="text-sm text-ink-2 leading-relaxed mb-3">
          Sepalo è una <strong className="text-ink">static export Next.js</strong>: il server
          consegna HTML + JS pre-renderizzato, poi il browser fa tutto il lavoro. Non esistono API
          route, non esiste un database, non esiste un backend che riceve dati.
        </p>
        <p className="text-sm text-ink-2 leading-relaxed">
          Il profilo ordinante (IBAN, ABI, ragione sociale) è cifrato con{' '}
          <strong className="text-ink">AES-256-GCM</strong> tramite una chiave device-bound derivata
          con PBKDF2 dalla Web Crypto API e conservata in IndexedDB. I dati di pagamento (il tuo
          CSV/XLSX) non vengono mai persistiti — vengono elaborati in memoria e poi scartati.
        </p>
      </div>

      {/* Source / audit */}
      <div className="mt-6 flex items-center gap-3 text-sm text-muted">
        <span>Vuoi verificare tu stesso?</span>
        <GitHubLink
          label="Leggi il codice su GitHub →"
          className="text-primary underline hover:text-primary-ink"
        />
      </div>
    </div>
  );
}
