# Sepalo — Development Plan

> Living document. Updated after each completed milestone.

---

## Versioning & Branch Strategy

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

| Range | Meaning |
|---|---|
| `0.0.x` | Initial setup and scaffolding |
| `0.x.0` | Development milestone (one per milestone) |
| `1.0.0-beta.x` | Iterative public betas |
| `1.0.0` | Final stable release |

First committed version: **`v0.0.1`** (monorepo init).
First public beta: **`v1.0.0-beta.1`** (M8 complete).

### Branch Naming

| Prefix | When to use |
|---|---|
| `feat/short-name` | New feature |
| `fix/short-name` | Bug fix |
| `chore/short-name` | Tooling, dependencies, configuration, CI |
| `docs/short-name` | Documentation only |
| `test/short-name` | Tests only (no production code changes) |
| `refactor/short-name` | Refactoring without behaviour change |

`main` is always deployable to `sepalo.it`. No direct pushes — merge only via PR with green CI.

`@sepalo/core` release branches: managed automatically by Changesets (do not create manually).

### Commit Convention: Conventional Commits

```
feat: add iban mod-97 validator
fix: correct batch booking default value
chore: upgrade xmllint-wasm to 0.10.0
docs: add ABI update process to DEVELOPMENT_PLAN
test: add edge cases for latin-1 csv parser
refactor: extract date utils from document builder
```

`BREAKING CHANGE:` in commit footer bumps MAJOR (post-1.0.0 only).

### Release Tags

Each milestone → tag on merge commit: `v0.1.0`, `v0.2.0`, ...
Beta: `v1.0.0-beta.1`, `v1.0.0-beta.2`, ...
Stable: `v1.0.0`

---

## Stack (relative to original spec)

| Layer | Tool | Notes |
|---|---|---|
| **Web build** | **Next.js 15** (App Router) | Replaces Vite — SSR for public pages, CSR for tool |
| **Analytics** | **Rybbit** | Replaces generic analytics.ts — cookie-free, GDPR compliant |
| **SEO** | Next.js Metadata API + `app/sitemap.ts` + `app/robots.ts` | Added |
| Package manager | pnpm workspaces | Unchanged |
| Language | TypeScript strict | Unchanged |
| UI framework | React 19 (bundled with Next.js 15) | Upgrade from 18 |
| Styling | Tailwind CSS v4 + shadcn/ui | Unchanged |
| State | Zustand | Unchanged |
| Form | React Hook Form + Zod | Unchanged |
| CSV parsing | PapaParse | Unchanged (in `web`) |
| XLSX parsing | SheetJS | Unchanged (in `web`) |
| XML generation | fast-xml-parser | Unchanged (in `core`) |
| XSD validation | xmllint-wasm | Unchanged (in `core`) |
| Storage | idb-keyval | Unchanged |
| Crypto | Web Crypto API | Unchanged |
| Unit tests | Vitest | Unchanged |
| e2e tests | Playwright | Unchanged |
| Lint/format | Biome | Unchanged |
| Package versioning | Changesets | Unchanged (`@sepalo/core` only) |
| CI | GitHub Actions | Unchanged |
| Hosting | Vercel | Unchanged |

### SSR + Privacy Principle (non-negotiable invariant)

**Public pages** use React Server Components → SSR/SSG → optimal SEO:

- `/` (home)
- `/guida`
- `/sicurezza`
- `/about`

**Tool pages** use `'use client'` → 100% client-side → payment data never touches the server:

- `/genera`
- `/profilo`
- `/rubrica`
- `/impostazioni`

Next.js API Routes are used only for sitemap and robots (static pages). No API route ever receives payment data.

---

## CBI XML Spec Corrections (spec.md section 4)

Before implementing the XML builder, apply these corrections:

### 1. `DbtrAgt` — add `ClrSysId/Cd = ITNCC`

Current spec (incomplete):
```
PmtInf/DbtrAgt/FinInstnId/ClrSysMmbId/MmbId → ABI code
```

Correct XML structure:
```xml
<DbtrAgt>
  <FinInstnId>
    <ClrSysMmbId>
      <ClrSysId>
        <Cd>ITNCC</Cd>
      </ClrSysId>
      <MmbId>02008</MmbId>
    </ClrSysMmbId>
  </FinInstnId>
</DbtrAgt>
```

### 2. `ReqdExctnDt` — mandatory `<Dt>` sub-element

CBIBdyPaymentRequest.00.04.01 is based on pain.001.001.09 where `ReqdExctnDt` is a `DateAndDateTime2Choice`. The value is not inline but in a sub-element:

```xml
<ReqdExctnDt>
  <Dt>2024-12-15</Dt>
</ReqdExctnDt>
```

Not `<ReqdExctnDt>2024-12-15</ReqdExctnDt>` (that is the pain.001.001.03 format).

### 3. `CdtrAgt` — three cases, not two

| Beneficiary IBAN type | Behaviour |
|---|---|
| Italian IBAN (`IT`) | `CdtrAgt` absent from XML |
| Non-IT SEPA IBAN (DE, FR, ES, BE, …) | BIC recommended, `NOTPROVIDED` accepted |
| Extra-SEPA IBAN | BIC mandatory |

