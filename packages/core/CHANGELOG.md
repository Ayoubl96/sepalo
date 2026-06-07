# @sepalo/core

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
