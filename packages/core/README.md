# @sepalo/core

TypeScript library for generating and validating CBI XML payment files (`CBIBdyPaymentRequest.00.04.01`).

Works in **browser** (ESM), **Node.js 18+**, and **Deno**. Zero runtime dependencies beyond `zod` and `fast-xml-parser`.

## Install

```bash
npm install @sepalo/core
# or
pnpm add @sepalo/core
```

XSD validation against the official CBI schema requires `xmllint-wasm` as an optional peer dependency:

```bash
npm install xmllint-wasm
```

## Quick start

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
      beneficiary: {
        name: 'Mario Rossi',
        iban: 'IT60X0542811101000000654321',
      },
      remittanceInfo: 'Fattura 2026/001',
    },
  ],
};

const { xml, errors, warnings } = await generatePaymentFile(batch);

if (errors.length > 0) {
  console.error(errors);
} else {
  console.log(xml); // ready-to-upload XML string
}
```

## API

### `generatePaymentFile(batch)`

Main entry point. Runs business validation, builds the XML, and (if `xmllint-wasm` is installed) validates against the official XSD schema.

Returns `Promise<GenerateResult>`:

```ts
interface GenerateResult {
  xml: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

### `buildXml(batch)`

Builds the XML string without any validation. Use when you want full control.

```ts
import { buildXml } from '@sepalo/core';
const xml: string = buildXml(batch);
```

### `validatePayment(batch)`

Runs business-rule validation only (IBAN checksums, field lengths, CUC format, SEPA charset). Returns `ValidationResult`.

```ts
import { validatePayment } from '@sepalo/core';
const { valid, errors, warnings } = validatePayment(batch);
```

### `validateAgainstXsd(xml)`

Validates an XML string against the embedded CBI XSD schema. Requires `xmllint-wasm`.

```ts
import { validateAgainstXsd } from '@sepalo/core';
const { valid, errors } = await validateAgainstXsd(xml);
```

### Individual validators

```ts
import {
  validateIban,       // IBAN checksum + SEPA country check
  validateAbi,        // Italian ABI bank code
  validateCuc,        // CBI CUC identifier (8 alphanumeric chars)
  validateCodiceFiscale,
  validatePartitaIva,
  sanitize,           // strips/replaces non-SEPA characters
} from '@sepalo/core';
```

## Types

```ts
import type {
  PaymentBatch,      // top-level batch: initiator + transactions + date
  Initiator,         // ordering party: name, identifier (CUC|CF), IBAN, ABI
  Transaction,       // single credit transfer: amount, beneficiary, remittance info
  Beneficiary,       // payee: name, IBAN, optional BIC
  PartyIdentifier,   // { type: 'CUC' | 'CF', value: string }
  ValidationResult,  // { valid, errors[], warnings[] }
  ValidationError,   // { path, code, message, rowNumber? }
  ValidationWarning, // { path, code, message, rowNumber? }
} from '@sepalo/core';
```

## CBI standard

- Outer namespace: `urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01`
- Inner namespace (`pmrq:`): `urn:CBI:xsd:CBIPaymentRequest.00.04.01`

The embedded XSD files are exported as `CBI_BODY_XSD`, `CBI_PAYMENT_REQUEST_XSD`, and `CBI_SGN_INF_XSD` for advanced use.

## Node.js example

```ts
// generate.mjs
import { writeFileSync } from 'fs';
import { generatePaymentFile } from '@sepalo/core';

const batch = { /* ... */ };
const { xml, errors } = await generatePaymentFile(batch);

if (errors.length) {
  console.error(errors);
  process.exit(1);
}

writeFileSync('output.xml', xml, 'utf-8');
console.log('Generated output.xml');
```

## License

MIT — see [LICENSE](../../LICENSE).