"Foreign IBAN" in the spec is ambiguous. Use this table as the reference in the builder.

### 4. Root element — verify from official XSD

The spec does not specify whether the root element is `CBIBdyPaymentRequest` or `Document`. Verify by opening `CBIBdyPaymentRequest.00.04.01.xsd` when downloading it (Task 1.6). The namespace `urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01` is correct.

---

## Milestones & Tasks

---

### M0 — Setup (v0.0.1 → v0.0.4)

#### Task 0.1 — Init monorepo
**Branch:** `chore/init-monorepo` → **Tag:** `v0.0.1`

- [ ] Directory structure: `packages/core/`, `packages/web/`, `docs/`
- [ ] `pnpm-workspace.yaml` with both packages
- [ ] Root `package.json` with top-level scripts (`lint`, `typecheck`, `test`, `build`)
- [ ] Shared `tsconfig.base.json` (strict, paths)
- [ ] `biome.json` with strict rules, organize imports
- [ ] `.gitignore` (node_modules, .next, dist, coverage, .env)
- [ ] `LICENSE` (MIT)
- [ ] `README.md` with placeholder (logo, tagline, links)
- [ ] `CONTRIBUTING.md` (local setup, commit conventions)
- [ ] `CODE_OF_CONDUCT.md` (Contributor Covenant)
- [ ] `@changesets/cli` configured

**Done when:** `pnpm install` succeeds, biome finds no errors on empty files.

---

#### Task 0.2 — Base CI
**Branch:** `chore/ci-setup` → **Tag:** `v0.0.2`

- [ ] `.github/workflows/ci.yml`: trigger on PR + push to `main`
  - Steps: checkout → setup pnpm → cache → install → lint → typecheck → test → build
  - Placeholder test that passes (1 trivial test per package)
- [ ] `.github/workflows/e2e.yml`: placeholder with explicit skip (enabled: false)
- [ ] `.github/workflows/release.yml`: Changesets flow (version → auto PR → publish on merge)
- [ ] `@changesets/cli` configured for `@sepalo/core` (basePath: packages/core)
- [ ] `.changeset/config.json` with `access: public`

**Done when:** CI is green on GitHub for a test PR.

---

#### Task 0.3 — Next.js 15 app shell
**Branch:** `chore/nextjs-setup` → **Tag:** `v0.0.3`

- [ ] `packages/web`: `create-next-app` with App Router + TypeScript + Tailwind
- [ ] Tailwind CSS v4 configured
- [ ] shadcn/ui init (`components.json`, path: `src/components/ui`)
- [ ] `next/font` with Inter (UI) + JetBrains Mono (code/XML)
- [ ] App Router routing structure:
  ```
  app/
  ├── (public)/          ← server components, SSR/SSG
  │   ├── layout.tsx
  │   ├── page.tsx       (home placeholder)
  │   ├── guida/
  │   ├── sicurezza/
  │   └── about/
  ├── (tool)/            ← client components, 'use client'
  │   ├── layout.tsx     (includes PinGuard)
  │   ├── genera/
  │   ├── profilo/
  │   ├── rubrica/
  │   └── impostazioni/
  ├── layout.tsx         (root layout)
  ├── sitemap.ts
  ├── robots.ts
  └── not-found.tsx
  ```
- [ ] Header (server component): logo + nav links (mobile: hamburger)
- [ ] Footer (server component): copyright, GitHub, license, version
- [ ] `vercel.json` with security headers:
  ```json
  Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' [rybbit-domain]; ...
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```
- [ ] `packages/web/package.json` with `@sepalo/core` alias → `../../packages/core`

**Done when:** `pnpm dev` shows home placeholder. `pnpm build` produces output without errors.

---

#### Task 0.4 — Vercel preview deploy
**Branch:** `chore/vercel-deploy` → **Tag:** `v0.0.4`

- [ ] Vercel project linked to GitHub repo
- [ ] Environment variable `NEXT_PUBLIC_APP_VERSION` = `0.0.4`
- [ ] Preview URL active for every PR
- [ ] Deploy `sepalo.it` with home placeholder (domain purchased and configured)
- [ ] HTTPS + www redirect configured

**Done when:** `sepalo.it` loads the home placeholder. Lighthouse SEO score ≥ 90 on home (even as a placeholder).

---

### M1 — Core: types, validators, XML builder (v0.1.0)

#### Task 1.1 — Types and Zod schemas
**Branch:** `feat/core-types`

- [ ] `packages/core/src/types/index.ts`:
  ```ts
  PartyIdentifier (CUC | CF)
  Initiator { name, identifier, iban, abi }
  Beneficiary { name, iban, bic? }
  Transaction { id?, endToEndId?, amount, beneficiary, remittanceInfo }
  PaymentBatch { initiator, executionDate, batchBooking, transactions }
  ValidationResult { valid, errors, warnings }
  ValidationError { path, code, message, rowNumber? }
  ValidationWarning { path, code, message, rowNumber? }
  ```
