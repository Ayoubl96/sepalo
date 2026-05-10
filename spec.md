# Sepalo — Documento di Progetto

> Versione 0.2 — bozza, da rivedere insieme prima di iniziare l'implementazione.

---

## 1. Executive Summary

**Sepalo** è una web app open source, gratuita e 100% client-side, che permette di generare file XML conformi allo standard **CBIBdyPaymentRequest.00.04.01** (il tracciato CBI/SEPA Credit Transfer obbligatorio in Italia dal 19 novembre 2023) a partire da un semplice file CSV o Excel.

L'utente carica il foglio con la lista dei pagamenti da fare, compila una sola volta i dati della propria banca (che vengono salvati cifrati nel browser con un PIN), clicca *Genera*, e scarica il file XML pronto da caricare nell'home banking aziendale per disporre i bonifici massivi.

Il nome **Sepalo** gioca su due livelli: SEPA + l'imperativo italiano "fallo" → "Sepalo, fallo SEPA". Memorabile, italiano, brandable.

Tre principi fondanti, in ordine di priorità:

1. **Privacy by architecture**: nessun dato di pagamento lascia mai il browser dell'utente. Niente backend, niente analytics invasive, niente storage server-side.
2. **Open source totale**: codice sotto licenza MIT su GitHub, libreria core pubblicata su npm, riutilizzabile da chiunque.
3. **UX immediata**: dal caricamento del CSV al download dell'XML, zero attriti, zero account, zero attese.

Sepalo si differenzia da `CbiXtractor` (commerciale, desktop) e dai moduli ERP integrati (Odoo, SAP, Dynamics) perché copre un buco reale del mercato: **PMI, professionisti, associazioni e no-profit che fanno tra 5 e 100 bonifici al mese e non hanno né un ERP né voglia di pagare un software dedicato**.

---

## 2. Problema & Target

### Il problema

In Italia, fare bonifici massivi (stipendi, pagamenti fornitori, rimborsi spese, contributi) tramite home banking aziendale richiede l'upload di un file XML in formato CBI. Le opzioni attuali per chi non ha un ERP sono:

- Compilare il file XML a mano: doloroso, error-prone, richiede competenze tecniche.
- Usare `CbiXtractor` (CBI Service): funzionale ma a pagamento e desktop-only.
- Sperare che la banca abbia un'interfaccia web per l'inserimento manuale: lenta per più di 5-10 transazioni.
- Fidarsi di tool gratuiti online di provenienza incerta, dove però carichi dati sensibili (IBAN, importi, anagrafiche) su server di terzi.

### Target primario (MVP)

- **Microimprese e PMI italiane** (fino a ~30 dipendenti) che pagano stipendi mensili e fornitori senza un ERP.
- **Studi professionali** (commercialisti, consulenti del lavoro) che gestiscono pagamenti per più clienti.
- **Associazioni e no-profit** che fanno rimborsi, compensi, erogazioni periodiche.

### Target secondario (post-MVP)

- **Sviluppatori** che vogliono integrare la generazione di file CBI in altri prodotti (via libreria npm `@sepalo/core`).
- **Aziende SaaS verticali** (HR, gestionali leggeri, fintech) che vogliono offrire l'export CBI senza svilupparlo in casa.

---

## 3. Ambito MVP

### In scope (v1.0)

- Parsing di CSV (UTF-8, separatore `,` `;` o `\t`) e XLSX/XLS (lato app web).
- Generazione di file `CBIBdyPaymentRequest.00.04.01` validi (lato libreria core).
- Un solo `PmtInf` per file (un solo gruppo di pagamenti, una sola data esecuzione).
- Validazione client-side: schema XSD ufficiale + business rules (IBAN mod-97, ABI, importi, totali).
- Persistenza locale dei dati anagrafici dell'ordinante in IndexedDB cifrato con PIN.
- Persistenza opzionale di un'anagrafica beneficiari riutilizzabili (rubrica fornitori).
- Template CSV/XLSX scaricabile come riferimento.
- UI in italiano, layout responsivo (desktop primario, mobile leggibile).

### Out of scope (v1.0)

- SEPA Direct Debit (SDD) — futuro.
- Bonifici esteri cross-border (`CBICrossBorderPaymentRequest`) — futuro.
- Più `PmtInf` per file (gruppi multipli con date esecuzione diverse) — fase 2.
- Multilingua (solo italiano in v1.0, EN in fase 2).
- Backend, account utente, sincronizzazione cloud — esplicitamente escluso da architettura.
- API hosted — fase 3 opzionale.

---

## 4. Specifica formato CBIBdyPaymentRequest.00.04.01

### 4.1 Riferimenti normativi

- **Manuale tecnico**: `STIP-MO-001 Payments-v.00.04.01 ENG`, versione 00.04.01 del 02/11/2023.
- **Base ISO 20022**: `pain.001.001.09` (CustomerCreditTransferInitiationV09).
- **Namespace XML**: `urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01`.
- **In vigore dal**: 19 novembre 2023, sostituisce le versioni 00.03.x.
- **Schema XSD ufficiale**: scaricabile dal sito CBI (`cbiservice.com`). Imbarcato nel bundle del core.

### 4.2 Struttura gerarchica del messaggio

```
CBIBdyPaymentRequest
├── GrpHdr (Group Header) — una volta
│   ├── MsgId, CreDtTm, NbOfTxs, CtrlSum
│   └── InitgPty
└── PmtInf (Payment Information) — 1+ volte
    ├── PmtInfId, PmtMtd, BtchBookg, NbOfTxs, CtrlSum
    ├── PmtTpInf (SvcLvl=SEPA)
    ├── ReqdExctnDt
    ├── Dbtr (ordinante)
    ├── DbtrAcct (IBAN ordinante)
    ├── DbtrAgt (banca ordinante con ABI)
    ├── ChrgBr (sempre SLEV)
    └── CdtTrfTxInf (Credit Transfer Transaction) — 1+ volte
        ├── PmtId (InstrId, EndToEndId)
        ├── Amt (InstdAmt, Ccy=EUR)
        ├── CdtrAgt (banca beneficiario, BIC solo se IBAN estero)
        ├── Cdtr (beneficiario)
        ├── CdtrAcct (IBAN beneficiario)
        └── RmtInf (causale)
```

### 4.3 Campi mandatori — tabella di riferimento

#### Group Header

| Campo | Path | Tipo | Vincolo | Note |
|---|---|---|---|---|
| Message ID | `GrpHdr/MsgId` | string(35) | Univoco | Generato `MSG{timestamp}{random}` |
| Creation DateTime | `GrpHdr/CreDtTm` | dateTime | ISO 8601 | `2024-12-15T10:30:00` |
| Number of Transactions | `GrpHdr/NbOfTxs` | int | Somma di tutti i `CdtTrfTxInf` | |
| Control Sum | `GrpHdr/CtrlSum` | decimal | Somma di tutti gli importi | 2 decimali, separatore `.` |
| Initiating Party Name | `GrpHdr/InitgPty/Nm` | string(70) | Ragione sociale ordinante | |
| Initiating Party ID | `GrpHdr/InitgPty/Id/OrgId/Othr/Id` | string(35) | CUC CBI o Codice Fiscale | |
| Issuer | `GrpHdr/InitgPty/Id/OrgId/Othr/Issr` | string | `CBI` o `CF` | Determina il tipo di ID sopra |

