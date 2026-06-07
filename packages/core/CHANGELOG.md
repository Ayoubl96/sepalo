# @sepalo/core

## 0.2.0

### Minor Changes

- b9e3fff: feat(core): M1 complete — XSD validation, generatePaymentFile orchestrator, full public API

  Adds `validateAgainstXsd` (xmllint-wasm, lazy-loaded) and `generatePaymentFile` which
  orchestrates business validation, XML generation and XSD conformance in a single async call.
  Exports all validators, builders and types through the public barrel.