- [ ] `packages/core/src/schemas/payment.ts`: Zod schemas with `z.infer` (no hand-duplicated types)
- [ ] `packages/core/src/index.ts`: barrel file (exports types and public API only)
- [ ] `packages/core/package.json`: `name: @sepalo/core`, `version: 0.0.1`, exports field
- [ ] Unit tests: schema accepts valid batch, rejects invalid with specific message (≥5 cases per type)

**Done when:** `pnpm --filter @sepalo/core test` is green. No explicit `any`.

---

#### Task 1.2 — IBAN validator
**Branch:** `feat/core-validator-iban`

- [ ] `validators/iban.ts`:
  ```ts
  validateIban(iban: string): { valid: boolean; country: string; isSepa: boolean; isItalian: boolean }
  ```
  - mod-97 algorithm (rearrange + numeric conversion + modulo)
  - For Italian IBANs (IT): also verify CIN (check character at position 5)
  - SEPA country lookup (static list in file, updatable)
- [ ] Tests: ≥10 valid IBANs (IT, DE, FR, ES, SM, GB, US extra-SEPA), ≥10 invalid (bad checksum, wrong length, invalid chars, wrong CIN for IT IBAN)

**Done when:** 100% coverage of file, all tests green.

---

#### Task 1.3 — ABI validator + lookup table
**Branch:** `feat/core-validator-abi`

- [ ] `data/abi-list.json`: list of active Italian bank ABI codes
  - Source: Banca d'Italia — Infostat portal (`infostat.bancaditalia.it`), registers section, Excel export → manual JSON conversion
  - Format: `{ "02008": "UniCredit S.p.A.", "03069": "Intesa Sanpaolo S.p.A.", ... }`
  - Active banks only (not cancelled)
  - Note in core README: "ABI list sourced from Banca d'Italia Infostat register. Update quarterly."
  - Update process documented in `docs/UPDATE_ABI_LIST.md`
- [ ] `validators/abi.ts`:
    ```ts
    validateAbi(abi: string): boolean  // 5 digits + presence in lookup
    getAbiName(abi: string): string | undefined
    ```
- [ ] `utils/iban-to-abi.ts`:
    ```ts
    extractAbiFromIban(iban: string): string | null  // positions 6-10 if IT IBAN
    ```
- [ ] Tests: valid ABI present in list, ABI fewer than 5 digits, ABI not in list, extraction from valid/invalid IT IBAN

**Done when:** package builds successfully with `abi-list.json` bundled.

---

#### Task 1.4 — CUC, CF/PIVA, SEPA charset, totals validators
**Branch:** `feat/core-validators-misc`

- [ ] `validators/cuc.ts`: 8 alphanumeric characters `[A-Z0-9]{8}`
- [ ] `validators/fiscal-code.ts`:
  - CF: 16 characters, check algorithm (final control character)
  - P.IVA: 11 digits, check algorithm (final control digit)
  - Accepts both (CF/PIVA are both valid as `Issr=CF`)
- [ ] `validators/sepa-charset.ts`:
  ```ts
  sanitize(text: string): { sanitized: string; replaced: Array<{position: number; original: string; replacement: string}> }
  isSepaCompliant(text: string): boolean
  ```
  - Charset: `a-z A-Z 0-9 / - ? : ( ) . , ' + space`
  - Accent substitution: à→a, è→e, é→e, ì→i, ò→o, ù→u, ç→c, ñ→n, etc.
  - Unmappable characters: replaced with space + warning
- [ ] `validators/totals.ts`:
  ```ts
  validateTotals(batch: PaymentBatch): ValidationError[]
  // GrpHdr/NbOfTxs == count(transactions)
  // GrpHdr/CtrlSum == sum(amounts) rounded to 2 decimal places
  ```
- [ ] `validators/index.ts`:
  ```ts
  validatePayment(batch: PaymentBatch): ValidationResult
  ```
  Orchestrator: calls all validators, aggregates errors and warnings
- [ ] Tests: ≥5 positive + ≥5 negative for each

**Done when:** `validatePayment` covered at ≥90% coverage.

---

#### Task 1.5 — XML builder
**Branch:** `feat/core-xml-builder`

- [ ] `utils/id-generator.ts`: generates unique IDs in format `{PREFIX}{YYYYMMDDHHmmss}{random6alphanum}`
- [ ] `utils/sanitize.ts`: applies `sanitize()` from sepa-charset to text fields (Nm, RmtInf/Ustrd)
- [ ] `builders/group-header.ts`: builds GrpHdr object for fast-xml-parser
- [ ] `builders/payment-info.ts`: builds PmtInf object. `ReqdExctnDt` → `{ Dt: "YYYY-MM-DD" }` (sub-element)
- [ ] `builders/transaction.ts`:
  - `CdtrAgt` present only if beneficiary IBAN is not IT/SM
  - If non-IT SEPA IBAN: use BIC if provided, otherwise `{ BICFI: "NOTPROVIDED" }`
  - If extra-SEPA IBAN: BIC mandatory (validation error if missing)
  - `DbtrAgt` with full structure `ClrSysId/Cd=ITNCC` + `MmbId=ABI`