#### Payment Information

| Campo | Path | Tipo | Valore | Note |
|---|---|---|---|---|
| Payment Info ID | `PmtInf/PmtInfId` | string(35) | Univoco | |
| Payment Method | `PmtInf/PmtMtd` | string | `TRF` | Sempre |
| Batch Booking | `PmtInf/BtchBookg` | bool | `true`/`false` | Cumulativo o singolo in estratto conto |
| Service Level | `PmtInf/PmtTpInf/SvcLvl/Cd` | string | `SEPA` | Sempre |
| Requested Execution Date | `PmtInf/ReqdExctnDt` | date | `YYYY-MM-DD` | Giorno lavorativo, ≥ oggi |
| Debtor Name | `PmtInf/Dbtr/Nm` | string(70) | Ordinante | |
| Debtor IBAN | `PmtInf/DbtrAcct/Id/IBAN` | string | IBAN valido | Mod-97 |
| Debtor Agent ABI | `PmtInf/DbtrAgt/FinInstnId/ClrSysMmbId/MmbId` | string(5) | ABI banca ordinante | **Mandatory in CBI**, optional in ISO |
| Charge Bearer | `PmtInf/ChrgBr` | string | `SLEV` | Sempre per SEPA |

#### Credit Transfer Transaction (per ogni bonifico)

| Campo | Path | Tipo | Vincolo | Note |
|---|---|---|---|---|
| Instruction ID | `CdtTrfTxInf/PmtId/InstrId` | string(35) | Univoco | |
| End-to-End ID | `CdtTrfTxInf/PmtId/EndToEndId` | string(35) | Visibile al beneficiario | |
| Amount | `CdtTrfTxInf/Amt/InstdAmt` | decimal | `> 0`, `≤ 999999999.99`, `Ccy="EUR"` | |
| Creditor Agent BIC | `CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI` | string(11) | Solo se IBAN estero | Per IBAN IT/SM omettere |
| Creditor Name | `CdtTrfTxInf/Cdtr/Nm` | string(70) | Beneficiario | |
| Creditor IBAN | `CdtTrfTxInf/CdtrAcct/Id/IBAN` | string | IBAN valido | Mod-97 |
| Remittance Info | `CdtTrfTxInf/RmtInf/Ustrd` | string(140) | Causale | Unstructured |

### 4.4 Validazioni di business

Oltre alla validazione XSD, il core deve verificare:

1. **IBAN**: lunghezza per nazione, formato, checksum mod-97. Per IBAN italiani anche check del CIN.
2. **ABI**: 5 cifre numeriche, presenza in lookup table delle banche italiane attive (file JSON statico bundleato nel core).
3. **CUC**: 8 caratteri alfanumerici se valorizzato (formato CBI standard).
4. **Codice Fiscale / Partita IVA**: formato valido se usato come `Issr=CF`.
5. **Data esecuzione**: deve essere giorno lavorativo (no weekend), `≥` data odierna, `≤` 60 giorni nel futuro.
6. **Quadrature**: `GrpHdr/NbOfTxs == sum(PmtInf/NbOfTxs) == count(CdtTrfTxInf)`. `GrpHdr/CtrlSum == sum(InstdAmt)`.
7. **Caratteri ammessi nei testi**: solo character set SEPA (`a-z A-Z 0-9 / - ? : ( ) . , ' + ` e spazio). Sostituzione automatica di accenti/caratteri non ASCII con warning.
8. **Univocità**: `MsgId`, `PmtInfId`, `InstrId`, `EndToEndId` tutti univoci nel file.

---

## 5. Architettura tecnica

### 5.1 Principi

- **Client-only**: l'app è una SPA statica. Nessun server applicativo, nessuna API.
- **Zero data exfiltration**: nessuna chiamata HTTP esce dall'app verso domini terzi durante l'uso, eccetto per asset statici del CDN al primo caricamento. Nessuna analytics di terze parti che invii dati di pagamento. Eventuale analytics di prodotto: solo eventi anonimi (es. "file generato", "errore validazione") senza payload.
- **Progressive enhancement**: l'app deve funzionare offline dopo il primo caricamento (PWA con service worker).
- **Library-first, separation of concerns**: la logica CBI è isolata in `@sepalo/core`. Il parsing dei file di input (CSV/XLSX) è preoccupazione dell'applicazione, non del core.

### 5.2 Stack

| Layer | Tool | Motivazione |
|---|---|---|
| Package manager | **pnpm** | Workspaces, fast, disk-efficient |
| Lingua | **TypeScript** strict | Sicurezza tipi, DX, autocompletamento |
| Build (web) | **Vite** | Build veloce, HMR istantaneo, output statico per Vercel |
| UI framework | **React 18** | Ecosistema, conoscenze diffuse, abbondanza componenti |
| Styling | **Tailwind CSS** + **shadcn/ui** | Design coerente, componenti accessibili pronti |
| State management | **Zustand** | Leggero, no boilerplate, persiste su IndexedDB |
| Form | **React Hook Form** + **Zod** | Validazione runtime + tipi statici dal singolo schema |
| Parsing CSV | **PapaParse** (in `web`) | Standard de-facto, robusto |
| Parsing XLSX | **SheetJS** (in `web`) | Standard de-facto, formati multipli |
| Generazione XML | **fast-xml-parser** (in `core`) | Builder dichiarativo, output compatto |
| Validazione XSD | **xmllint-wasm** (in `core`) | libxml in WASM, valida contro XSD client-side |
| Storage | **IndexedDB** via **idb-keyval** | API semplice sopra IndexedDB |
| Crittografia storage | **Web Crypto API** | AES-GCM con chiave derivata da PIN/passphrase via PBKDF2 |
| Test unit/integration | **Vitest** | API Jest-like, 5-10x più veloce |
| Test e2e | **Playwright** | Tre browser, screenshot, auto-wait |
| Lint + format | **Biome** | Singolo tool, 10x più veloce di ESLint+Prettier |
| Versioning | **Changesets** | PR-based release flow per il pacchetto npm |
| CI | **GitHub Actions** | Standard, gratis per repo public |
| Hosting | **Vercel** | Preview per PR, opzionalità per backend futuro |
| Domain | `sepalo.it` (primario), `sepalo.com` (redirect se acquistato) | Da acquistare e verificare disponibilità |


Fetch this design file, read its readme, and implement the relevant aspects of the design. https://api.anthropic.com/v1/design/h/17Ol2p-eMWtappqjrhmtqw?open_file=Sepalo.html
Implement: Sepalo.html

### 5.3 Topologia (monorepo pnpm)

Due pacchetti, gestiti come monorepo:

#### `@sepalo/core` (libreria pubblicata su npm, MIT)

Pure TypeScript, **zero dipendenze DOM**, riutilizzabile in browser, Node.js, Cloudflare Workers, Vercel Edge Functions.

**Responsabilità (tutto e solo CBI):**
- Validazione di un `PaymentBatch` strutturato (IBAN, ABI, totali, charset SEPA, etc.).
- Costruzione dell'XML `CBIBdyPaymentRequest.00.04.01` a partire da un `PaymentBatch`.
- Validazione dell'XML prodotto contro lo schema XSD ufficiale.

