<p align="center">
  <img src="https://raw.githubusercontent.com/Ayoubl96/sepalo/main/packages/web/src/app/icon.svg" width="64" height="64" alt="Sepalo logo">
</p>

<h2 align="center">Sepalo</h2>

<p align="center">
  Generate CBI XML payment files (<code>CBIBdyPaymentRequest.00.04.01</code>) directly in your browser.<br>
  No account. No server. Your data never leaves your device.
</p>

<p align="center">
  <a href="https://sepalo.it"><strong>sepalo.it</strong></a> ·
  <a href="https://sepalo.it/docs">Docs</a> ·
  <a href="https://sepalo.it/guida">Guide</a> ·
  <a href="https://sepalo.it/sicurezza">Security</a>
</p>

<p align="center">
  <a href="https://github.com/Ayoubl96/sepalo/actions/workflows/ci.yml">
    <img src="https://github.com/ayoubl96/sepalo/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://www.npmjs.com/package/@sepalo/core">
    <img src="https://img.shields.io/npm/v/@sepalo/core?color=1b2a56" alt="npm version">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
</p>

---

<video src="https://github.com/Ayoubl96/sepalo/releases/download/v0.5.0/video_sepalo_cbi.mov" autoplay loop muted playsinline width="100%"></video>

---

## What is Sepalo?

Italian businesses upload a CSV or Excel file with payment details and download a valid CBI XML file ready to import into their home banking. The entire process — parsing, IBAN validation, XML generation, and XSD schema validation — runs in the browser using the Web Crypto API and WebAssembly.

**No data is ever sent to a server.**

## Features

- **100% client-side** — Excel/CSV is processed in-browser; payment data is never stored or transmitted
- **CBI standard** — generates valid `CBIBdyPaymentRequest.00.04.01` XML, validated against the official XSD schema
- **IBAN validation** — checksum + SEPA country check on every beneficiary row, with inline error reporting
- **Encrypted profile** — initiator details (IBAN, ABI, name) are stored with AES-256-GCM via the Web Crypto API, bound to the device
- **@sepalo/core** — the generation logic is published as a standalone npm library for Node.js, Deno, and browser integrations

## Try it

→ **[sepalo.it/genera](https://sepalo.it/genera)**

---

## `@sepalo/core` — npm library

The CBI XML generation engine is available as a standalone TypeScript library.

```bash
npm install @sepalo/core
```

```ts
import { generatePaymentFile } from '@sepalo/core';
import type { PaymentBatch } from '@sepalo/core';

const batch: PaymentBatch = {
  initiator: {
    name: 'Acme S.r.l.',
    identifier: { type: 'CUC', value: 'ABC12345' },
    iban: 'IT60X0542811101000000123456',
    abi: '05428',
  },
  executionDate: '2026-06-01',
  batchBooking: true,
  transactions: [
    {
      amount: 1500.00,
      beneficiary: { name: 'Mario Rossi', iban: 'IT60X0542811101000000654321' },
      remittanceInfo: 'Fattura 2026/001',
    },
  ],
};

const { xml, errors } = await generatePaymentFile(batch);
```

Works in **browser (ESM)**, **Node.js 18+**, and **Deno**. Full API reference at [sepalo.it/docs](https://sepalo.it/docs).

---

## Monorepo

| Package | Description |
|---|---|
| [`packages/core`](packages/core) | `@sepalo/core` — TypeScript library: parsers, validators, XML builder, embedded XSD |
| [`packages/web`](packages/web) | Next.js 15 app (App Router, Tailwind v4, static export) |

## Local development

```bash
# Requirements: Node.js ≥ 20, pnpm ≥ 9
pnpm install
pnpm dev          # Next.js dev server at localhost:3000
pnpm typecheck    # tsc --noEmit across all packages
pnpm test         # vitest (packages/core + packages/web)
pnpm lint         # Biome check
pnpm --filter @sepalo/core build   # rebuild core before web typecheck
```

CI runs: **lint → build core → typecheck → test → build**. All must pass before merge.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR. Issues and pull requests are welcome.

## License

MIT — see [LICENSE](LICENSE).