- [ ] `builders/document.ts`:
  ```ts
  buildXml(batch: PaymentBatch): string
  ```
  - Output with `<?xml version="1.0" encoding="UTF-8"?>`
  - Namespace `urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01`
  - Root element verified against XSD (presumably `CBIBdyPaymentRequest`)
  - Generated with fast-xml-parser (never string concatenation)
- [ ] `tests/fixtures/input/`: 5 PaymentBatch JSON files
  - `01-single-tx.json`: 1 transaction, IT IBAN
  - `02-multi-tx.json`: 10 transactions, mixed IT IBAN
  - `03-foreign-iban.json`: DE IBAN, with BIC
  - `04-large-amounts.json`: amounts at limit (999999999.99)
  - `05-special-chars.json`: remittance info with accents and special characters
- [ ] `tests/fixtures/expected/`: corresponding golden XML files
- [ ] `tests/integration/pipeline.test.ts`: PaymentBatch → buildXml → byte-for-byte match with golden files

**Done when:** all 5 golden files match. `pnpm --filter @sepalo/core test` 100% green.

---

#### Task 1.6 — XSD validation + public API
**Branch:** `feat/core-xsd-validation` → **Tag:** `v0.1.0`

- [ ] Download `CBIBdyPaymentRequest.00.04.01.xsd` from `cbiservice.com` and commit to `data/xsd/`
- [ ] Verify and fix the root element in the builder (Task 1.5) by comparing against XSD
- [ ] Verify that `ReqdExctnDt/Dt` is correct per XSD
- [ ] `validators/xsd.ts`:
  ```ts
  validateAgainstXsd(xml: string): Promise<ValidationResult>
  ```
  - Lazy-load xmllint-wasm (only on first use, ~500KB WASM)
  - Errors with XPath path and human-readable description
- [ ] `index.ts` barrel: exports public API
  ```ts
  export { validatePayment, buildXml, validateAgainstXsd, generatePaymentFile }
  export type { PaymentBatch, Transaction, Initiator, Beneficiary, ValidationResult, ... }
  ```
- [ ] `generatePaymentFile(batch: PaymentBatch): Promise<{ xml: string; errors: ValidationError[]; warnings: ValidationWarning[] }>`
  Orchestrator: `validatePayment` → if critical errors, stop → `buildXml` → `validateAgainstXsd`
- [ ] Integration test: all 5 fixtures pass XSD validation. Negative test: payload with missing mandatory field → error with XPath
- [ ] Changeset for `@sepalo/core` version `0.1.0`

**Done when:** `generatePaymentFile` produces valid XML for all golden files. XSD validation green.

---

### M2 — Web: foundation + auth (v0.2.0)

#### Task 2.1 — Design system and layout
**Branch:** `feat/web-layout`

- [ ] Colour palette configured in Tailwind: primary `#1B2A56`, accent `#2E7D5B`, neutral greys
- [ ] shadcn/ui components installed: Button, Input, Card, Dialog, Table, Badge, Tooltip, Sheet (for mobile nav)
- [ ] `app/(public)/layout.tsx`: header server component with logo + desktop nav + mobile hamburger
- [ ] `app/(tool)/layout.tsx`: simplified header + PinGuard wrapper (client)
- [ ] `app/not-found.tsx`: custom 404 page
- [ ] `app/error.tsx`: error boundary with user-friendly message
- [ ] Placeholder page for every route (returns `<h1>page name</h1>`)

**Done when:** navigation between all routes works. No hydration errors in console.

---

#### Task 2.2 — Crypto and storage layer
**Branch:** `feat/web-crypto-storage`

- [ ] `lib/crypto.ts`:
  ```ts
  deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey>
  // PBKDF2: SHA-256, 200,000 iterations, 16-byte salt
  encrypt(data: string, key: CryptoKey): Promise<EncryptedBlob>
  // AES-GCM: 12-byte random IV, output: { iv, ciphertext } base64
  decrypt(blob: EncryptedBlob, key: CryptoKey): Promise<string>
  generateSalt(): Uint8Array
  ```
- [ ] `lib/storage.ts`:
  - Wrapper over `idb-keyval` with namespace `@sepalo/v1/`
  - `secureGet<T>(key, cryptoKey): Promise<T | null>`
  - `secureSet<T>(key, value, cryptoKey): Promise<void>`
  - `secureDelete(key): Promise<void>`
  - `clearAll(): Promise<void>`
- [ ] `stores/auth.ts` (Zustand, no persist):
  ```ts
  { cryptoKey: CryptoKey | null; setKey(key): void; clearKey(): void }
  ```
- [ ] Unit tests: round-trip encrypt → decrypt, wrong key → `DOMException` error, different salts → different ciphertexts

**Done when:** unit tests green. No sensitive data ends up in localStorage or sessionStorage (verified manually).

---

#### Task 2.3 — PIN flow
**Branch:** `feat/web-pin-flow`

- [ ] `components/auth/PinPad.tsx`: 10-key numeric pad + delete. 6-dot visual input. Also accepts physical keyboard input
- [ ] `components/auth/PinSetup.tsx`: enter PIN (6 digits) → confirm → derive key → save salt in IndexedDB (unencrypted)
- [ ] `components/auth/PinPrompt.tsx`:
  - Session unlock: enter PIN → `deriveKey` → attempt decrypt of a known payload
  - Error counter: progressive cooldown 1s → 5s → 30s → 5min → 1h
  - "Forgot PIN" button → redirect to device reset