**API pubblica:**
```ts
import {
  validatePayment,        // PaymentBatch → ValidationResult
  buildXml,               // PaymentBatch → string (XML)
  validateAgainstXsd,     // string → Promise<ValidationResult>
  generatePaymentFile,    // PaymentBatch → Promise<{ xml: string, errors: ... }>
                          // (helper che orchestra i tre passi sopra)
} from '@sepalo/core';
```

**Cosa NON c'è in `@sepalo/core`:**
- Parsing di file CSV/XLSX/qualsiasi-formato-di-input. Il core riceve un oggetto strutturato in input, non si occupa di come lo si è ottenuto.
- Codice DOM, browser-only, o legato a UI.
- Storage / persistenza.

#### `@sepalo/web` (app web, MIT, non pubblicata)

Consuma `@sepalo/core` e aggiunge:
- UI completa.
- Parser CSV/XLSX in `src/lib/parsers/` che trasformano file utente in `PaymentBatch` (poi passato al core).
- Storage cifrato del profilo ordinante e della rubrica beneficiari.
- Pagine pubbliche, routing, design system.

#### Possibile package futuro (non MVP)

Se in futuro emerge che il parser CSV/XLSX → `PaymentBatch` è utile a integratori terzi, lo si estrae in un terzo package `@sepalo/spreadsheet` con la stessa filosofia (zero deps DOM). Per ora è sovra-ingegnerizzazione.

### 5.4 Storage e privacy

#### Cosa viene persistito (IndexedDB, cifrato di default)

- **Profilo ordinante**: ragione sociale, IBAN, ABI banca, CUC/CF.
- **Rubrica beneficiari** (opzionale): nome, IBAN, BIC se estero, eventuali note.
- **Preferenze UI**: tema, lingua, ultima data esecuzione usata.

#### Cosa NON viene mai persistito

- I file caricati dall'utente.
- Le transazioni dei file generati.
- Gli importi storici.

I file CSV/XLSX vengono parsati in memoria, trasformati in XML, offerti in download, e poi scartati. Nessun residuo su disco se non quello che la cache statica del browser potrebbe aver tenuto.

#### Cifratura con PIN — il default

Al primo accesso, l'utente sceglie un **PIN di 4 cifre**. Il PIN viene usato per derivare una chiave AES-GCM via PBKDF2 (200.000 iterazioni, salt random per device). Tutti i dati persistiti vengono cifrati con questa chiave.

Il PIN viene chiesto:
- Al primo onboarding (definizione + conferma).
- Ad ogni apertura della web app dopo che è stata chiusa.
- Mantenuto in memoria per la sessione corrente (mai persistito).

**Il PIN non viene mai salvato né trasmesso.** Se dimenticato, l'utente può resettare il device (cancella IndexedDB) e re-inserire dati da capo.

#### Modalità "passphrase forte" (opt-in dalle settings)

Per chi vuole più protezione (es. consulenti che gestiscono dati di clienti, contesti ad alto rischio), nelle settings c'è un'opzione per **promuovere il PIN a passphrase**: minimo 12 caratteri, mix consigliato. Stesso meccanismo crittografico, solo lo spazio delle combinazioni cambia da 10⁴ a effettivamente intrattabile.

#### Limiti onesti del PIN da 4 cifre

Va comunicato chiaramente all'utente (sezione `/sicurezza`): un PIN da 4 cifre = 10.000 combinazioni. Con PBKDF2 a 200k iterazioni, ogni tentativo richiede ~150-300ms su browser desktop tipico. Brute force completo = circa 25-50 minuti, **se l'attaccante ha pieno accesso al device e al backup IndexedDB**. Quindi:

- ✅ **Sufficiente** contro: collega che apre il browser per 30 secondi, perdita momentanea del laptop, schermo non bloccato.
- ❌ **Non sufficiente** contro: dispositivo rubato e tenuto, malware, attaccante motivato. Per questi casi → passphrase lunga.

### 5.5 Validazione XSD client-side

Lo schema `CBIBdyPaymentRequest.00.04.01.xsd` viene imbarcato come asset statico nel package `@sepalo/core` (~50KB). All'atto della generazione, l'XML viene validato contro lo schema usando `xmllint-wasm` (libxml compilato in WebAssembly, lazy-loaded ~500KB solo al primo bisogno). Errori di validazione vengono presentati all'utente con riga, percorso XPath e descrizione.

---

## 6. Struttura del repository

```
sepalo/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # PR/push: lint, typecheck, test, build
│       ├── e2e.yml                 # PR/push: Playwright
│       ├── release.yml             # tag → npm publish (core) via Changesets
│       └── deploy-preview.yml      # delegato a Vercel via integrazione GitHub
│
├── packages/
│   ├── core/                       # @sepalo/core — SOLO logica CBI
│   │   ├── src/
│   │   │   ├── builders/
│   │   │   │   ├── group-header.ts
│   │   │   │   ├── payment-info.ts
│   │   │   │   ├── transaction.ts
│   │   │   │   └── document.ts    # entry point: PaymentBatch → XML string
│   │   │   ├── validators/
│   │   │   │   ├── iban.ts        # mod-97
│   │   │   │   ├── abi.ts         # 5 digits + lookup
│   │   │   │   ├── cuc.ts
│   │   │   │   ├── fiscal-code.ts
│   │   │   │   ├── sepa-charset.ts
│   │   │   │   ├── totals.ts      # quadrature
│   │   │   │   └── xsd.ts         # wrapper xmllint-wasm
│   │   │   ├── schemas/
│   │   │   │   └── payment.ts     # Zod: PaymentBatch, Transaction, Initiator
│   │   │   ├── data/
│   │   │   │   ├── abi-list.json  # banche italiane attive
│   │   │   │   └── xsd/
│   │   │   │       └── CBIBdyPaymentRequest.00.04.01.xsd
│   │   │   ├── types/
│   │   │   │   └── index.ts       # tipi pubblici
│   │   │   ├── utils/
│   │   │   │   ├── id-generator.ts
│   │   │   │   ├── date.ts
│   │   │   │   └── sanitize.ts
│   │   │   └── index.ts            # barrel file: API pubblica
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   │   ├── validators/
│   │   │   │   └── builders/
│   │   │   ├── integration/
│   │   │   │   └── pipeline.test.ts  # PaymentBatch → XML → validazione XSD
│   │   │   └── fixtures/
│   │   │       ├── input/         # PaymentBatch JSON di esempio
│   │   │       └── expected/      # XML attesi (golden files)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── web/                        # @sepalo/web — app web
│       ├── public/
│       │   ├── favicon.svg
│       │   ├── og-image.png
│       │   ├── template.csv        # template scaricabile
│       │   └── template.xlsx
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/             # shadcn/ui generated
│       │   │   ├── upload/         # FileDropzone, FilePreview
│       │   │   ├── profile/        # ProfileForm, ProfileSummary, PinSetup
│       │   │   ├── address-book/   # BeneficiaryList, BeneficiaryForm
│       │   │   ├── review/         # TransactionTable, ValidationSummary
│       │   │   ├── result/         # XmlPreview, DownloadButton
│       │   │   └── auth/           # PinPrompt (chiede PIN all'apertura)
│       │   ├── pages/
│       │   │   ├── Home.tsx        # landing + CTA
│       │   │   ├── Generate.tsx    # flow principale
│       │   │   ├── Profile.tsx     # gestione anagrafica ordinante
│       │   │   ├── AddressBook.tsx # rubrica beneficiari
│       │   │   ├── Settings.tsx    # cambia PIN, modalità passphrase, reset
│       │   │   ├── Help.tsx        # guida + FAQ
│       │   │   └── About.tsx       # progetto, privacy, license
│       │   ├── stores/
│       │   │   ├── profile.ts      # Zustand + persist su IndexedDB cifrato
│       │   │   ├── address-book.ts
│       │   │   ├── settings.ts
│       │   │   └── auth.ts         # stato sessione (chiave in memoria)
│       │   ├── lib/
│       │   │   ├── parsers/
│       │   │   │   ├── csv.ts     # CSV → PaymentBatch (parziale)
│       │   │   │   ├── xlsx.ts    # XLSX → PaymentBatch (parziale)
│       │   │   │   └── index.ts   # parseSpreadsheet entry point
│       │   │   ├── crypto.ts       # AES-GCM + PBKDF2
│       │   │   ├── storage.ts      # idb-keyval wrapper cifrato
│       │   │   └── analytics.ts    # eventi anonimi opzionali
│       │   ├── hooks/
│       │   ├── styles/
│       │   │   └── globals.css
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── e2e/
│       │   ├── happy-path.spec.ts
│       │   ├── validation-errors.spec.ts
│       │   ├── pin-flow.spec.ts
│       │   └── fixtures/
│       ├── tests/
│       │   └── components/
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── playwright.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── PROJECT.md                  # questo documento
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── CSV_FORMAT.md               # specifica template input
│   └── SECURITY.md                 # threat model
│
├── .changeset/                     # changesets per release
├── .gitignore
├── biome.json
├── pnpm-workspace.yaml
├── package.json                    # root: scripts top-level
├── tsconfig.base.json
├── README.md
├── LICENSE                         # MIT
└── CODE_OF_CONDUCT.md
```

