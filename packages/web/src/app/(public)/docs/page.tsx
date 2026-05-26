import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Docs · @sepalo/core',
  description:
    'Documentazione tecnica di @sepalo/core: installazione, tipi TypeScript, API completa ed esempi di integrazione in Node.js, Deno e browser.',
};

const tocItems = [
  { id: 'installazione', label: 'Installazione' },
  { id: 'tipi', label: 'Tipi principali' },
  { id: 'parseFile', label: 'parseFile()' },
  { id: 'buildXml', label: 'buildXml()' },
  { id: 'validateBatch', label: 'validateBatch()' },
  { id: 'validateXml', label: 'validateXml()' },
  { id: 'esempio-completo', label: 'Esempio completo' },
  { id: 'node', label: 'Integrazione Node.js' },
];

export default function DocsPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem-1px)]">
      {/* Left sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line md:block">
        <div className="sticky top-14 overflow-y-auto p-6">
          <p className="eyebrow mb-4">@sepalo/core</p>
          <div className="mb-4">
            <p className="mb-1.5 px-2 text-xs font-semibold text-ink">API Reference</p>
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-md px-2 py-1.5 text-sm text-muted no-underline transition-colors hover:bg-paper-2 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </div>
          <hr className="my-4 border-line" />
          <Link
            href="/guida"
            className="block rounded-md px-2 py-1.5 text-sm text-muted no-underline transition-colors hover:bg-paper-2 hover:text-ink"
          >
            ← Guida utente
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <article className="min-w-0 flex-1 px-8 py-14 md:px-16">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow mb-3">Documentazione tecnica</p>
          <h1 className="display-m mb-4" style={{ fontSize: 40 }}>
            @sepalo/core
          </h1>
          <p className="mb-10 text-lg text-muted leading-relaxed">
            Libreria TypeScript per generare, validare e parsare file XML{' '}
            <span className="font-mono text-sm">CBIBdyPaymentRequest.00.04.01</span>. Funziona in
            browser (ESM), Node.js 18+ e Deno. Zero dipendenze runtime.
          </p>

          {/* Installation */}
          <section id="installazione" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-ink">Installazione</h2>
            <CodeBlock>{`npm install @sepalo/core
# oppure
pnpm add @sepalo/core
# oppure
yarn add @sepalo/core`}</CodeBlock>
            <p className="mt-3 text-sm text-muted">
              La validazione XSD usa <span className="font-mono text-xs">xmllint-wasm</span> come
              peer dependency facoltativa. Installala se vuoi la validazione lato Node:
            </p>
            <CodeBlock>{'npm install xmllint-wasm'}</CodeBlock>
          </section>

          {/* Types */}
          <section id="tipi" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-ink">Tipi principali</h2>
            <CodeBlock>{`import type {
  PaymentBatch,    // intero batch: ordinante + lista transazioni
  Transaction,     // singola transazione
  Initiator,       // profilo ordinante (banca + CUC + IBAN)
  ParsedSheet,     // risultato del parsing CSV/XLSX
  ValidationResult // errori + warning di validazione
} from '@sepalo/core';`}</CodeBlock>

            <div className="mt-4 overflow-hidden rounded-lg border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper-2">
                    <th className="px-4 py-2.5 text-left font-semibold text-ink">Tipo</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-ink">Descrizione</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['PaymentBatch', 'Batch completo: ordinante + array di transazioni + metadati'],
                    [
                      'Transaction',
                      'Singola transazione: IBAN, importo, causale, beneficiario, data',
                    ],
                    ['Initiator', 'Profilo ordinante: IBAN, ABI, CUC, nome, indirizzo'],
                    ['ParsedSheet', 'Output del parser: headers rilevati + righe normalizzate'],
                    ['ValidationResult', 'Array di errors e warnings con path e codice'],
                  ].map(([type, desc]) => (
                    <tr key={type} className="border-b border-line last:border-0 bg-surface">
                      <td className="px-4 py-2.5 font-mono text-xs text-primary">{type}</td>
                      <td className="px-4 py-2.5 text-ink-2">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* parseFile */}
          <section id="parseFile" className="mb-12">
            <h2 className="mb-1 text-xl font-semibold text-ink">parseFile()</h2>
            <p className="mb-4 text-sm text-muted">
              Legge un <span className="font-mono text-xs">File</span> (browser) o un{' '}
              <span className="font-mono text-xs">Buffer</span> (Node) CSV o XLSX e restituisce un{' '}
              <span className="font-mono text-xs">ParsedSheet</span>.
            </p>
            <CodeBlock>{`import { parseFile } from '@sepalo/core';

// Browser
const sheet = await parseFile(inputElement.files[0]);

// Node.js
import { readFileSync } from 'fs';
const buffer = readFileSync('bonifici.csv');
const sheet = await parseFile(new Blob([buffer]));

// sheet.headers  → string[]         (nomi colonne rilevate)
// sheet.rows     → Record<string, string>[]  (righe normalizzate)`}</CodeBlock>
          </section>

          {/* buildXml */}
          <section id="buildXml" className="mb-12">
            <h2 className="mb-1 text-xl font-semibold text-ink">buildXml()</h2>
            <p className="mb-4 text-sm text-muted">
              Genera la stringa XML dal batch. Non effettua validazione — chiama{' '}
              <span className="font-mono text-xs">validateBatch()</span> prima se vuoi intercettare
              errori.
            </p>
            <CodeBlock>{`import { buildXml } from '@sepalo/core';
import type { PaymentBatch } from '@sepalo/core';

const batch: PaymentBatch = {
  initiator: {
    name: 'Acme S.r.l.',
    iban: 'IT60X0542811101000000123456',
    abi: '05428',
    cuc: 'ABC123',
  },
  transactions: [
    {
      id: 'txn-001',
      creditor: { name: 'Mario Rossi', iban: 'IT60X0542811101000000654321' },
      amount: 1500.0,
      currency: 'EUR',
      description: 'Fattura 2026/001',
      executionDate: '2026-06-01',
    },
  ],
  batchBooking: true,
  requestedExecutionDate: '2026-06-01',
};

const xml: string = buildXml(batch);`}</CodeBlock>
          </section>

          {/* validateBatch */}
          <section id="validateBatch" className="mb-12">
            <h2 className="mb-1 text-xl font-semibold text-ink">validateBatch()</h2>
            <p className="mb-4 text-sm text-muted">
              Valida un <span className="font-mono text-xs">PaymentBatch</span> semanticamente (IBAN
              checksum, importi, causali). Restituisce{' '}
              <span className="font-mono text-xs">ValidationResult</span>.
            </p>
            <CodeBlock>{`import { validateBatch } from '@sepalo/core';

const result = validateBatch(batch);

if (result.errors.length > 0) {
  console.error('Errori di validazione:', result.errors);
  // ogni errore ha: { path, code, message }
}

if (result.warnings.length > 0) {
  console.warn('Warning:', result.warnings);
}

// procedi solo se non ci sono errori
if (result.errors.length === 0) {
  const xml = buildXml(batch);
}`}</CodeBlock>
          </section>

          {/* validateXml */}
          <section id="validateXml" className="mb-12">
            <h2 className="mb-1 text-xl font-semibold text-ink">validateXml()</h2>
            <p className="mb-4 text-sm text-muted">
              Valida una stringa XML contro lo schema XSD ufficiale CBI. Richiede{' '}
              <span className="font-mono text-xs">xmllint-wasm</span> come peer dependency.
            </p>
            <CodeBlock>{`import { validateXml } from '@sepalo/core';

const { valid, errors } = await validateXml(xml);

if (!valid) {
  console.error('XML non valido:', errors);
}`}</CodeBlock>
          </section>

          {/* Complete example */}
          <section id="esempio-completo" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-ink">Esempio completo (browser)</h2>
            <CodeBlock>{`import { parseFile, validateBatch, buildXml, validateXml } from '@sepalo/core';
import type { PaymentBatch, Initiator } from '@sepalo/core';

const initiator: Initiator = {
  name: 'Acme S.r.l.',
  iban: 'IT60X0542811101000000123456',
  abi: '05428',
  cuc: 'ABC123',
};

async function generateXml(file: File): Promise<string> {
  // 1. Parsa il file
  const sheet = await parseFile(file);

  // 2. Mappa le righe in transazioni
  const transactions = sheet.rows.map((row, i) => ({
    id: \`txn-\${String(i + 1).padStart(3, '0')}\`,
    creditor: { name: row.name, iban: row.iban },
    amount: parseFloat(row.amount),
    currency: 'EUR' as const,
    description: row.description,
    executionDate: row.date ?? new Date().toISOString().slice(0, 10),
  }));

  const batch: PaymentBatch = {
    initiator,
    transactions,
    batchBooking: true,
    requestedExecutionDate: transactions[0]?.executionDate ?? '',
  };

  // 3. Valida semanticamente
  const { errors } = validateBatch(batch);
  if (errors.length > 0) throw new Error(errors[0].message);

  // 4. Genera XML
  const xml = buildXml(batch);

  // 5. Valida XSD (opzionale ma consigliato)
  const { valid } = await validateXml(xml);
  if (!valid) throw new Error('XML non supera la validazione XSD');

  return xml;
}`}</CodeBlock>
          </section>

          {/* Node integration */}
          <section id="node" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-ink">Integrazione Node.js</h2>
            <CodeBlock>{`// node-generate.mjs
import { readFileSync, writeFileSync } from 'fs';
import { parseFile, validateBatch, buildXml } from '@sepalo/core';

const buffer = readFileSync('bonifici.csv');
const sheet = await parseFile(new Blob([buffer]));

const batch = {
  initiator: { /* ... */ },
  transactions: sheet.rows.map(/* ... */),
  batchBooking: true,
  requestedExecutionDate: '2026-06-01',
};

const { errors } = validateBatch(batch);
if (errors.length) process.exit(1);

const xml = buildXml(batch);
writeFileSync('output.xml', xml, 'utf-8');
console.log('Generato output.xml');`}</CodeBlock>
            <p className="mt-4 text-sm text-muted">
              Compatibile con Node.js 18+ (ESM). Per CommonJS usa{' '}
              <span className="font-mono text-xs">import()</span> dinamico o un bundler.
            </p>
          </section>

          {/* Links */}
          <div className="rounded-xl border border-line bg-paper-2 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink mb-1">Vuoi contribuire?</p>
              <p className="text-sm text-muted">
                Issues, PR e discussioni sono benvenute su GitHub.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href="https://github.com/ayoubl96/sepalo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink no-underline hover:bg-paper transition-colors"
              >
                GitHub →
              </a>
              <a
                href="https://www.npmjs.com/package/@sepalo/core"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink no-underline hover:bg-paper transition-colors"
              >
                npm →
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Right TOC */}
      <aside className="hidden w-56 shrink-0 border-l border-line xl:block">
        <div className="sticky top-14 p-6">
          <p className="eyebrow mb-4">In questa pagina</p>
          {tocItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block py-1 pl-3 text-sm text-muted no-underline transition-colors border-l-2 border-transparent hover:border-line hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-ink p-4 text-xs leading-relaxed text-[#eceae0] font-mono">
      {children}
    </pre>
  );
}