- [ ] `components/auth/PinGuard.tsx`: checks `stores/auth.cryptoKey`. If null → show PinPrompt. If present → show children
- [ ] `stores/auth.ts` updated: adds `failedAttempts`, `lockedUntil`

**Done when:** full flow tested manually (setup → close browser → reopen → PIN prompt → unlock). Cooldown visible and working.

---

#### Task 2.4 — Initiator profile
**Branch:** `feat/web-profile` → **Tag:** `v0.2.0`

- [ ] `stores/profile.ts` (Zustand): `Initiator | null`. Encrypted persistence via `lib/storage.ts`
- [ ] `components/profile/ProfileForm.tsx`:
  - React Hook Form + Zod schema from `@sepalo/core`
  - Initiator IBAN field: auto-derives ABI with `extractAbiFromIban` + shows bank name from `getAbiName`
  - Identifier: CUC / CF radio with conditional input
  - Real-time validation on blur
- [ ] `components/profile/ProfileSummary.tsx`: read-only card with initiator data + "Edit" button
- [ ] `app/(tool)/profilo/page.tsx`: shows ProfileSummary if profile present, otherwise ProfileForm
- [ ] 4-step onboarding modal (first time, before `/genera`):
  - Step 1: personal data (name, CF/PIVA or CUC)
  - Step 2: bank data (IBAN → ABI auto-derived)
  - Step 3: PinSetup
  - Step 4: summary + CTA "Start generating"
- [ ] Onboarding gate: if profile absent, redirect to onboarding modal

**Done when:** onboarding completable in <2 minutes. Page reload after onboarding → profile still present (after PIN).

---

### M3 — Web: generation flow (v0.3.0)

#### Task 3.1 — CSV/XLSX parsers
**Branch:** `feat/web-parsers`

- [ ] `lib/parsers/csv.ts`: PapaParse with auto-detect separator (`,` `;` `\t`). Detects non-UTF-8 encoding and converts with warning
- [ ] `lib/parsers/xlsx.ts`: SheetJS, supports XLSX and legacy XLS
- [ ] `lib/parsers/normalize.ts`: maps file columns (case-insensitive, synonyms) → normalised rows with original row number for error reporting
  - Synonyms: `beneficiario | nome | name | creditor`, `iban | iban_beneficiario`, `importo | amount | eur`, `causale | descrizione | remittance`, `riferimento | endtoend | id`, `bic | swift`
- [ ] `lib/parsers/index.ts`: `parseSpreadsheet(file: File): Promise<{ rows: NormalizedRow[]; meta: ParseMeta }>`
- [ ] Unit tests: CSV comma, CSV semicolon, XLSX, legacy XLS, latin-1 encoding, out-of-order headers, empty rows in between, extra columns ignored

**Done when:** parser produces identical output for CSV and XLSX with the same data. Empty rows silently ignored.

---

#### Task 3.2 — Upload flow
**Branch:** `feat/web-upload`

- [ ] `components/upload/FileDropzone.tsx`: drag-and-drop area. Accepts `.csv`, `.xlsx`, `.xls`. Limit 5MB / 5,000 rows. Visual feedback during drag
- [ ] `components/upload/FilePreview.tsx`: table of first 5 parsed rows + total row counter + any encoding warnings
- [ ] `components/upload/ColumnMapper.tsx`: UI to manually map unrecognised columns. Dropdown per file column → target field. Saves mapping in IndexedDB (preference for files with same structure)
- [ ] Upload error handling: file too large → toast with message, unsupported format → inline feedback

**Done when:** drag-and-drop works on Chromium, Firefox, WebKit. File preview appears in <1s for a 100-row file.

---

#### Task 3.3 — Transaction review
**Branch:** `feat/web-review`

- [ ] `components/review/TransactionTable.tsx`:
  - Columns: row # | beneficiary | IBAN | amount | remittance info | status
  - Error cell: red border + tooltip with message
  - Inline editing: click on cell → editable input → on blur → re-validation
  - Pagination or virtual scroll for lists >100 rows
- [ ] `components/review/ValidationSummary.tsx`: top banner with error/warning counter. Clickable error list → scrolls to row
- [ ] `components/review/BatchControls.tsx`:
  - Date picker: execution date (default: next business day). Validation: no weekends, no main Italian holidays, ≥ today, ≤ 60 days
  - Toggle: batch booking (`BtchBookg=true`) vs individual (`false`) with inline explanation
  - Totals: transaction count, total amount €

**Done when:** table with 100 rows stays responsive. Inline errors appear without noticeable latency.

---

#### Task 3.4 — Generation and download
**Branch:** `feat/web-generation` → **Tag:** `v0.3.0`

