import { pageMetadata } from '@/lib/seo';
import { DownloadIcon } from 'lucide-react';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'Guida',
  description:
    "Guida passo-passo a Sepalo, lo strumento gratuito per bonifici massivi CBI: prepara il foglio Excel o CSV, mappa le colonne e genera l'XML per l'home banking.",
  path: '/guida',
});

const sections = [
  {
    id: 'iniziare',
    title: 'Iniziare',
    items: [
      { id: 'come-funziona', label: 'Come funziona Sepalo' },
      { id: 'setup-profilo', label: 'Setup del profilo' },
      { id: 'primo-file', label: 'Primo file CBI' },
    ],
  },
  {
    id: 'file-input',
    title: 'File di input',
    items: [
      { id: 'formato', label: 'Formato CSV / XLSX' },
      { id: 'mappatura', label: 'Mappatura colonne' },
      { id: 'caratteri-sepa', label: 'Caratteri SEPA-compliant' },
    ],
  },
  {
    id: 'generazione',
    title: 'Generazione XML',
    items: [
      { id: 'tipi-registrazione', label: 'Tipi di registrazione' },
      { id: 'validazione-xsd', label: 'Validazione XSD' },
      { id: 'home-banking', label: 'Caricamento home banking' },
    ],
  },
  {
    id: 'problemi',
    title: 'Risoluzione problemi',
    items: [
      { id: 'iban-non-valido', label: 'IBAN non valido' },
      { id: 'banca-rifiuta', label: 'La banca rifiuta il file' },
    ],
  },
];

const steps = [
  {
    n: '1',
    title: 'Prepara il foglio',
    body: 'Una riga per bonifico, con almeno: beneficiario, IBAN, importo, causale e data esecuzione. Vai pure di copia-incolla dal gestionale.',
  },
  {
    n: '2',
    title: 'Imposta il profilo (una volta sola)',
    body: "Apri Sepalo, vai su Profilo e inserisci i dati anagrafici, l'IBAN ordinante e il codice CUC della tua banca. Restano nel browser, cifrati.",
  },
  {
    n: '3',
    title: 'Carica e genera',
    body: "Trascina il file nella schermata Genera. Sepalo controlla ogni riga: IBAN, importi, causali. Tu rivedi, clicchi Genera, scarichi l'XML.",
  },
  {
    n: '4',
    title: "Carica nell'home banking",
    body: 'Sezione "bonifici massivi" della tua banca, importa il file. Autorizzi con OTP/firma e i bonifici partono.',
  },
];

const tocItems = [
  { id: 'cosa-e', label: "Cos'è il tracciato CBI" },
  { id: 'quattro-passi', label: 'I 4 passaggi' },
  { id: 'errori-comuni', label: 'Errori comuni' },
  { id: 'glossario', label: 'Glossario' },
];

