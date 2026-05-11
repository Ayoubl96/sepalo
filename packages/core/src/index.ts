export const VERSION = '0.1.0';

export type {
  PartyIdentifier,
  Initiator,
  Beneficiary,
  Transaction,
  PaymentBatch,
  ValidationError,
  ValidationWarning,
  ValidationResult,
} from './types/index.js';

export {
  PartyIdentifierSchema,
  InitiatorSchema,
  BeneficiarySchema,
  TransactionSchema,
  PaymentBatchSchema,
  ValidationResultSchema,
} from './schemas/payment.js';

export { buildXml } from './builders/document.js';

export { validatePayment } from './validators/index.js';
export { validateIban, SEPA_COUNTRIES } from './validators/iban.js';
export type { IbanValidationResult } from './validators/iban.js';
export { validateAbi, getAbiName } from './validators/abi.js';
export { validateCuc } from './validators/cuc.js';
export {
  validateCodiceFiscale,
  validatePartitaIva,
  validateFiscalIdentifier,
} from './validators/fiscal-code.js';
export { sanitize, isSepaCompliant } from './validators/sepa-charset.js';
export { validateTotals } from './validators/totals.js';
export { validateAgainstXsd } from './validators/xsd.js';

export { generatePaymentFile } from './api/generate.js';
export type { GenerateResult } from './api/generate.js';