- [ ] `components/result/XmlPreview.tsx`: first 50 XML lines in JetBrains Mono, font-size 12px. "Copy all" button (clipboard API)
- [ ] `components/result/DownloadButton.tsx`: XML Blob → `URL.createObjectURL` → link click. File name: `CBI_{YYYYMMDD}_{n}tx.xml`
- [ ] `components/result/GenerationSummary.tsx`: transaction count, total amount, SHA-256 hash of file (Web Crypto `digest`)
- [ ] `app/(tool)/genera/page.tsx`: flow state machine:
  1. `idle` → FileDropzone
  2. `parsing` → spinner
  3. `mapping` → ColumnMapper (only if headers unrecognised)
  4. `review` → TransactionTable + BatchControls + CTA "Generate XML"
  5. `generating` → loader (xmllint-wasm lazy-load may take 1-2s on first use)
  6. `success` → XmlPreview + DownloadButton + GenerationSummary
  7. `error` → ValidationSummary with clickable XSD errors
- [ ] Potential duplicate payment warning: same (IBAN + amount) pair → yellow inline warning
- [ ] Analytics: `trackEvent('file_generated', { tx_count: n.toString() })` (no sensitive payload)

**Done when:** full end-to-end flow working. Downloaded XML passes validation on the CBI online validator.

---

### M4 — Web: address book and settings (v0.4.0)

#### Task 4.1 — Address book
**Branch:** `feat/web-address-book`

- [ ] `stores/address-book.ts` (Zustand + encrypted persist): `Beneficiary[]` with local `id`
- [ ] `components/address-book/BeneficiaryList.tsx`: list with search by name/IBAN, edit, delete with confirmation
- [ ] `components/address-book/BeneficiaryForm.tsx`: add/edit (name, IBAN, optional BIC, free notes). Real-time IBAN validation
- [ ] `app/(tool)/rubrica/page.tsx`: full management
- [ ] Integration with TransactionTable: "beneficiary" field → combobox with address book autocomplete. Selecting a contact pre-fills IBAN and BIC

**Done when:** add 10 beneficiaries, reload, find them all (after PIN). Autocomplete in table works.

---

#### Task 4.2 — Settings
**Branch:** `feat/web-settings` → **Tag:** `v0.4.0`

- [ ] `app/(tool)/impostazioni/page.tsx` with three sections:
  - **Change PIN**: current PIN → new PIN (6 digits) → confirm. Re-encrypts all IndexedDB data with the new key
  - **Strong passphrase** (opt-in): upgrades PIN to passphrase (min 12 chars). Toggle with explanation "when to use it". Same cryptographic mechanism, drastically larger key space
  - **Reset device**: red button. Modal with double confirmation ("Type RESET to confirm"). Clears IndexedDB → redirect to onboarding
- [ ] Info section: app version (`NEXT_PUBLIC_APP_VERSION`), GitHub link, MIT license

**Done when:** PIN change works (old PIN no longer unlocks after change). Reset clears everything and shows onboarding.

---

### M5 — SEO, public content, analytics (v0.5.0)

#### Task 5.1 — Landing page (SSR)
**Branch:** `feat/web-home`

- [ ] `app/(public)/page.tsx`: server component (SSR)
- [ ] Hero: H1 "Mass payments, no hassle", tagline, primary CTA + secondary CTA "See how it works"
- [ ] "How it works" section: 3 illustrated steps (upload CSV → generate XML → upload to bank)
- [ ] "Why Sepalo" section: 3 cards (privacy by design, MIT open source, zero account)
- [ ] "Who it's for" section: target users (SMEs, firms, associations)
- [ ] Social proof placeholder (update post-launch)
- [ ] Footer with GitHub link, license, version, `/sicurezza` link
- [ ] `generateMetadata()`: title "Sepalo — Generate CBI/SEPA files free, in your browser", description, og:image, canonical

**Done when:** Lighthouse SEO 100. Core Web Vitals green on Vercel Analytics. No accessibility errors on axe.

---

#### Task 5.2 — Content pages (SSR)
**Branch:** `feat/web-content-pages`

- [ ] `app/(public)/guida/page.tsx`: user documentation
  - Input CSV format with column table and synonyms
  - Template download (links to `/template.csv` and `/template.xlsx`)
  - FAQ: "Does my bank accept the file?", "Can I do foreign transfers?", "What if I forget my PIN?", "Is my data safe?", "How do I do non-Italian SEPA transfers?"
  - Flow screenshots (static images in `/public/screenshots/`)
- [ ] `app/(public)/sicurezza/page.tsx`: readable threat model
  - What is encrypted (everything persisted in IndexedDB)
  - What is NOT encrypted (downloaded XML files, static browser cache)
  - PIN length limitations communicated honestly (brute force ~30 min with physical access)
  - When to enable the strong passphrase
  - Architectural guarantees (no HTTP calls to application servers)
- [ ] `app/(public)/about/page.tsx`: mission, open source (GitHub link), MIT license, how to contribute

**Done when:** all pages server-side rendered (verify with `curl` → full HTML without JS). No placeholder text remaining.

---

#### Task 5.3 — Technical SEO and sitemap
**Branch:** `feat/web-seo`