export default function GuidaPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem-1px)]">
      {/* Left sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line md:block">
        <div className="sticky top-14 overflow-y-auto p-6">
          <p className="eyebrow mb-4">Guida</p>
          {sections.map((sec) => (
            <div key={sec.id} className="mb-5">
              <p className="mb-1.5 px-2 text-xs font-semibold text-ink">{sec.title}</p>
              {sec.items.map((item, i) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block rounded-md px-2 py-1.5 text-sm no-underline transition-colors hover:bg-paper-2 hover:text-ink ${
                    sec.id === 'iniziare' && i === 0
                      ? 'bg-surface border border-line font-medium text-ink'
                      : 'text-muted'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <article className="min-w-0 flex-1 px-8 py-14 md:px-16">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow mb-3">Iniziare · 1 di 3</p>
          <h1 id="come-funziona" className="display-m mb-6" style={{ fontSize: 40 }}>
            Come funziona Sepalo
          </h1>
          <p className="mb-10 text-lg text-muted leading-relaxed">
            In sostanza: gli dai un foglio Excel con la lista dei pagamenti che devi fare, lui ti
            restituisce un file XML conforme allo standard CBI obbligatorio in Italia. Quel file lo
            carichi nell&apos;home banking aziendale come &ldquo;disposizione massiva&rdquo; e i
            bonifici partono.
          </p>

          {/* 4 steps */}
          <div id="quattro-passi" className="mb-12">
            <div className="flex flex-col gap-7">
              {steps.map((s) => (
                <div key={s.n} className="grid grid-cols-[28px_1fr] gap-4">
                  <span className="font-mono text-sm font-semibold text-accent">{s.n}.</span>
                  <div>
                    <p className="mb-1 font-semibold text-ink">{s.title}</p>
                    <p className="text-sm text-muted leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What is CBI */}
          <div id="cosa-e" className="mb-12 rounded-xl border border-line bg-paper-2 p-6">
            <p className="eyebrow mb-3">Cos&apos;è il tracciato CBI</p>
            <p className="text-sm text-ink-2 leading-relaxed mb-3">
              <strong className="text-ink">CBIBdyPaymentRequest.00.04.01</strong> è il formato XML
              obbligatorio per i bonifici massivi in Italia dal novembre 2023. È definito da ABI/CBI
              (Corporate Banking Interbancario) e accettato da tutte le banche italiane principali.
            </p>
            <p className="text-sm text-ink-2 leading-relaxed">
              Sepalo valida ogni file generato contro lo schema XSD ufficiale, direttamente nel
              browser con WASM, prima del download.
            </p>
          </div>

          {/* Input format */}
          <div id="formato" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-ink">Formato CSV / XLSX</h2>
            <p className="mb-4 text-sm text-muted leading-relaxed">
              Il file deve avere almeno le seguenti colonne (l&apos;ordine non importa — Sepalo le
              rileva automaticamente):
            </p>
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper-2">
                    <th className="px-4 py-2.5 text-left font-semibold text-ink">Colonna</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-ink">Descrizione</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-ink">Obbligatoria</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['name / beneficiario', 'Ragione sociale o nome del destinatario', 'Sì'],
                    ['iban', 'IBAN del conto destinatario (IT o estero SEPA)', 'Sì'],
                    ['amount / importo', 'Importo in euro (es. 1250.00)', 'Sì'],
                    ['description / causale', 'Causale del bonifico (max 140 caratteri)', 'Sì'],
                    ['bic / swift', 'BIC/SWIFT della banca destinataria', 'No (derivato)'],
                    ['date / data', 'Data di esecuzione (YYYY-MM-DD)', 'No (default: oggi)'],
                  ].map(([col, desc, req]) => (
                    <tr key={col} className="border-b border-line last:border-0 bg-surface">
                      <td className="px-4 py-2.5 font-mono text-xs text-primary">{col}</td>
                      <td className="px-4 py-2.5 text-ink-2">{desc}</td>
                      <td className="px-4 py-2.5 text-muted">{req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Common errors */}
          <div id="errori-comuni" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-ink">Errori comuni</h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  tag: 'errore',
                  tagClass: 'bg-error-soft text-error',
                  title: 'IBAN non valido',
                  body: "Sepalo verifica il checksum ISO 13616. L'IBAN deve essere 27 caratteri per conti italiani (IT + 2 cifre + 23 caratteri alfanumerici).",
                },
                {
                  tag: 'warning',
                  tagClass: 'bg-warn-soft text-warn',
                  title: 'Causale > 140 caratteri',
                  body: 'Il campo viene troncato automaticamente. Sepalo mostra un warning con la lunghezza attuale e quella dopo il troncamento.',
                },
                {
                  tag: 'warning',
                  tagClass: 'bg-warn-soft text-warn',
                  title: 'Possibile doppio pagamento',
                  body: 'Se due righe hanno stesso IBAN, stesso importo e stessa data, Sepalo segnala un potenziale duplicato. Puoi ignorarlo se è intenzionale.',
                },
                {
                  tag: 'auto',
                  tagClass: 'bg-accent-soft text-accent',
                  title: 'Caratteri non SEPA-compliant',
                  body: "Lettere accentate, apostrofi tipografici e emoji vengono convertiti automaticamente (ò → o, ' → ', emoji → vuoto).",
                },
              ].map((err) => (
                <div
                  key={err.title}
                  className="flex items-start gap-3 border-b border-line py-3 last:border-0"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${err.tagClass}`}
                  >
                    {err.tag}
                  </span>
                  <div>
                    <p className="mb-1 font-medium text-ink">{err.title}</p>
                    <p className="text-sm text-muted">{err.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Glossary */}
          <div id="glossario" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-ink">Glossario</h2>
            <dl className="flex flex-col gap-4">
              {[
                [
                  'CBI',
                  'Corporate Banking Interbancario. Standard italiano per i pagamenti bancari aziendali.',
                ],
                [
                  'CUC',
                  "Codice Univoco CBI. Codice alfanumerico assegnato dalla banca all'azienda ordinante.",
                ],
                [
                  'IBAN',
                  'International Bank Account Number. Identificatore internazionale di conto corrente.',
                ],
                [
                  'BIC/SWIFT',
                  'Bank Identifier Code. Identifica la banca destinataria. Spesso facoltativo per IBAN italiani.',
                ],
                ['Ordinante', "L'azienda o il professionista che dispone i bonifici."],
                [
                  'XSD',
                  'XML Schema Definition. Descrive la struttura valida di un file XML. Sepalo lo usa per validare prima del download.',
                ],
              ].map(([term, def]) => (
                <div key={term} className="grid grid-cols-[120px_1fr] gap-4">
                  <dt className="font-semibold text-ink">{term}</dt>
                  <dd className="text-sm text-muted">{def}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Docs link */}
          <div className="rounded-xl border border-line bg-surface p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-ink mb-1">Sei uno sviluppatore?</p>
              <p className="text-sm text-muted">
                Consulta la documentazione tecnica di{' '}
                <code className="font-mono text-xs bg-paper-2 px-1.5 py-0.5 rounded">
                  @sepalo/core
                </code>{' '}
                per integrare la libreria nel tuo progetto.
              </p>
            </div>
            <Link
              href="/docs"
              className="shrink-0 rounded-lg border border-line bg-paper-2 px-4 py-2 text-sm font-medium text-ink no-underline hover:bg-line transition-colors"
            >
              Vai ai Docs →
            </Link>
          </div>
        </div>
      </article>

      {/* Right TOC */}
      <aside className="hidden w-56 shrink-0 border-l border-line xl:block">
        <div className="sticky top-14 p-6">
          <p className="eyebrow mb-4">In questa pagina</p>
          {tocItems.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block py-1 pl-3 text-sm no-underline transition-colors border-l-2 hover:text-ink ${
                i === 1 ? 'border-accent font-medium text-ink' : 'border-transparent text-muted'
              }`}
            >
              {item.label}
            </a>
          ))}
          <hr className="my-6 border-line" />
          <p className="mb-2.5 text-xs text-muted">Vuoi un esempio?</p>
          <a
            href="/genera"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs text-muted no-underline transition-colors hover:bg-paper-2 hover:text-ink"
          >
            <DownloadIcon size={12} />
            sepalo-esempio.xlsx
          </a>
        </div>
      </aside>
    </div>
  );
}