---

## 7. Data model interno

### 7.1 Tipi TypeScript pubblici (`@sepalo/core`)

```ts
// Identificativo dell'ordinante
export type PartyIdentifier =
  | { type: 'CUC'; value: string }   // 8 caratteri
  | { type: 'CF'; value: string };   // 11 o 16 caratteri

export interface Initiator {
  name: string;                      // max 70
  identifier: PartyIdentifier;
  iban: string;                      // IBAN ordinante
  abi: string;                       // 5 cifre
}

export interface Beneficiary {
  name: string;                      // max 70
  iban: string;
  bic?: string;                      // solo se IBAN non IT/SM
}

export interface Transaction {
  id?: string;                       // se assente, generato
  endToEndId?: string;               // se assente, = id
  amount: number;                    // EUR, max 2 decimali
  beneficiary: Beneficiary;
  remittanceInfo: string;            // causale, max 140
}

export interface PaymentBatch {
  initiator: Initiator;
  executionDate: string;             // YYYY-MM-DD
  batchBooking: boolean;             // default true
  transactions: Transaction[];
}

// Risultato validazione
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;                      // es. "transactions[3].iban"
  code: string;                      // es. "INVALID_IBAN"
  message: string;
  rowNumber?: number;                // popolato dal chiamante (web app) per errori da CSV
}
```

### 7.2 Schemi Zod (estratto, in `@sepalo/core`)

```ts
import { z } from 'zod';

export const ibanSchema = z
  .string()
  .regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/)
  .refine(checkIbanMod97, 'IBAN checksum non valido');

export const transactionSchema = z.object({
  id: z.string().max(35).optional(),
  endToEndId: z.string().max(35).optional(),
  amount: z.number().positive().max(999_999_999.99).multipleOf(0.01),
  beneficiary: z.object({
    name: z.string().min(1).max(70),
    iban: ibanSchema,
    bic: z.string().regex(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/).optional(),
  }),
  remittanceInfo: z.string().min(1).max(140),
});

export const paymentBatchSchema = z.object({
  initiator: initiatorSchema,
  executionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  batchBooking: z.boolean().default(true),
  transactions: z.array(transactionSchema).min(1),
});
```

### 7.3 Template CSV/XLSX di input (responsabilità di `@sepalo/web`)