- [ ] `app/sitemap.ts`: Next.js Sitemap API
  ```ts
  // Include: /, /guida, /sicurezza, /about
  // Exclude: /genera, /profilo, /rubrica, /impostazioni (tool pages, no SEO value)
  // changeFrequency: 'weekly' for home, 'monthly' for others
  ```
- [ ] `app/robots.ts`:
  ```
  User-agent: *
  Allow: /
  Disallow: /genera
  Disallow: /profilo
  Disallow: /rubrica
  Disallow: /impostazioni
  Sitemap: https://sepalo.it/sitemap.xml
  ```
- [ ] `public/og-image.png`: 1200×630, consistent with brand design
- [ ] `public/favicon.svg` + `favicon.ico` + PNG icons 192/512
- [ ] JSON-LD on home: `WebApplication` schema with `name`, `url`, `applicationCategory`, `operatingSystem: "Web Browser"`, `offers: { price: "0" }`
- [ ] Canonical URL on every public page
- [ ] Verification with Google Search Console (submit sitemap)

**Done when:** `https://sepalo.it/sitemap.xml` accessible and valid. Structured data validated with Google Rich Results Test.

---

#### Task 5.4 — Rybbit analytics
**Branch:** `feat/web-analytics` → **Tag:** `v0.5.0`

- [ ] Rybbit project setup (cloud or self-hosted)
- [ ] `lib/analytics.ts` (client-side only):
  ```ts
  trackEvent(name: EventName, props?: Record<string, string>): void
  // EventName: 'file_generated' | 'validation_error' | 'csv_upload' | 'xlsx_upload' | 'pin_reset' | 'address_book_add'
  // Props: anonymous metadata only (e.g. tx_count, error_code). NEVER IBANs, amounts, names.
  ```
- [ ] Rybbit snippet integrated in `app/layout.tsx` (client-side only, `next/script` with `strategy="afterInteractive"`)
- [ ] CSP updated in `vercel.json` with Rybbit domain in `script-src` and `connect-src`
- [ ] No cookie banner needed (Rybbit is cookie-free by default)

**Done when:** `file_generated` event visible in Rybbit dashboard after an end-to-end test. No sensitive data in event payloads (verified manually in network inspector).

---

### M6 — PWA and templates (v0.6.0)

#### Task 6.1 — PWA
**Branch:** `feat/web-pwa`

- [ ] `public/manifest.webmanifest`: `name`, `short_name: "Sepalo"`, `icons` (192 + 512), `theme_color: "#1B2A56"`, `display: "standalone"`, `start_url: "/genera"`
- [ ] Service worker (next-pwa or custom `public/sw.js`):
  - Cache-first: static assets (JS, CSS, fonts, images)
  - Network-first: HTML pages
  - Offline fallback: `/offline` page with message "You are offline. XML generation is available, but some resources may not be up to date."
- [ ] `app/(public)/offline/page.tsx`: offline page
- [ ] Test: disable network in DevTools → app remains usable for XML generation

**Done when:** Lighthouse PWA check green. App installable from Chrome/Edge. Works offline after first load.

---

#### Task 6.2 — Downloadable templates
**Branch:** `feat/web-templates` → **Tag:** `v0.6.0`

- [ ] `public/template.csv`: header + 3 realistic example rows (fictitious names, valid generated IBANs)
- [ ] `public/template.xlsx`: same content in Excel format with formatted columns
- [ ] Download links visible in `/genera` (before dropzone) and in `/guida`
- [ ] The CSV template is the same one used in parser test fixtures

**Done when:** download works. The downloaded CSV file is parsable without errors by the app itself.

---

### M7 — Full test suite (v0.7.0)

#### Task 7.1 — e2e happy path
**Branch:** `test/e2e-happy-path`

- [ ] `playwright.config.ts`: Chromium + Firefox + WebKit. `baseURL` from `PLAYWRIGHT_BASE_URL` env. Screenshot and trace on failure
- [ ] `e2e/fixtures/`: `sample.csv` (10 valid rows), `sample.xlsx` (same content)
- [ ] `e2e/happy-path.spec.ts`:
  1. Land on home → CTA → onboarding (4 steps including PIN)
  2. Upload `sample.csv`
  3. Review: verify row count, total, no errors
  4. Select execution date (tomorrow)
  5. Click "Generate XML" → download
  6. Verify downloaded file: correct name, size > 0
  7. Verify summary: transaction count = 10

**Done when:** test green on all 3 browsers in CI.

---

#### Task 7.2 — e2e PIN flow and persistence
**Branch:** `test/e2e-pin-persistence`

- [ ] `e2e/pin-flow.spec.ts`:
  - Set up PIN → close tab → reopen → PIN prompt visible → wrong PIN 3 times → cooldown visible → correct PIN → access
- [ ] `e2e/persistence.spec.ts`:
  - Complete onboarding → reload page → PIN prompt → unlock → profile still present
- [ ] `e2e/reset-device.spec.ts`:
  - Settings → Reset device → confirm → fresh onboarding

**Done when:** green on Chromium. (Some IndexedDB features may behave differently on WebKit: document if needed.)

---

#### Task 7.3 — e2e validation errors and edge cases
**Branch:** `test/e2e-validation`

