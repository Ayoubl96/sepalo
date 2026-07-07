# @sepalo/core

## 0.2.0

### Minor Changes

- 54ffbc9: feat(core): emit CtgyPurp (category purpose) for Italian beneficiary IBANs

  Italian bank portals reject CBI files whose transactions to an IT beneficiary IBAN
  lack a category purpose (CBI spec 2.12.2.3, "causale codificata"). The builder now
  emits a transaction-level `PmtTpInf/CtgyPurp/Cd`, defaulting to `OTHR` when unset.

  Adds an optional `purpose` field (1-4 char ISO category purpose code) to
  `TransactionSchema`. For non-IT beneficiaries the element is emitted only when a
  purpose is explicitly provided. `Purp` is intentionally not emitted (not required by CBI).

## 0.1.0

### Minor Changes

- M1 complete — full CBI payment-file generation pipeline.

  - `generatePaymentFile`: async orchestrator that runs business validation, builds the CBI XML (`CBIBdyPaymentRequest.00.04.01`) and verifies XSD conformance in a single call.
  - `validateAgainstXsd`: XSD conformance check via xmllint-wasm (lazy-loaded).
  - Official CBI XSD validation plus amount and remittance-information normalization.
  - Public API barrel exporting all validators, builders and types.

## 0.0.1

### Patch Changes

- Initial monorepo scaffold and `@sepalo/core` package setup.
