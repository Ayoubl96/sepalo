---
"@sepalo/core": minor
---

feat(core): emit CtgyPurp (category purpose) for Italian beneficiary IBANs

Italian bank portals reject CBI files whose transactions to an IT beneficiary IBAN
lack a category purpose (CBI spec 2.12.2.3, "causale codificata"). The builder now
emits a transaction-level `PmtTpInf/CtgyPurp/Cd`, defaulting to `OTHR` when unset.

Adds an optional `purpose` field (1-4 char ISO category purpose code) to
`TransactionSchema`. For non-IT beneficiaries the element is emitted only when a
purpose is explicitly provided. `Purp` is intentionally not emitted (not required by CBI).
