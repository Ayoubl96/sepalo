export const VERSION = '0.0.1';

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