Il parser nella web app trasforma i file utente in `PaymentBatch` (parziale: mancano `initiator` ed `executionDate`, aggiunti dall'app dal profilo + selezione utente).

Header standard (case-insensitive, sinonimi accettati):

| Colonna | Sinonimi | Tipo | Mandatory | Descrizione |
|---|---|---|---|---|
| `beneficiario` | `nome`, `name`, `creditor` | string | Sì | Ragione sociale o nome |
| `iban` | `iban_beneficiario` | string | Sì | IBAN del beneficiario |
| `bic` | `swift` | string | Solo se IBAN estero | BIC banca beneficiario |
| `importo` | `amount`, `eur` | number | Sì | Importo in euro, decimale `.` o `,` |
| `causale` | `descrizione`, `remittance` | string | Sì | Max 140 caratteri |
| `riferimento` | `endtoend`, `id` | string | No | Generato se assente |

Esempio:

```csv
beneficiario,iban,importo,causale
Mario Rossi,IT60X0542811101000000123456,1500.00,Stipendio dicembre 2024
Bianchi Srl,IT89P0301503200000003012345,2350.50,Fattura n. 234 del 01/12/2024
```

Il template scaricabile è disponibile in `/template.csv` e `/template.xlsx`.

---

## 8. UX flow

### 8.1 Onboarding (prima volta)

1. Utente atterra sulla home (`sepalo.it`).
2. CTA principale: *"Genera il tuo primo file CBI"*. Sopra/sotto, due righe che spiegano: "Carica il tuo Excel, ti diamo l'XML pronto. Tutto nel tuo browser, niente lascia il tuo computer."
3. Click → modal di setup (4 step):
   - Step 1: dati anagrafici ordinante (ragione sociale, CF/PIVA, CUC se ne ha uno).
   - Step 2: dati banca ordinante (IBAN — l'ABI è auto-derivato dall'IBAN).
   - Step 3: **Imposta PIN da 4 cifre**. UI tipo tastierino numerico, conferma chiedendo di reinserire. Con un piccolo testo "*il PIN protegge i tuoi dati salvati su questo dispositivo. Non viene mai trasmesso. Se lo dimentichi, dovrai reinserire profilo e rubrica.*"
   - Step 4: conferma + breve riepilogo.
4. Profilo cifrato e salvato → redirect al flow di generazione.

### 8.2 Flusso principale

1. **Sblocco PIN** (se la sessione è scaduta o è una nuova apertura): UI con tastierino, 5 tentativi prima di mostrare un cooldown progressivo (1s → 5s → 30s → 5min → 1h).
2. **Upload**: drag-and-drop di un CSV/XLSX. Anteprima delle prime 5 righe parsate.
3. **Mappatura colonne** (solo se header non riconosciuti): UI per mappare colonne del file alle colonne attese. Salvata come preferenza per le volte successive.
4. **Review**: tabella editabile con tutte le transazioni, evidenziazione errori riga per riga (IBAN invalidi, importi out-of-range, causali troppo lunghe). Totali e quadrature in alto.
5. **Configurazione bonifico**:
   - Data esecuzione (default: prossimo giorno lavorativo).
   - Tipo registrazione: cumulativo (`BtchBookg=true`) o singola (`false`).
6. **Generazione**: click *"Genera XML"*. Loader breve. Validazione XSD eseguita.
7. **Output**:
   - Se valido: download del file XML + summary (n. transazioni, totale, hash SHA-256 del file).
   - Se non valido: lista errori cliccabili che riportano alla riga problematica.

### 8.3 Stati di errore & edge cases

- File troppo grande (>5MB o >5000 righe): warning, suggerimento di splittare.
- Encoding CSV non UTF-8: rilevamento e conversione automatica con warning.
- Caratteri non SEPA-compliant nelle causali: sostituzione automatica + warning per riga.
- IBAN duplicato + stesso importo + stessa data: warning "potenziale doppio pagamento".
- Storage IndexedDB pieno o disabilitato: degradazione a in-memory only con avviso.
- PIN dimenticato: pulsante "reset device" che cancella IndexedDB e riavvia onboarding.

---

## 9. Design system & branding

### Identità

- **Nome**: Sepalo
- **Tagline**: *"Bonifici massivi senza fatica. Open source, 100% nel tuo browser."*
- **Tono**: professionale ma accessibile. No gergo bancario inutile, no esagerazioni "rivoluzionarie". Diretto, italiano vero.

### Visual

- **Palette**: una primary (es. blu profondo `#1e3a8a` o blu navy istituzionale), un accent per CTA (es. verde finance `#10b981`), neutri grigi per testo/sfondi.
- **Tipografia**: Inter (sans-serif) per UI, JetBrains Mono per anteprime XML/codice.
- **Iconografia**: Lucide (coerente con shadcn/ui).
- **Layout**: max-width contenuto 1200px, padding generoso, righe ariose, niente più di 3 livelli gerarchici visibili contemporaneamente.

### Pagine pubbliche

- `/` — Home: hero con CTA, 3 punti chiave (privacy, gratuito, open source), screenshot del flow, sezione "come funziona", footer con link a GitHub.
- `/genera` — Flow principale.
- `/profilo` — Gestione dati ordinante.
- `/rubrica` — Rubrica beneficiari.
- `/impostazioni` — Cambio PIN, modalità passphrase, reset device.
- `/guida` — Documentazione utente.
- `/sicurezza` — Pagina dedicata a privacy e sicurezza, con threat model leggibile e limiti del PIN da 4 cifre comunicati onestamente.
- `/about` — Mission, team (anche solo te), licenza, ringraziamenti.

---

## 10. Roadmap a fasi

### Fase 0 — Setup (settimana 1)

- Repo GitHub creato, struttura monorepo, toolchain (pnpm, Biome, TS, Vitest, Playwright).
- CI base (lint + typecheck + test sketch).
- README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT.
- Vercel project collegato, deploy della home statica placeholder.
- Acquisto domini `sepalo.it` (+ `sepalo.com` se libero).

### Fase 1 — MVP core + UI (settimane 2-5)

- `@sepalo/core`: builder XML + validatori IBAN/ABI/totali + XSD validation.
- Test fixtures con almeno 5 casi reali (stipendi, fornitori, mix).
- `@sepalo/web`: home + parser CSV/XLSX + flow upload → review → genera → download.
- Profilo ordinante con **cifratura PIN attiva by default**.
- Validazione client end-to-end.
- Deploy su `sepalo.it`.

### Fase 2 — Estensioni qualità (settimane 6-7)

- Rubrica beneficiari riutilizzabile.
- Modalità passphrase forte (opt-in nelle settings).
- Template CSV/XLSX scaricabile.
- PWA + offline support.
- Pagine `/sicurezza`, `/guida`.
- Pubblicazione `@sepalo/core` su npm.

### Fase 3 — Estensioni opzionali (post v1.0)

- Inglese (UI multi-lingua).
- SEPA Direct Debit (`pain.008`).
- Bonifici esteri cross-border.
- API hosted opzionale (Vercel functions): endpoint REST per developer che vogliono generare CBI lato server. **Solo se richiesta.**
- Eventuale package `@sepalo/spreadsheet` se emerge utilità per integratori.

---

## 11. Testing strategy

### Layer 1 — Unit (`@sepalo/core`)

- Ogni validator: casi positivi e negativi (IBAN validi, IBAN sbagliati di 1 carattere, ABI inesistenti, etc.).
- Builders: snapshot test su output XML stringa.
- Coverage target: **≥ 90%** sul core.

### Layer 2 — Integration (`@sepalo/core`)

- Pipeline completa: `PaymentBatch` JSON (fixture) → `validatePayment` → `buildXml` → `validateAgainstXsd`. Output deve fare match byte-per-byte con golden file.
- Almeno 5 fixture: 1 transazione, multi-transazione, errori di validazione, IBAN estero, importi grandi.

### Layer 3 — Unit + Integration (`@sepalo/web`)

- Parser CSV/XLSX: tabelle di input → output atteso (`PaymentBatch` parziale).
- Test fixture: CSV virgola, CSV punto-e-virgola, XLSX, XLS legacy, encoding non-UTF-8.
- Test componenti UI critici (FileDropzone, ProfileForm, PinPrompt, TransactionTable) con Vitest + Testing Library.

### Layer 4 — End-to-end (`@sepalo/web`)

- Playwright headless su Chromium + Firefox + WebKit.
- Happy path: utente arriva, fa onboarding (incluso PIN), carica CSV, genera XML, scarica file.
- PIN flow: utente apre dopo riavvio, viene chiesto PIN, sbaglio → cooldown progressivo, PIN giusto → accesso.
- Validation errors: utente carica CSV con IBAN sbagliato, vede errore, lo corregge, scarica.
- Persistenza: utente compila profilo, ricarica pagina, profilo è ancora lì (dopo PIN).
- Reset device: utente clicca reset, conferma, IndexedDB pulito, torna a onboarding.

### Golden file workflow

I file XML attesi vivono in `packages/core/tests/fixtures/expected/`. Quando una modifica intenzionale rompe lo snapshot, si aggiorna il golden file (`pnpm test --update`) e la review della PR include la diff dell'XML nel review code.

---

## 12. CI/CD

### Branch strategy

- `main`: protetto, solo merge tramite PR, CI verde obbligatoria.
- Feature branches: `feat/...`, `fix/...`, `chore/...`. PR target `main`.
- Tag `v*.*.*` → trigger release npm via Changesets.

### Workflow `ci.yml`

Trigger: PR su `main`, push su `main`.

Steps:
1. Checkout + setup pnpm + cache.
2. Install: `pnpm install --frozen-lockfile`.
3. Lint: `pnpm biome ci .`.
4. Typecheck: `pnpm -r typecheck`.
5. Unit + integration: `pnpm -r test --coverage`.
6. Build: `pnpm -r build`.
7. Upload coverage a Codecov.

### Workflow `e2e.yml`

Trigger: PR su `main`, push su `main`.

Steps:
1. Setup + install + Playwright browsers cache.
2. Build web: `pnpm --filter @sepalo/web build`.
3. Run e2e: `pnpm --filter @sepalo/web test:e2e`.
4. Upload trace + screenshots su fail.

### Workflow `release.yml`

Trigger: push su `main` con file `.changeset/*.md` aperto.

Steps:
1. Setup + install.
2. `pnpm changeset version` (bump versioni).
3. PR automatica con bump.
4. Quando la PR di release è merged: `pnpm publish -r --access public` (solo `@sepalo/core`).

### Vercel

Integrazione GitHub nativa: ogni PR genera preview URL, ogni merge su `main` deploya in produzione su `sepalo.it`. Headers di sicurezza configurati in `vercel.json`:

- `Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; ...`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 13. Sicurezza & threat model

### Asset da proteggere

1. IBAN ordinante e dati banca dell'utente.
2. IBAN beneficiari e relative anagrafiche.
3. Importi e causali dei pagamenti generati.

### Attaccanti considerati

- **Curioso opportunistico** (collega che usa il PC per 30 secondi): mitigato dal PIN da 4 cifre + lock al riavvio app.
- **Attaccante con accesso fisico prolungato** (laptop rubato): PIN da 4 cifre **insufficiente** (brute force in ~30 min). Mitigazione: utente promuove a passphrase nelle settings.
- **Malware sul device**: fuori scope. Se il device è compromesso, qualsiasi tool è compromesso.
- **Network observer**: nessun dato sensibile passa via network → non rilevante.
- **Operatore Sepalo (= te)**: nessun dato arriva al server → non c'è cosa esfiltrare.
- **Supply chain attack** (npm package compromessa): mitigato da lockfile committato, audit periodico delle deps, Dependabot, SRI sui CDN.

### Garanzie esplicite

- **Nessuna chiamata HTTP** verso domini terzi durante l'uso dell'app, eccetto asset statici al primo load.
- **CSP strict** che blocca eventuali tentativi di esfiltrazione anche in caso di XSS.
- **Subresource Integrity** (SRI) su tutti gli script esterni se presenti.
- **Audit log pubblico**: ogni rilascio referenzia il commit hash, le dipendenze sono verificabili pubblicamente.

### Comunicazione del threat model

Pagina `/sicurezza` in italiano, leggibile, deve spiegare onestamente:
- Cosa è cifrato (tutto quello che persiste).
- Cosa NON è cifrato (i file XML scaricati restano in chiaro nella cartella Downloads).
- Limiti del PIN da 4 cifre (sufficiente contro curiosi, non contro motivati).
- Quando attivare la passphrase forte.

---

## 14. Open source: licenza, contributing, governance

### Licenza

**MIT** sia per `@sepalo/core` sia per `@sepalo/web`. Massima adoption, zero attriti per chi vuole forkare/integrare. Nessun copyleft.

### Contributing

- File `CONTRIBUTING.md` con setup locale, convenzioni di codice (Biome enforcerà), commit conventions (Conventional Commits).
- Issue templates: bug, feature, validazione tracciato (caso d'uso speciale).
- PR template: checklist (test aggiunti? docs aggiornate? changeset creato?).

### Governance

- Single maintainer (te) all'inizio.
- Decisioni tecniche tracciate come ADR (Architecture Decision Records) in `docs/adr/`.
- Roadmap pubblica via GitHub Projects.

### Community

- README in inglese (oltre l'italiano del prodotto end-user).
- Link a Discord o Telegram solo se cresce.
- Discussions GitHub abilitate.

---

## 15. Domande aperte / decisioni da prendere

Cose che vanno sciolte prima di iniziare lo sviluppo, in ordine di priorità:

1. **Acquisto dominio**: `sepalo.it` (e `sepalo.com` se libero) — chi acquista, su quale registrar? Suggerisco Porkbun.
2. **Logo & visual identity**: serve un logo entry-level (anche solo wordmark + simbolo) prima del lancio. Da fare tu o commissionare?
3. **Analytics opt-in**: usiamo Plausible (self-hosted o cloud), Umami (self-hosted), oppure niente analytics? Implica una scelta sul cookie banner (con Plausible cloud servirebbe).
4. **Lookup ABI**: il file `abi-list.json` da dove? Banca d'Italia pubblica una lista, ma da capire termini di redistribuzione.
5. **Mascot / personalità del brand**: ne vuoi una? Aiuta storytelling.
6. **Lancio**: Product Hunt + post LinkedIn + Hacker News? Quando?
7. **Modello economico v2**: anche se per ora gratis, abbozziamo cosa potrebbe essere il "pro tier" per orientare le scelte tecniche? (es. cloud sync rubrica, integrazione SDD, API hosted).

---

## 16. Appendice A — Prompt master per Claude Code

Da incollare a Claude Code all'apertura del progetto, **come system prompt o primo messaggio** in una sessione di lavoro. Definisce il contesto persistente.

```text
Sei lo sviluppatore principale di Sepalo, una web app open source che genera
file XML CBIBdyPaymentRequest.00.04.01 (CBI/SEPA Credit Transfer) a partire da
file CSV/XLSX, completamente client-side.

CONTEXT
- Repository: monorepo pnpm con due pacchetti
  - packages/core (@sepalo/core, MIT, pubblicato su npm): SOLO logica CBI.
    Riceve PaymentBatch strutturato → produce XML validato. ZERO parsing di
    file di input, ZERO codice DOM.
  - packages/web (@sepalo/web, MIT, deployato su Vercel come sepalo.it): app
    web. Include il parser CSV/XLSX in src/lib/parsers/ che produce
    PaymentBatch (poi passato al core).
- Documentazione completa: ./docs/PROJECT.md (leggila prima di qualsiasi
  modifica significativa).

PRINCIPI NON NEGOZIABILI
1. Tutto client-side. Nessuna chiamata HTTP a server applicativi durante l'uso.
   Nessun dato di pagamento può lasciare il browser.
2. Separazione delle responsabilità: il package `core` non sa nulla di file CSV,
   XLSX, DOM. Il package `web` non implementa la logica CBI.
3. Privacy by architecture > convenienza. Se una scelta tecnica facilita lo
   sviluppo ma rompe la privacy, è la scelta sbagliata.
4. Storage cifrato by default con PIN 4 cifre. PIN richiesto al primo
   onboarding, sempre, senza opzioni "modalità rapida senza PIN".
5. Test-first per il core. Prima la fixture (PaymentBatch + golden XML atteso),
   poi il codice che fa passare il test.

CONVENZIONI DI CODICE
- TypeScript strict, no `any` se non con commento giustificativo.
- Tutto in inglese (variabili, commenti, docstring, log).
- File naming: kebab-case. Componenti React: PascalCase.
- Import paths: usa alias `@sepalo/core` da web, mai `../../packages/core/...`.
- Validazione runtime con Zod, sempre sincronizzata con tipi statici (z.infer).
- XML generato con `fast-xml-parser`, mai concatenazione di stringhe.

CONVENZIONI DI TEST
- Vitest per unit + integration. Playwright per e2e.
- Ogni validator: almeno 5 casi positivi + 5 negativi.
- Ogni builder: snapshot test su output XML.
- Pipeline completa coperta da almeno 5 fixture diverse in
  packages/core/tests/fixtures/.

CONVENZIONI DI COMMIT & PR
- Conventional Commits: feat:, fix:, chore:, docs:, test:, refactor:.
- Una PR = una unit logica. Mai mescolare refactor + feat nello stesso PR.
- Ogni PR che modifica `packages/core` deve includere un changeset
  (`pnpm changeset`).

QUANDO IN DUBBIO
- Su scope: re-leggi PROJECT.md sezione 3 (in/out of scope MVP).
- Su una scelta tecnica: chiedimi prima di committare a una direzione.
- Su un campo CBI: leggi PROJECT.md sezione 4 (specifica formato).
- Su una scelta di UX: leggi PROJECT.md sezione 8.
- Sulla separazione core/web: se stai aggiungendo qualcosa al core, chiediti
  "questa logica avrebbe senso anche in Node lato server, senza file e senza
  DOM?". Se no, va in `web`.

LINGUE
- Codice, commenti, log, doc tecnica: inglese.
- README utente, copy UI, docs/SECURITY.md (versione utente): italiano.
- Comunicazione con me in chat: italiano.

NON FARE MAI
- Aggiungere dipendenze pesanti senza giustificazione (controlla bundle size).
- Introdurre un backend o chiamate verso server applicativi.
- Mettere parsing di file CSV/XLSX nel package `core`.
- Mettere logica CBI nel package `web` (riusa sempre `@sepalo/core`).
- Suggerire analytics intrusive.
- Cambiare la licenza.
- Pushare su main direttamente.
```

---

## 17. Appendice B — Prompt task-by-task

Prompt incrementali per Claude Code, da eseguire in ordine. Ognuno produce un PR mergeabile.

### Prompt 0 — Setup repo

```text
Inizializza il monorepo Sepalo seguendo PROJECT.md sezione 6.

Task:
1. Crea la struttura cartelle del repo (sepalo/).
2. Configura pnpm workspaces (pnpm-workspace.yaml + package.json root).
3. Setup TypeScript con tsconfig.base.json esteso da entrambi i package.
4. Setup Biome con biome.json (regole strict, organize imports on save).
5. Setup Vitest configurato per entrambi i package (config root + override).
6. Configura GitHub Actions: ci.yml con job lint + typecheck + test (per ora
   con un solo test placeholder che passa).
7. Crea README.md, LICENSE (MIT), .gitignore, CONTRIBUTING.md, CODE_OF_CONDUCT.md.
8. Configura @changesets/cli per il versioning di @sepalo/core.

Output atteso: PR "chore: bootstrap monorepo" con CI verde.
```

### Prompt 1 — Core: tipi e schemi

```text
Implementa i tipi TypeScript pubblici e gli schemi Zod del package
@sepalo/core, seguendo PROJECT.md sezione 7.1 e 7.2.

Task:
1. Crea packages/core/src/types/index.ts con tutti i tipi pubblici (Initiator,
   Beneficiary, Transaction, PaymentBatch, ValidationResult, ValidationError).
2. Crea packages/core/src/schemas/payment.ts con gli schemi Zod corrispondenti.
   I tipi statici devono essere derivati con z.infer, non duplicati.
3. Aggiungi unit test in tests/unit/schemas/ che verificano: schema accetta
   input valido, rifiuta invalido con errore appropriato.

Output atteso: PR "feat(core): add types and zod schemas".
```

### Prompt 2 — Core: validators

```text
Implementa i validator di @sepalo/core (PROJECT.md sezione 4.4).

Task:
1. validators/iban.ts: implementa checksum mod-97 IBAN. Per IBAN italiani anche
   verifica del CIN. Funzione: `validateIban(iban: string): boolean`.
2. validators/abi.ts: verifica che l'ABI sia 5 cifre e presente in
   data/abi-list.json. Per ora abi-list.json può contenere uno stub di 10 ABI
   reali (es. UniCredit 02008, Intesa 03069, ...).
3. validators/cuc.ts: 8 caratteri alfanumerici.
4. validators/fiscal-code.ts: formato CF italiano (16 char) o P.IVA (11 cifre).
5. validators/sepa-charset.ts: funzione che dato un testo restituisce
   { valid: bool, sanitized: string, replaced: string[] }.
6. validators/totals.ts: dato un PaymentBatch, verifica che le quadrature siano
   coerenti.

Per ognuno: minimo 5 casi positivi + 5 negativi nei test.

Output atteso: PR "feat(core): add validators with full test coverage".
```

### Prompt 3 — Core: XML builder

```text
Implementa la generazione XML CBIBdyPaymentRequest.00.04.01 in @sepalo/core
(PROJECT.md sezione 4).

Task:
1. builders/group-header.ts, payment-info.ts, transaction.ts: ognuno costruisce
   la propria sezione XML come oggetto JS che `fast-xml-parser` può serializzare.
2. builders/document.ts: entry point. Funzione
   `buildXml(batch: PaymentBatch): string`. Output: XML stringa con dichiarazione
   <?xml ...?> e namespace corretto.
3. utils/id-generator.ts: genera MsgId, PmtInfId, InstrId, EndToEndId univoci
   nella forma `MSG{YYYYMMDDHHmmss}{random6}`.
4. utils/sanitize.ts: applica sanitizzazione SEPA charset ai testi (Nm,
   RmtInf/Ustrd).
5. tests/fixtures/input/: 5+ PaymentBatch JSON di esempio.
6. tests/fixtures/expected/: golden file XML per ognuna.
7. tests/integration/pipeline.test.ts: validator → builder, deve fare match
   byte-per-byte con i golden file.

Output atteso: PR "feat(core): add xml builder with golden file tests".
```

### Prompt 4 — Core: XSD validation

```text
Aggiungi validazione XSD client-side in @sepalo/core.

Task:
1. data/xsd/CBIBdyPaymentRequest.00.04.01.xsd: scarica e committa lo schema XSD
   ufficiale dal sito CBI.
2. validators/xsd.ts: wrapper attorno a xmllint-wasm. Funzione
   `validateAgainstXsd(xml: string): Promise<ValidationResult>`. Lazy-load del
   WASM (la prima chiamata può essere più lenta, è ok).
3. Esponi `generatePaymentFile(batch: PaymentBatch)` come helper top-level che
   orchestra: validatePayment → buildXml → validateAgainstXsd.
4. Test: verifica che un XML buono passi, uno con un campo mandatory mancante
   produca un errore con path XPath e descrizione utili.

Output atteso: PR "feat(core): add xsd validation via xmllint-wasm".
```

### Prompt 5 — Web: setup app shell

```text
Setup dell'applicazione web @sepalo/web (Vite + React + Tailwind + shadcn/ui).

Task:
1. Inizializza Vite con template react-ts in packages/web.
2. Configura Tailwind CSS + shadcn/ui (component path: src/components/ui).
3. Setup React Router (6 pagine: Home, Generate, Profile, AddressBook,
   Settings, Help).
4. Layout base: header con logo + nav, footer con link GitHub + licenza.
5. Setup Zustand per state management con persistenza IndexedDB (idb-keyval).
6. Aggiungi vercel.json con headers di sicurezza (CSP, HSTS, etc. — vedi
   PROJECT.md sezione 12).
7. Pagina Home funzionante con CTA "Genera il tuo primo file CBI".

Output atteso: PR "feat(web): bootstrap app shell with routing and layout".
Preview Vercel verde.
```

### Prompt 6 — Web: parser CSV/XLSX

```text
Implementa il parser di input nella web app (PROJECT.md sezione 7.3).
Questo NON va nel core: è responsabilità della web app trasformare file utente
in PaymentBatch (parziale, manca initiator + executionDate).

Task:
1. lib/parsers/csv.ts: usa PapaParse per parsare CSV. Auto-detect del separatore
   (`,` `;` `\t`). Header case-insensitive con sinonimi (vedi tabella in
   PROJECT.md). Output: array di righe normalizzate con numero di riga
   originale per error reporting.
2. lib/parsers/xlsx.ts: usa SheetJS. Stessa logica di sinonimi colonne.
3. lib/parsers/index.ts: funzione `parseSpreadsheet(file: File):
   Promise<ParsedRows>` che routing per estensione e ritorna righe + meta.
4. e2e/fixtures/: aggiungi 4 file di esempio (CSV virgola, CSV punto-e-virgola,
   XLSX, XLS legacy).
5. Unit test per ogni parser + edge cases (encoding latin-1, header in
   posizione non standard, righe vuote in mezzo).

Output atteso: PR "feat(web): add csv and xlsx parsers".
```

### Prompt 7 — Web: profilo ordinante + cifratura PIN

```text
Implementa la gestione del profilo ordinante con cifratura PIN by default
(PROJECT.md sezione 5.4 e 8.1).

Task:
1. lib/crypto.ts: PBKDF2 (200k iterazioni) + AES-GCM via Web Crypto. Funzioni
   `deriveKey(pin, salt)`, `encrypt(data, key)`, `decrypt(blob, key)`.
2. lib/storage.ts: wrapper su idb-keyval con namespace "@sepalo/v1". Tutto
   passa attraverso encrypt/decrypt usando la chiave in memoria nello store
   `auth`.
3. stores/auth.ts: Zustand store per chiave derivata (in-memory, mai persistita).
4. stores/profile.ts: Zustand store con persistenza cifrata.
5. components/auth/PinSetup.tsx: tastierino numerico per impostare PIN al
   primo onboarding (4 cifre + conferma).
6. components/auth/PinPrompt.tsx: tastierino per sblocco a ogni nuova sessione,
   con cooldown progressivo dopo errori.
7. components/profile/ProfileForm.tsx: form react-hook-form + Zod (riusa lo
   schema da @sepalo/core). Auto-deriva ABI dall'IBAN.
8. pages/Profile.tsx: visualizza profilo, form di edit.
9. Modal di onboarding 4-step (anagrafica → banca → PIN → conferma).

Output atteso: PR "feat(web): add initiator profile with pin-encrypted
storage".
```

### Prompt 8 — Web: flow di generazione

```text
Implementa il flusso end-to-end di generazione (PROJECT.md sezione 8.2).

Task:
1. components/upload/FileDropzone.tsx: drag-and-drop, supporto CSV/XLSX/XLS.
2. components/upload/FilePreview.tsx: anteprima prime 5 righe parsate.
3. components/review/TransactionTable.tsx: tabella editabile con evidenziazione
   errori. Totali in alto.
4. components/review/ValidationSummary.tsx: lista errori cliccabili.
5. components/result/XmlPreview.tsx: anteprima primi 50 righe XML in JetBrains
   Mono.
6. components/result/DownloadButton.tsx: trigger download del Blob XML.
7. pages/Generate.tsx: orchestra il flow upload → review → genera → download.
   Usa parseSpreadsheet (web) → costruisce PaymentBatch completo (con profilo
   + executionDate) → chiama generatePaymentFile (@sepalo/core).

Output atteso: PR "feat(web): add full generation flow".
```

### Prompt 9 — Web: rubrica beneficiari + impostazioni

```text
Aggiungi rubrica beneficiari e pagina impostazioni.

Task:
1. stores/address-book.ts: Zustand store cifrato per rubrica.
2. components/address-book/*: list + add + edit + delete beneficiari.
3. pages/AddressBook.tsx: gestione completa.
4. Integrazione in TransactionTable: dropdown autocomplete beneficiari salvati.
5. pages/Settings.tsx:
   - Cambia PIN (richiede PIN corrente + nuovo + conferma).
   - Promuovi a passphrase forte (min 12 char).
   - Reset device (cancella IndexedDB con doppia conferma).
6. Documentazione UX: copy chiaro su cosa fa ogni opzione.

Output atteso: PR "feat(web): add address book and settings page".
```

### Prompt 10 — Web: e2e tests

```text
Aggiungi test end-to-end con Playwright (PROJECT.md sezione 11 layer 4).

Task:
1. playwright.config.ts: chromium + firefox + webkit, baseURL da env.
2. e2e/happy-path.spec.ts: onboarding (incluso PIN) → upload CSV reale →
   genera → verifica download dell'XML.
3. e2e/validation-errors.spec.ts: upload con IBAN invalido → vede errore →
   corregge → procede.
4. e2e/pin-flow.spec.ts: chiusura sessione → riapertura → richiesta PIN →
   PIN sbagliato (cooldown progressivo) → PIN giusto → accesso.
5. e2e/persistence.spec.ts: profilo persiste tra reload (dopo PIN).
6. e2e/reset-device.spec.ts: reset → IndexedDB pulito → torna a onboarding.
7. Workflow .github/workflows/e2e.yml.

Output atteso: PR "test(web): add playwright e2e suite".
```

### Prompt 11 — Polish & launch

```text
Tutto il polish pre-lancio.

Task:
1. PWA: manifest, service worker per offline.
2. Pagina /sicurezza con threat model leggibile (italiano), inclusi limiti
   onesti del PIN da 4 cifre.
3. Pagina /guida con FAQ + screenshot del flow.
4. Template scaricabile in /public/template.csv e template.xlsx.
5. SEO: meta tags, og-image, sitemap.
6. Pubblica @sepalo/core su npm.
7. Apri repo come pubblico, configura Discussions, issue templates, PR template.

Output atteso: PR "chore: pre-launch polish". Successivamente: tag v1.0.0.
```

---

## 18. Appendice C — Risorse e riferimenti

### Specifiche ufficiali

- **CBI**: https://www.cbiservice.com/ — manuali tecnici, validatore online, schemi XSD.
- **ISO 20022**: https://www.iso20022.org/ — riferimento pain.001.001.09. (occhio che le speicfiche del CBI italiano sono diverse)
- **EPC SEPA Rulebook**: https://www.europeanpaymentscouncil.eu/

### Implementazioni di riferimento

- `linkmesrl/cbi` su GitHub: libreria Ruby/JS open source per CBI 00.04.00. Buono come riferimento di struttura, ma indietro come versione.
- Modulo OCA `l10n_it_account_payment_pain` per Odoo: vale leggere per capire i casi limite reali.
- `sepacbi` (Linkspirit) Python: docs ben fatti, riferimento per i campi.

### Tooling

- shadcn/ui: https://ui.shadcn.com/
- xmllint-wasm: https://github.com/jvilk/xmllint-wasm
- fast-xml-parser: https://github.com/NaturalIntelligence/fast-xml-parser
- Changesets: https://github.com/changesets/changesets
- idb-keyval: https://github.com/jakearchibald/idb-keyval

### Lookup ABI

- **Banca d'Italia — Albo banche**: lista ufficiale, va verificato il regime di redistribuzione.
- Alternativa pratica: Wikipedia lista ABI italiani (CC BY-SA), buon punto di partenza per uno stub.

---

*Fine documento. Pronto per essere committato come `docs/PROJECT.md` nel repo Sepalo.*
