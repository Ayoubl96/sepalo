import { GitHubLink } from '@/components/ui/github-link';
import { pageMetadata } from '@/lib/seo';
import { ArrowRightIcon, CheckIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';

export const metadata = pageMetadata({
  absoluteTitle: 'Sepalo — Bonifici massivi CBI da Excel a XML, nel browser',
  title: 'Sepalo',
  description:
    "Trasforma un CSV o un Excel in un file XML CBI valido per l'home banking. Gratis e open source, 100% nel browser: nessun account, nessun server.",
  path: '/',
});

const principles = [
  {
    n: '01',
    tag: 'Privacy',
    title: 'Privacy al centro.',
    body: 'Nessun dato di pagamento lascia il browser. Niente backend, niente analytics invasive, niente storage server-side. I dati che si salvano sono critografati con AES-256 ma tutto nel tuo browser..',
  },
  {
    n: '02',
    tag: 'MIT',
    title: 'Open source, davvero.',
    body: 'Codice MIT su GitHub, libreria core su npm, riutilizzabile da chiunque. Nessun vendor lock-in, nessun trial, nessun "premium plan".',
  },
  {
    n: '03',
    tag: 'UX',
    title: 'Zero attriti.',
    body: "Dal CSV all'XML in tre click. Nessun account, nessuna installazione, nessuna configurazione obbligatoria oltre i tuoi dati banca.",
  },
];

const howItWorks = [
  {
    n: '01',
    title: 'Carica il foglio',
    body: 'Trascina un Excel o un CSV con la lista dei pagamenti. Beneficiario, IBAN, importo, causale, data. Una riga per bonifico.',
    meta: '.csv · .xlsx · max 5 MB',
  },
  {
    n: '02',
    title: 'Verifica le righe',
    body: 'Sepalo controlla IBAN, importi e causali. Le righe con errori sono evidenziate, le modifichi al volo nella tabella.',
    meta: 'validazione client-side',
  },
  {
    n: '03',
    title: 'Configura',
    body: 'Data esecuzione, tipo registrazione (cumulativo o singolo). Scegli i parametri o accetta i default sensati.',
    meta: 'XSD CBI 00.04.01',
  },
  {
    n: '04',
    title: 'Scarica e disponi',
    body: "Click Genera. Ricevi un .xml validato. Lo carichi nell'home banking come bonifico massivo.",
    meta: 'pronto per Intesa, UniCredit, BPM…',
  },
];

const validationItems = [
  {
    tag: 'errore',
    tagClass: 'bg-error-soft text-error',
    title: 'IBAN non valido',
    body: 'Checksum errato sul codice italiano. Si vede dal cursore.',
  },
  {
    tag: 'warning',
    tagClass: 'bg-warn-soft text-warn',
    title: 'Causale > 140 caratteri',
    body: 'Verrà troncata automaticamente, ti diciamo dove.',
  },
  {
    tag: 'warning',
    tagClass: 'bg-warn-soft text-warn',
    title: 'Possibile doppio pagamento',
    body: 'Stesso IBAN, stesso importo, stessa data — è intenzionale?',
  },
  {
    tag: 'auto',
    tagClass: 'bg-accent-soft text-accent',
    title: 'Caratteri non SEPA-compliant',
    body: "Sostituiti automaticamente: ò → o, ' → ', emoji → vuoto.",
  },
];

const comparisonRows = [
  ['Costo', 'Gratis · MIT', '€ 250 una tantum', '€ 200+/mese', 'Tempo umano'],
  ['Installazione', 'Nessuna · webapp', 'Desktop Windows', 'Setup ERP', '—'],
  ['Account / cloud', 'Nessuno', 'Locale', 'Server aziendale', 'Home banking'],
  ['Codice ispezionabile', 'GitHub · MIT', 'Closed source', 'Closed source', '—'],
  ['Privacy dei dati', '100% browser', 'Locale', 'Server aziendale', 'Locale'],
  [
    'Adatto a',
    'PMI, professionisti, no-profit',
    'Aziende strutturate',
    'Aziende con ERP',
    '< 5 bonifici',
  ],
];

const faqItems = [
  {
    q: 'I miei dati finiscono davvero solo nel browser?',
    a: 'Sì. Sepalo è una webapp puramente client-side: il server invia HTML e JavaScript, il resto succede nel tuo browser. Niente upload, niente API, niente analytics. Puoi staccare la rete dopo il caricamento iniziale e funziona uguale.',
    open: true,
  },
  {
    q: 'Funziona offline?',
    a: 'Sì, dopo la prima visita. Sepalo è installabile come PWA — in metro, sotto un ponte o in un capannone senza WiFi, genera il file lo stesso.',
    open: true,
  },
  {
    q: 'Quale standard CBI usate?',
    a: "CBIBdyPaymentRequest.00.04.01 — il tracciato obbligatorio per le banche italiane dal 19 novembre 2023. Validiamo l'XML contro lo schema XSD ufficiale, lato browser, prima del download.",
    open: false,
  },
  {
    q: 'Quante righe può contenere un file?',
    a: 'Fino a 5.000 transazioni e 5 MB. Oltre, ti suggeriamo di splittare per evitare timeout in alcune home banking. Tecnicamente la libreria core regge molto di più.',
    open: false,
  },
  {
    q: 'Funziona con la mia banca?',
    a: 'Se la tua banca accetta disposizioni massive nel tracciato CBI 00.04.01 (cioè tutte le banche italiane principali), sì. Abbiamo testato Intesa, UniCredit, BPM, BPER, Crédit Agricole, MPS e Fineco.',
    open: false,
  },
  {
    q: 'Posso integrarlo nel mio software?',
    a: "Sì. Il core è una libreria npm — `npm i @sepalo/core` — riutilizzabile anche da Node, Deno, o un'altra webapp. MIT, niente attribution obbligatoria.",
    open: false,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="border-b border-line px-14 py-20 grid grid-cols-[1fr_480px] gap-20 items-end max-w-360 mx-auto">
        <div>
          <p className="eyebrow mb-7 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            CBI / SEPA · v00.04.01
          </p>
          <h1 className="display-xl mb-6" style={{ maxWidth: 820 }}>
            Bonifici massivi
            <br />
            <span className="text-muted">senza fatica.</span>
          </h1>
          <p className="mb-9 max-w-[580px] text-[19px] text-muted leading-relaxed">
            Carichi un foglio Excel con la lista dei pagamenti. Ti diamo l&apos;XML pronto da
            disporre nell&apos;home banking.{' '}
            <strong className="font-medium text-ink">
              Tutto nel tuo browser, niente lascia il computer.
            </strong>
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/genera"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-paper no-underline transition-colors hover:bg-primary-ink"
            >
              Genera il tuo primo file CBI
              <ArrowRightIcon size={15} />
            </Link>
            <Link
              href="/guida"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-medium text-muted no-underline transition-colors hover:text-ink"
            >
              Guarda come funziona →
            </Link>
          </div>
          <div className="mt-14 flex gap-8 text-[13px] text-muted">
            <span className="flex items-center gap-1.5">
              <CheckIcon size={13} className="text-accent" /> Nessun account
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon size={13} className="text-accent" /> Nessun upload
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon size={13} className="text-accent" /> Open source · MIT
            </span>
          </div>
        </div>

        {/* Right column — file flow visual */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent text-sm font-mono font-semibold">
              xls
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-ink">bonifici-aprile.xlsx</p>
              <p className="text-[12px] text-muted">12 transazioni · 21,5 KB</p>
            </div>
            <CheckIcon size={15} className="text-accent" />
          </div>

          <div className="flex justify-center text-muted-2">
            <svg
              width="20"
              height="34"
              viewBox="0 0 20 34"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M10 0v30M3 23l7 7 7-7" />
            </svg>
          </div>

          <div className="rounded-xl overflow-hidden bg-ink border-0">
            <div className="flex items-center justify-between border-b border-[#2A2A33] px-4 py-2.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#9c9a8e]">
                CBIBdyPaymentRequest.00.04.01
              </span>
            </div>
            <pre className="m-0 px-4 py-3.5 font-mono text-[11px] leading-relaxed text-[#eceae0] whitespace-pre overflow-hidden">
              {`<CBIBdyPaymtRequest>
  <GrpHdr>
    <MsgId>SEPALO-2026-05-01-A1F4</MsgId>
    <CreDtTm>2026-05-01T09:14:32</CreDtTm>
    <NbOfTxs>12</NbOfTxs>
    <CtrlSum>21088.07</CtrlSum>
  </GrpHdr>
  <PmtInf>
    <PmtInfId>BATCH-001</PmtInfId>
    <BtchBookg>true</BtchBookg>
    ...`}
            </pre>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg bg-accent-soft px-3.5 py-3 text-[13px] font-medium text-accent">
            <CheckIcon size={15} />
            XML valido · pronto per l&apos;home banking
          </div>
        </div>
      </section>

      {/* THREE PRINCIPLES */}
      <section className="px-14 py-20 grid grid-cols-3 gap-14 max-w-360 mx-auto">
        {principles.map((p) => (
          <div key={p.n} className="border-t border-ink pt-7">
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-mono text-[13px] text-ink">{p.n}</span>
              <span className="eyebrow">{p.tag}</span>
            </div>
            <h3 className="mb-3.5 text-[26px] font-semibold leading-tight tracking-tight text-ink">
              {p.title}
            </h3>
            <p className="text-[14px] text-muted leading-relaxed">{p.body}</p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-b border-line bg-paper-2 px-14 py-20 max-w-360 mx-auto">
        <div className="grid grid-cols-[360px_1fr] gap-20 mb-14 items-end">
          <div>
            <p className="eyebrow mb-3.5">Come funziona</p>
            <h2 className="display-l" style={{ fontSize: 56 }}>
              Quattro passaggi.
              <br />
              <span className="text-muted">Niente di più.</span>
            </h2>
          </div>
          <p className="text-[17px] text-muted leading-relaxed pb-2">
            Da quando trascini il file CSV a quando carichi l&apos;XML nell&apos;home banking
            passano poco più di trenta secondi. Tutto avviene nel tuo browser, in locale, senza
            chiamate di rete.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-px bg-line border border-line rounded-xl overflow-hidden">
          {howItWorks.map((s) => (
            <div key={s.n} className="flex flex-col bg-surface p-7">
              <div className="flex justify-between items-start mb-6">
                <span className="font-mono text-[13px] text-accent">{s.n}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent text-xs font-semibold">
                  {s.n}
                </div>
              </div>
              <p className="mb-2 text-[18px] font-semibold tracking-tight text-ink leading-snug">
                {s.title}
              </p>
              <p className="text-[13px] text-muted leading-relaxed mb-auto">{s.body}</p>
              <p className="mt-4.5 pt-3 border-t border-line font-mono text-[11px] text-muted">
                {s.meta}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* VALIDATION SECTION */}
      <section className="px-14 py-20 max-w-360 mx-auto grid grid-cols-2 gap-16 items-center">
        <div>
          <p className="eyebrow mb-3.5">La schermata di verifica</p>
          <h2 className="display-m mb-5" style={{ fontSize: 40 }}>
            Errori onesti, riga per riga.
          </h2>
          <p className="text-[17px] text-muted leading-relaxed mb-7">
            Niente &ldquo;il tuo file ha 1 errore&rdquo;.{' '}
            <strong className="font-medium text-ink">
              Quale riga, quale campo, perché, e cosa puoi fare.
            </strong>{' '}
            IBAN con checksum errato, causali oltre i 140 caratteri, possibili doppi pagamenti —
            tutto evidenziato.
          </p>
          <div className="flex flex-col">
            {validationItems.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 border-b border-line py-3 last:border-0"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${item.tagClass}`}
                >
                  {item.tag}
                </span>
                <div>
                  <p className="font-medium text-[14px] text-ink mb-0.5">{item.title}</p>
                  <p className="text-[13px] text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini mockup */}
        <div className="rounded-xl border border-line bg-surface overflow-hidden shadow-lg shadow-ink/5">
          <div className="flex items-center gap-1.5 bg-paper-2 border-b border-line px-3.5 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="ml-3.5 font-mono text-[11px] text-muted">sepalo.it/genera</span>
          </div>
          <div className="flex items-center gap-3.5 border-b border-line px-5 py-4">
            <div>
              <p className="eyebrow mb-1" style={{ fontSize: 10 }}>
                Verifica
              </p>
              <p className="text-[16px] font-semibold text-ink">12 transazioni · € 21.088,07</p>
            </div>
            <div className="ml-auto flex gap-1.5">
              <span className="rounded-full bg-error-soft px-2.5 py-1 text-[11px] font-medium text-error">
                1 errore
              </span>
              <span className="rounded-full bg-warn-soft px-2.5 py-1 text-[11px] font-medium text-warn">
                2 warning
              </span>
            </div>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-line bg-paper-2">
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted w-7">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted">
                  Beneficiario
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted">IBAN</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-muted">Importo</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted w-20">Stato</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  n: 1,
                  name: 'Mario Rossi',
                  iban: 'IT60X05428…',
                  amt: '€ 1.250,00',
                  status: 'ok',
                },
                {
                  n: 2,
                  name: 'Acme S.r.l.',
                  iban: 'IT60X05428…',
                  amt: '€ 4.800,00',
                  status: 'warn',
                },
                {
                  n: 3,
                  name: 'Studio Bianchi',
                  iban: 'IT60X05428…',
                  amt: '€ 980,00',
                  status: 'error',
                },
                {
                  n: 4,
                  name: 'Rossi & C.',
                  iban: 'IT60X05428…',
                  amt: '€ 300,00',
                  status: 'ok',
                },
                {
                  n: 5,
                  name: 'Fornitori Srl',
                  iban: 'IT60X05428…',
                  amt: '€ 2.100,00',
                  status: 'ok',
                },
              ].map((row) => (
                <tr
                  key={row.n}
                  className={`border-b border-line last:border-0 ${
                    row.status === 'error'
                      ? 'bg-error-soft/30'
                      : row.status === 'warn'
                        ? 'bg-warn-soft/30'
                        : 'bg-surface'
                  }`}
                >
                  <td className="px-3 py-2 text-muted">{row.n}</td>
                  <td className="px-3 py-2 text-ink">{row.name}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-ink-2">{row.iban}</td>
                  <td className="px-3 py-2 text-right font-mono text-ink">{row.amt}</td>
                  <td className="px-3 py-2">
                    {row.status === 'ok' && (
                      <span className="text-accent text-[11px]">✓ pronta</span>
                    )}
                    {row.status === 'error' && (
                      <span className="text-error text-[11px]">✕ IBAN</span>
                    )}
                    {row.status === 'warn' && (
                      <span className="text-warn text-[11px]">⚠ causale</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="border-t border-line px-14 py-20 max-w-360 mx-auto">
        <div className="mb-12">
          <p className="eyebrow mb-3.5">Posizionamento</p>
          <h2 className="display-l" style={{ fontSize: 60 }}>
            Per chi <em className="not-italic text-accent">non vuole</em> un ERP né un software
            desktop a licenza.
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-3.5 text-left" />
                <th className="px-5 py-3.5 text-left font-semibold text-accent bg-accent-soft">
                  Sepalo
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink bg-surface">
                  CbiXtractor
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink bg-surface">
                  Modulo ERP
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink bg-surface">
                  Bonifici uno a uno
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row[0]} className="border-b border-line last:border-0">
                  <td className="px-5 py-3.5 font-medium text-ink bg-paper-2">{row[0]}</td>
                  <td className="px-5 py-3.5 font-semibold text-accent bg-accent-soft/50">
                    {row[1]}
                  </td>
                  <td className="px-5 py-3.5 text-muted bg-surface">{row[2]}</td>
                  <td className="px-5 py-3.5 text-muted bg-surface">{row[3]}</td>
                  <td className="px-5 py-3.5 text-muted bg-surface">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-paper-2 px-14 py-20 max-w-360 mx-auto">
        <div className="grid grid-cols-[360px_1fr] gap-20">
          <div>
            <p className="eyebrow mb-3.5">Domande frequenti</p>
            <h2 className="display-m mb-4" style={{ fontSize: 40 }}>
              Risposte oneste.
            </h2>
            <p className="text-[14px] text-muted leading-relaxed">
              Se hai dubbi che non vedi qui, apri un&apos;issue su GitHub o contattaci. Rispondiamo
              presto.
            </p>
          </div>
          <div>
            {faqItems.map((faq) => (
              <details
                key={faq.q}
                open={faq.open}
                className="border-b border-line py-5 first:border-t group"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-[16px] font-medium text-ink">
                  {faq.q}
                  <PlusIcon
                    size={14}
                    className="shrink-0 text-muted transition-transform group-open:rotate-45"
                  />
                </summary>
                <p className="mt-3 max-w-2xl text-[14px] text-muted leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-primary px-14 py-28 text-center max-w-full">
        <h2
          className="mx-auto mb-7 font-semibold leading-[0.95] tracking-[-0.04em] text-paper"
          style={{ fontSize: 88, maxWidth: 900 }}
        >
          Genera il tuo
          <br />
          primo file CBI.
        </h2>
        <p className="mx-auto mb-9 max-w-[560px] text-[18px] text-white">
          Niente registrazione, niente upload. Apri Sepalo e provalo con il CSV di esempio.
        </p>
        <div className="inline-flex items-center gap-2.5">
          <Link
            href="/genera"
            className="inline-flex items-center gap-2 rounded-xl bg-paper px-7 py-4 text-[15px] font-semibold text-ink no-underline transition-colors hover:bg-paper-2"
          >
            Apri Sepalo <ArrowRightIcon size={15} />
          </Link>
          <GitHubLink className="rounded-xl border border-white/20 px-7 py-4 text-[15px] font-semibold text-paper no-underline transition-colors hover:border-white/40" />
        </div>
      </section>
    </div>
  );
}