- [ ] `e2e/fixtures/invalid.csv`: CSV with 2 invalid IBANs, 1 remittance >140 chars, 1 negative amount
- [ ] `e2e/validation-errors.spec.ts`:
  - Upload `invalid.csv` → errors highlighted on correct rows → click error → focus on row → fix inline → error disappears → generate OK
- [ ] `e2e/edge-cases.spec.ts`:
  - File >5MB → warning
  - CSV with `;` separator → parsed correctly
  - Remittance info with accents (è, à, ù) → sanitised + warning

**Done when:** green on Chromium + Firefox.

---

#### Task 7.4 — Full CI e2e workflow
**Branch:** `chore/ci-e2e-workflow` → **Tag:** `v0.7.0`

- [ ] `.github/workflows/e2e.yml` complete:
  - Setup + install → Playwright browsers cache → build web → run e2e
  - Upload trace + screenshot on failure (`actions/upload-artifact`)
- [ ] Separate CI (unit + integration) from e2e to parallelise on GitHub Actions
- [ ] Matrix: Chromium + Firefox + WebKit as separate jobs or with Playwright shard

**Done when:** CI e2e green in <5 minutes on GitHub Actions.

---

### M8 — Hardening and beta launch (v1.0.0-beta.1)

#### Task 8.1 — Final security hardening
**Branch:** `chore/security-hardening`

- [ ] `pnpm audit` — zero high/critical vulnerabilities
- [ ] Final CSP revisited: complete header tested with [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [ ] SRI on any remaining external assets
- [ ] Dependabot enabled (`.github/dependabot.yml`): npm + GitHub Actions
- [ ] Security.md with disclosure policy (responsible vulnerability report)

---

#### Task 8.2 — Publish @sepalo/core to npm
**Branch:** `chore/npm-publish-setup`

- [ ] `packages/core/package.json`: `version: 0.1.0`, `exports`, `types`, `repository`, `keywords`, `engines`
- [ ] `packages/core/.npmignore`: exclude `src/`, `tests/`, `tsconfig.json`. Include only `dist/` and `data/`
- [ ] Changeset created and approved for `0.1.0`
- [ ] GitHub Actions `release.yml` tested on a test branch
- [ ] Publish to npm: `pnpm changeset publish`
- [ ] `@sepalo/core` README with usage examples, API reference, changelog

---

#### Task 8.3 — Open source launch
**Branch:** `chore/oss-launch` → **Tag:** `v1.0.0-beta.1`

- [ ] Repository public on GitHub
- [ ] `.github/ISSUE_TEMPLATE/bug.yml`, `feature.yml`, `cbi-validation.yml`
- [ ] `.github/pull_request_template.md`: checklist (tests? docs? changeset? golden files updated?)
- [ ] `docs/adr/001-nextjs-over-vite.md`: ADR on choosing Next.js for SSR
- [ ] `docs/adr/002-client-only-tool.md`: ADR on client-only architectural choice for the tool
- [ ] GitHub Discussions enabled
- [ ] GitHub Projects: public roadmap with M8 → `1.0.0` as next milestone
- [ ] Beta communication: README updated with `beta` badge, note "currently in public beta"

**Done when:** `sepalo.it` loads the full beta version. `@sepalo/core@0.1.0` available on npm. Repository public.

---

## Milestone → Version Summary

| Milestone | Version | What it includes |
|---|---|---|
| M0 Setup | `v0.0.1` → `v0.0.4` | Monorepo, CI, Next.js, Vercel |
| M1 Core | `v0.1.0` | Complete `@sepalo/core` with XSD validation |
| M2 Auth | `v0.2.0` | PIN, crypto, initiator profile |
| M3 Generate | `v0.3.0` | Parsers, upload, review, generation |
| M4 Extras | `v0.4.0` | Address book, settings |
| M5 SEO | `v0.5.0` | SSR landing, content, sitemap, Rybbit |
| M6 PWA | `v0.6.0` | Offline, templates |
| M7 Tests | `v0.7.0` | Full e2e suite |
| M8 Launch | `v1.0.0-beta.1` | Hardening, npm publish, open source |

---

## Operational Notes

### Design file
The Sepalo.html design file link in the spec (`api.anthropic.com/v1/design/...`) returns 404 via HTTP fetch — it is a Claude.ai artefact that requires an authenticated browser session. To use it: open the link in a browser with an active Claude.ai session, extract the HTML/CSS, and commit to `docs/design/Sepalo.html`.

### ABI list — update process
1. Go to `infostat.bancaditalia.it` → Registers → Banks
2. Export all banks with status "Active" to Excel
3. Convert to JSON: `{ "NNNNN": "Bank Name S.p.A." }`
4. Replace `packages/core/src/data/abi-list.json`
5. Create a `patch` changeset for `@sepalo/core`
6. PR with title `chore(core): update abi list YYYY-MM`

Frequency: quarterly or on notable mergers/acquisitions.

### Stray lines in spec
Remove lines 197-198 from `spec.md` before committing it as `docs/PROJECT.md`:
```
Fetch this design file, read its readme, and implement the relevant aspects of the design. [URL]
Implement: Sepalo.html
```
