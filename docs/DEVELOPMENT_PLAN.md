# Sepalo — Development Plan

> Living document. Updated after each completed milestone.
>
> **Current state:** `main` is at post-`v0.3.0` (PR #18 merged, untagged).
> M0–M3 core complete. Address book (M4 Task 4.1) shipped early as part of M2. M4 Task 4.2, M5–M8 pending.

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

### 1. `DbtrAgt` — `MmbId` only (no `ClrSysId`)

The official `CBIPaymentRequest.00.04.01.xsd` does not include `ClrSysId` inside `ClrSysMmbId` for this profile. Only `MmbId` (ABI code) is required.

Correct XML structure:
```xml
<pmrq:DbtrAgt>
  <pmrq:FinInstnId>
    <pmrq:ClrSysMmbId>
      <pmrq:MmbId>02008</pmrq:MmbId>
    </pmrq:ClrSysMmbId>
  </pmrq:FinInstnId>
</pmrq:DbtrAgt>
```

### 2. `ReqdExctnDt` — mandatory `<Dt>` sub-element

CBIBdyPaymentRequest.00.04.01 is based on pain.001.001.09 where `ReqdExctnDt` is a `DateAndDateTime2Choice`. The value is not inline but in a sub-element:

```xml
<pmrq:ReqdExctnDt>
  <pmrq:Dt>2024-12-15</pmrq:Dt>
</pmrq:ReqdExctnDt>
```

Not `<ReqdExctnDt>2024-12-15</ReqdExctnDt>` (that is the pain.001.001.03 format).

### 3. `CdtrAgt` — three cases, not two

| Beneficiary IBAN type | Behaviour |
|---|---|
| Italian IBAN (`IT`) | `CdtrAgt` absent from XML |
| Non-IT SEPA IBAN (DE, FR, ES, BE, …) | BIC recommended, `NOTPROVIDED` accepted |
| Extra-SEPA IBAN | BIC mandatory |

"Foreign IBAN" in the spec is ambiguous. Use this table as the reference in the builder.

### 4. Dual-namespace structure

The CBI XML uses two namespaces:
- Outer envelope (`CBIBdyPaymentRequest`, `CBIEnvelPaymentRequest`, `CBIPaymentRequest`) → `urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01` (default namespace, no prefix)
- All payment content (`GrpHdr`, `PmtInf` and all descendants) → `urn:CBI:xsd:CBIPaymentRequest.00.04.01` with `pmrq:` prefix

### 5. `InitgPty` identifier — use `Issr`, not `SchmeNm/Cd`

The CBI profile uses `Issr` to hold the scheme code (e.g. `CUC`):
```xml
<pmrq:Othr>
  <pmrq:Id>ABC12345</pmrq:Id>
  <pmrq:Issr>CUC</pmrq:Issr>
</pmrq:Othr>
```

### 6. `PmtTpInf` — correct structure

```xml
<pmrq:PmtTpInf>
  <pmrq:InstrPrty>NORM</pmrq:InstrPrty>
  <pmrq:SvcLvl><pmrq:Cd>SEPA</pmrq:Cd></pmrq:SvcLvl>
  <pmrq:LclInstrm><pmrq:Cd>SEPA</pmrq:Cd></pmrq:LclInstrm>
</pmrq:PmtTpInf>
```

---

## Milestones & Tasks

---

### M0 — Setup (v0.0.1 → v0.0.4)

#### Task 0.1 — Init monorepo
**Branch:** `chore/init-monorepo` → **Tag:** `v0.0.1` ✅

- [x] Directory structure: `packages/core/`, `packages/web/`, `docs/`
- [x] `pnpm-workspace.yaml` with both packages
- [x] Root `package.json` with top-level scripts (`lint`, `typecheck`, `test`, `build`)
- [x] Shared `tsconfig.base.json` (strict, paths)
- [x] `biome.json` with strict rules, organize imports
- [x] `.gitignore` (node_modules, .next, dist, coverage, .env)
- [x] `LICENSE` (MIT)
- [x] `README.md` with placeholder (logo, tagline, links)
- [x] `CONTRIBUTING.md` (local setup, commit conventions)
- [x] `CODE_OF_CONDUCT.md` (Contributor Covenant)
- [x] `@changesets/cli` configured

**Done when:** `pnpm install` succeeds, biome finds no errors on empty files.

---

#### Task 0.2 — Base CI
**Branch:** `chore/ci-setup` → **Tag:** `v0.0.2` ✅

- [x] `.github/workflows/ci.yml`: trigger on PR + push to `main`
  - Steps: checkout → setup pnpm → cache → install → lint → typecheck → test → build
  - Placeholder test that passes (1 trivial test per package)
- [x] `.github/workflows/e2e.yml`: placeholder with explicit skip (enabled: false)
- [x] `.github/workflows/release.yml`: Changesets flow (version → auto PR → publish on merge)
- [x] `@changesets/cli` configured for `@sepalo/core` (basePath: packages/core)
- [x] `.changeset/config.json` with `access: public`

**Done when:** CI is green on GitHub for a test PR.

---

#### Task 0.3 — Next.js 15 app shell
**Branch:** `chore/nextjs-setup` → **Tag:** `v0.0.3` ✅

- [x] `packages/web`: `create-next-app` with App Router + TypeScript + Tailwind
- [x] Tailwind CSS v4 configured
- [x] shadcn/ui init (`components.json`, path: `src/components/ui`)
- [x] `next/font` with Inter (UI) + JetBrains Mono (code/XML)
- [x] App Router routing structure:
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
- [x] Header (server component): logo + nav links (mobile: hamburger)
- [x] Footer (server component): copyright, GitHub, license, version
- [x] `vercel.json` with security headers
- [x] `packages/web/package.json` with `@sepalo/core` alias → `../../packages/core`

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
**Branch:** `feat/core-types` ✅

- [x] `packages/core/src/types/index.ts`:
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
- [x] `packages/core/src/schemas/payment.ts`: Zod schemas with `z.infer` (no hand-duplicated types)
- [x] `packages/core/src/index.ts`: barrel file (exports types and public API only)
- [x] `packages/core/package.json`: `name: @sepalo/core`, `version: 0.0.1`, exports field
- [x] Unit tests: schema accepts valid batch, rejects invalid with specific message (≥5 cases per type)

**Done when:** `pnpm --filter @sepalo/core test` is green. No explicit `any`.

---

#### Task 1.2 — IBAN validator
**Branch:** `feat/core-validator-iban` ✅

- [x] `validators/iban.ts`:
  ```ts
  validateIban(iban: string): { valid: boolean; country: string; isSepa: boolean; isItalian: boolean }
  ```
  - mod-97 algorithm (rearrange + numeric conversion + modulo)
  - For Italian IBANs (IT): also verify CIN (check character at position 5)
  - SEPA country lookup (static list in file, updatable)
- [x] Tests: ≥10 valid IBANs (IT, DE, FR, ES, SM, GB, US extra-SEPA), ≥10 invalid (bad checksum, wrong length, invalid chars, wrong CIN for IT IBAN)

**Done when:** 100% coverage of file, all tests green.

---

#### Task 1.3 — ABI validator + lookup table
**Branch:** `feat/core-validator-abi` ✅

- [x] `data/abi-list.json`: list of active Italian bank ABI codes
- [x] `validators/abi.ts`:
    ```ts
    validateAbi(abi: string): boolean
    getAbiName(abi: string): string | undefined
    ```
- [x] `utils/iban-to-abi.ts`:
    ```ts
    extractAbiFromIban(iban: string): string | null
    ```
- [x] Tests: valid ABI present in list, ABI fewer than 5 digits, ABI not in list, extraction from valid/invalid IT IBAN

**Done when:** package builds successfully with `abi-list.json` bundled.

---

#### Task 1.4 — CUC, CF/PIVA, SEPA charset, totals validators
**Branch:** `feat/core-validators-misc` ✅

- [x] `validators/cuc.ts`: 8 alphanumeric characters `[A-Z0-9]{8}`
- [x] `validators/fiscal-code.ts`:
  - CF: 16 characters, check algorithm (final control character)
  - P.IVA: 11 digits, check algorithm (final control digit)
  - Accepts both (CF/PIVA are both valid as `Issr=CF`)
- [x] `validators/sepa-charset.ts`:
  ```ts
  sanitize(text: string): { sanitized: string; replaced: ... }
  isSepaCompliant(text: string): boolean
  ```
- [x] `validators/totals.ts`: validates NbOfTxs and CtrlSum
- [x] `validators/index.ts`: `validatePayment` orchestrator
- [x] Tests: ≥5 positive + ≥5 negative for each
- [x] remittanceInfo 1–140 chars enforced (added in PR #18)
- [x] beneficiary name 1–70 chars enforced (added in PR #18)

**Done when:** `validatePayment` covered at ≥90% coverage.

---

#### Task 1.5 — XML builder
**Branch:** `feat/core-xml-builder` ✅

- [x] `utils/id-generator.ts`: unique IDs `{PREFIX}{YYYYMMDDHHmmss}{random6alphanum}`
- [x] `utils/sanitize.ts`: applies SEPA charset sanitize to text fields
- [x] `builders/group-header.ts`: builds GrpHdr with dual-namespace structure
- [x] `builders/payment-info.ts`: builds PmtInf — `ReqdExctnDt → { Dt: "YYYY-MM-DD" }`, correct PmtTpInf, ChrgBr SLEV
- [x] `builders/transaction.ts`:
  - `CdtrAgt` absent for IT IBAN, BICFI for non-IT SEPA, mandatory for extra-SEPA
  - `DbtrAgt` with `MmbId` only (no ClrSysId per official XSD)
- [x] `builders/document.ts`: dual-namespace XML output (outer body NS + pmrq: prefix for content)
- [x] `tests/fixtures/input/`: 6 PaymentBatch JSON files (01–06)
- [ ] `tests/fixtures/expected/`: golden XML files (tests use structural assertions instead)
- [x] `tests/integration/pipeline.test.ts`: structural assertions for all fixtures

**Done when:** all fixtures pass XSD validation. `pnpm --filter @sepalo/core test` 100% green.

---

#### Task 1.6 — XSD validation + public API
**Branch:** `feat/core-xsd-validation` → **Tag:** `v0.1.0` ✅

- [x] Official CBI XSDs committed to `xsd-source/` (CBIPaymentRequestMsg.00.04.01 + others)
- [x] `scripts/embed-xsd.mjs`: embeds official XSD content into `data/xsd/index.ts` at build time
- [x] `validators/xsd.ts`: `validateAgainstXsd(xml)` with main schema + preloaded deps (xmllint-wasm convention)
- [x] `index.ts` barrel: exports public API including `CBI_BODY_XSD`, `CBI_PAYMENT_REQUEST_XSD`
- [x] `generatePaymentFile(batch)`: orchestrator — validate → build → XSD validate
- [x] Integration tests: fixtures 01–03 pass XSD validation; negative tests for malformed/missing elements
- [ ] Changeset for `@sepalo/core` version `0.1.0` (pending npm publish setup in M8)

**Done when:** `generatePaymentFile` produces valid XML for all golden files. XSD validation green.

---

### M2 — Web: foundation + auth (v0.2.0)

#### Task 2.1 — Design system and layout
**Branch:** `feat/web-layout` ✅

- [x] Colour palette configured in Tailwind: primary `#1B2A56`, accent `#2E7D5B`, neutral greys
- [x] shadcn/ui components installed: Button, Input, Card, Dialog, Table, Badge, Tooltip, Sheet, Label, Select
- [x] `app/(public)/layout.tsx`: header server component with logo + desktop nav + mobile hamburger
- [x] `app/(tool)/layout.tsx`: simplified header + PinGuard wrapper (client)
- [x] `app/not-found.tsx`: custom 404 page
- [x] `app/error.tsx`: error boundary with user-friendly message
- [x] Placeholder page for every route

**Done when:** navigation between all routes works. No hydration errors in console.

---

#### Task 2.2 — Crypto and storage layer
**Branch:** `feat/web-crypto-storage` ✅

- [x] `lib/crypto.ts`:
  ```ts
  deriveKey(pin, salt): Promise<CryptoKey>  // PBKDF2: SHA-256, 200k iterations
  encrypt(data, key): Promise<EncryptedBlob>  // AES-GCM: 12-byte IV
  decrypt(blob, key): Promise<string>
  generateSalt(): Uint8Array
  ```
- [x] `lib/storage.ts`: idb-keyval wrapper with `@sepalo/v1/` namespace, secureGet/secureSet/secureDelete/clearAll
- [x] `stores/auth.ts` (Zustand): `cryptoKey`, `failedAttempts`, `lockedUntil`, setKey/clearKey/recordFailure/resetAttempts
- [x] Unit tests: round-trip encrypt/decrypt, wrong key → error, different salts → different ciphertexts

**Done when:** unit tests green. No sensitive data in localStorage/sessionStorage.

---

#### Task 2.3 — PIN flow
**Branch:** `feat/web-pin-flow` ✅

- [x] `components/auth/PinPad.tsx`: 10-key pad + delete, 6-dot visual input, keyboard input
- [x] `components/auth/PinSetup.tsx`: enter + confirm PIN → derive key → save salt in IndexedDB
- [x] `components/auth/PinPrompt.tsx`:
  - Session unlock: derive key → attempt decrypt of known payload
  - Progressive cooldown: 1s → 5s → 30s → 5min → 1h
  - "Forgot PIN" reset option
- [x] `components/auth/PinGuard.tsx`: checks `cryptoKey` → show PinPrompt or children
- [x] `stores/auth.ts` updated: `failedAttempts`, `lockedUntil`

**Done when:** full flow tested manually. Cooldown visible and working.

---

#### Task 2.4 — Initiator profile
**Branch:** `feat/web-profile` → **Tag:** `v0.2.0` ✅

- [x] `hooks/useProfile.ts`: Zustand-backed hook — `Initiator | null`, encrypted persistence
- [x] `components/profile/ProfileForm.tsx`:
  - React Hook Form + Zod schema from `@sepalo/core`
  - IBAN field: auto-derives ABI + shows bank name
  - CUC / CF identifier with conditional input
  - Real-time validation on blur
- [x] `components/profile/ProfilePage.tsx`: shows form or summary based on profile state
- [x] `app/(tool)/profilo/page.tsx`
- [ ] 4-step onboarding modal (first-time flow before `/genera`)
- [ ] Onboarding gate: redirect if profile absent

**Done when:** onboarding completable in <2 minutes. Profile persists after PIN.

---

### M3 — Web: generation flow (v0.3.0)

> Address book (originally M4 Task 4.1) was completed as part of this work — see M4 below.

#### Task 3.1 — CSV/XLSX parsers
**Branch:** `feat/web-parsers` ✅ (simplified)

- [x] `lib/parse.ts`: PapaParse (CSV, auto-separator) + SheetJS (XLSX/XLS) in a single unified module
- [x] Column auto-detection: case-insensitive synonyms (name/beneficiario, iban, amount/importo, description/causale, bic/swift)
- [x] `parseAmount`: normalises sign via `Math.abs` — debit-as-negative CSV rows accepted (PR #18)
- [x] `lib/parse.test.ts`: covers IT-locale formats, column synonyms, sign normalisation
- [ ] Separate csv.ts / xlsx.ts / normalize.ts / index.ts files (merged into single parse.ts)
- [ ] Non-UTF-8 encoding detection and conversion with warning
- [ ] Saved column mapping preference in IndexedDB

**Done when:** parser produces consistent output for CSV and XLSX. Empty rows silently ignored.

---

#### Task 3.2 — Upload flow
**Branch:** `feat/web-upload` ✅ (core done)

- [x] `components/genera/UploadStep.tsx`: drag-and-drop, .csv/.xlsx/.xls, visual feedback, sample CSV download
- [x] `components/genera/MapStep.tsx`: column mapping dropdowns, remittanceInfo optional (defaults to "Pagamento {name}")
- [x] Error handling: parse failures shown inline
- [ ] `components/upload/FilePreview.tsx`: table of first 5 rows + row counter + encoding warnings
- [ ] 5MB / 5,000 row limits with toast feedback
- [ ] Saved mapping preference in IndexedDB for same-structure files

**Done when:** drag-and-drop works on Chromium, Firefox, WebKit.

---

#### Task 3.3 — Transaction review
**Branch:** `feat/web-review` ✅ (core done)

- [x] `components/genera/ReviewStep.tsx`: transaction list, validation errors shown, execution date, batch booking toggle, totals
- [x] Execution date picker with default
- [x] Batch booking toggle
- [x] Transaction count and total amount displayed
- [ ] Inline cell editing with re-validation on blur
- [ ] Pagination or virtual scroll for >100 rows
- [ ] Execution date validation (no weekends, no holidays, ≤60 days)
- [ ] Clickable error list scrolling to row
- [ ] Duplicate payment warning (same IBAN + amount)

**Done when:** table with 100 rows stays responsive.

---

#### Task 3.4 — Generation and download
**Branch:** `feat/web-generation` → **Tag:** `v0.3.0` ✅ (core done)

- [x] XML generation via `buildXml` fully client-side, no server calls
- [x] `DownloadButton`: XML Blob → `URL.createObjectURL` → file download
- [x] Browser-side XSD validation via `lib/xsd.ts` (xmllint-wasm via `/vendor/`, webpack/turbopack ignored) — PR #18
- [x] Business validation errors shown before download
- [x] `scripts/vendor-xmllint.mjs`: copies runtime files from node_modules to `public/vendor/` on postinstall
- [ ] `components/result/XmlPreview.tsx`: first 50 XML lines in monospace font + "Copy all"
- [ ] File name format: `CBI_{YYYYMMDD}_{n}tx.xml`
- [ ] `components/result/GenerationSummary.tsx`: SHA-256 hash of file
- [ ] Full state machine (idle → parsing → mapping → review → generating → success → error)
- [ ] Analytics: `trackEvent('file_generated', { tx_count })`

**Done when:** downloaded XML passes CBI online validator.

---

### M4 — Web: address book and settings (v0.4.0)

#### Task 4.1 — Address book
**Branch:** `feat/web-address-book` → **Tag:** `v0.2.4` ✅

> Completed as part of M2 work.

- [x] `hooks/useAddressBook.ts`: encrypted persist, CRUD operations
- [x] `components/rubrica/BeneficiaryForm.tsx`: add/edit with IBAN validation
- [x] `components/rubrica/AddressBookPage.tsx`: list, search, edit, delete with confirmation
- [x] `app/(tool)/rubrica/page.tsx`
- [ ] Integration with TransactionTable: combobox autocomplete pre-fills IBAN and BIC

**Done when:** add 10 beneficiaries, reload, find them all after PIN.

---

#### Task 4.2 — Settings
**Branch:** `feat/web-settings` → **Tag:** `v0.4.0`

- [ ] `app/(tool)/impostazioni/page.tsx` with three sections:
  - **Change PIN**: re-encrypts all IndexedDB data with new key
  - **Strong passphrase** (opt-in): min 12 chars, same crypto mechanism
  - **Reset device**: double-confirmation modal, clears IndexedDB → onboarding
- [ ] Info section: app version, GitHub link, MIT license

**Done when:** PIN change works. Reset clears everything and shows onboarding.

---

### M5 — SEO, public content, analytics (v0.5.0)

#### Task 5.1 — Landing page (SSR)
**Branch:** `feat/web-home`

- [ ] `app/(public)/page.tsx`: server component (SSR)
- [ ] Hero: H1 + tagline + primary CTA + secondary CTA
- [ ] "How it works", "Why Sepalo", "Who it's for" sections
- [ ] Social proof placeholder
- [ ] `generateMetadata()`: title, description, og:image, canonical

**Done when:** Lighthouse SEO 100. Core Web Vitals green on Vercel Analytics.

---

#### Task 5.2 — Content pages (SSR)
**Branch:** `feat/web-content-pages`

- [ ] `app/(public)/guida/page.tsx`: user documentation, CSV format, template downloads, FAQ
- [ ] `app/(public)/sicurezza/page.tsx`: threat model, encryption details, passphrase guidance
- [ ] `app/(public)/about/page.tsx`: mission, open source, MIT license, how to contribute

**Done when:** all pages server-side rendered. No placeholder text remaining.

---

#### Task 5.3 — Technical SEO and sitemap
**Branch:** `feat/web-seo`

- [ ] `app/sitemap.ts`: public routes only, correct changeFrequency
- [ ] `app/robots.ts`: Disallow tool routes
- [ ] `public/og-image.png`: 1200×630
- [ ] `public/favicon.svg` + `favicon.ico` + PNG icons 192/512
- [ ] JSON-LD on home: `WebApplication` schema
- [ ] Canonical URL on every public page
- [ ] Google Search Console sitemap submission

**Done when:** `https://sepalo.it/sitemap.xml` valid. Structured data passes Google Rich Results Test.

---

#### Task 5.4 — Rybbit analytics
**Branch:** `feat/web-analytics` → **Tag:** `v0.5.0`

- [ ] Rybbit project setup
- [ ] `lib/analytics.ts`: `trackEvent` (anonymous metadata only)
- [ ] Rybbit snippet in `app/layout.tsx` via `next/script strategy="afterInteractive"`
- [ ] CSP updated with Rybbit domain

**Done when:** `file_generated` event visible in Rybbit dashboard. No sensitive data in payloads.

---

### M6 — PWA and templates (v0.6.0)

#### Task 6.1 — PWA
**Branch:** `feat/web-pwa`

- [ ] `public/manifest.webmanifest`
- [ ] Service worker: cache-first static, network-first HTML, offline fallback
- [ ] `app/(public)/offline/page.tsx`

**Done when:** Lighthouse PWA green. App installable. Works offline.

---

#### Task 6.2 — Downloadable templates
**Branch:** `feat/web-templates` → **Tag:** `v0.6.0`

- [ ] `public/template.csv`: header + 3 realistic example rows
- [ ] `public/template.xlsx`: same content in Excel
- [ ] Download links in `/genera` and `/guida`

**Done when:** downloaded CSV parsable by the app without errors.

---

### M7 — Full test suite (v0.7.0)

#### Task 7.1 — e2e happy path
**Branch:** `test/e2e-happy-path`

- [ ] `playwright.config.ts`: Chromium + Firefox + WebKit
- [ ] `e2e/fixtures/`: `sample.csv`, `sample.xlsx`
- [ ] `e2e/happy-path.spec.ts`: full flow (onboarding → upload → review → generate → download)

**Done when:** green on all 3 browsers in CI.

---

#### Task 7.2 — e2e PIN flow and persistence
**Branch:** `test/e2e-pin-persistence`

- [ ] `e2e/pin-flow.spec.ts`: cooldown, wrong PIN, correct PIN
- [ ] `e2e/persistence.spec.ts`: reload → PIN → profile present
- [ ] `e2e/reset-device.spec.ts`: settings → reset → fresh onboarding

**Done when:** green on Chromium.

---

#### Task 7.3 — e2e validation errors and edge cases
**Branch:** `test/e2e-validation`

- [ ] `e2e/fixtures/invalid.csv`: invalid IBANs, remittance >140 chars, negative amount
- [ ] `e2e/validation-errors.spec.ts`: inline fix → error clears → generate OK
- [ ] `e2e/edge-cases.spec.ts`: >5MB, `;` separator, accented remittance

**Done when:** green on Chromium + Firefox.

---

#### Task 7.4 — Full CI e2e workflow
**Branch:** `chore/ci-e2e-workflow` → **Tag:** `v0.7.0`

- [ ] `.github/workflows/e2e.yml` complete with artifact upload on failure
- [ ] Separate CI from e2e jobs
- [ ] Browser matrix: Chromium + Firefox + WebKit

**Done when:** CI e2e green in <5 minutes.

---

### M8 — Hardening and beta launch (v1.0.0-beta.1)

#### Task 8.1 — Final security hardening
**Branch:** `chore/security-hardening`

- [ ] `pnpm audit` — zero high/critical vulnerabilities
- [ ] Final CSP tested with CSP Evaluator
- [ ] Dependabot enabled
- [ ] Security.md with disclosure policy

---

#### Task 8.2 — Publish @sepalo/core to npm
**Branch:** `chore/npm-publish-setup`

- [ ] `packages/core/package.json`: exports, types, repository, keywords, engines
- [ ] `packages/core/.npmignore`
- [ ] Changeset for `0.1.0` created and approved
- [ ] `release.yml` tested
- [ ] `pnpm changeset publish`
- [ ] `@sepalo/core` README with usage examples and API reference

---

#### Task 8.3 — Open source launch
**Branch:** `chore/oss-launch` → **Tag:** `v1.0.0-beta.1`

- [ ] Repository public on GitHub
- [ ] `.github/ISSUE_TEMPLATE/` (bug, feature, cbi-validation)
- [ ] `.github/pull_request_template.md`
- [ ] `docs/adr/001-nextjs-over-vite.md`
- [ ] `docs/adr/002-client-only-tool.md`
- [ ] GitHub Discussions enabled
- [ ] GitHub Projects: public roadmap
- [ ] README with `beta` badge

**Done when:** `sepalo.it` full beta. `@sepalo/core@0.1.0` on npm. Repository public.

---

## Milestone → Version Summary

| Milestone | Version | What it includes | Status |
|---|---|---|---|
| M0 Setup | `v0.0.1` → `v0.0.3` | Monorepo, CI, Next.js shell | ✅ (Vercel deploy pending) |
| M1 Core | `v0.1.0` | Complete `@sepalo/core` with official XSD validation | ✅ |
| M2 Auth | `v0.2.0` → `v0.2.4` | PIN, crypto, initiator profile, **address book** | ✅ |
| M3 Generate | `v0.3.0` + PR #18 | Parsers, upload, map, review, generation, browser XSD validation | ✅ core done, advanced features pending |
| M4 Extras | `v0.4.0` | Address book ✅ (shipped in M2), settings pending | 🔄 partial |
| M5 SEO | `v0.5.0` | SSR landing, content pages, sitemap, Rybbit | ⏳ |
| M6 PWA | `v0.6.0` | Offline support, downloadable templates | ⏳ |
| M7 Tests | `v0.7.0` | Full e2e suite | ⏳ |
| M8 Launch | `v1.0.0-beta.1` | Hardening, npm publish, open source | ⏳ |

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
