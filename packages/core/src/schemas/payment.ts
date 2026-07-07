import { z } from 'zod';

export const PartyIdentifierSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('CUC'), value: z.string().min(1) }),
  z.object({ type: z.literal('CF'), value: z.string().min(1) }),
]);

export const InitiatorSchema = z.object({
  name: z.string().min(1).max(70),
  identifier: PartyIdentifierSchema,
  iban: z.string().min(15).max(34),
  abi: z
    .string()
    .length(5)
    .regex(/^\d{5}$/),
});

export const BeneficiarySchema = z.object({
  name: z.string().min(1).max(70),
  iban: z.string().min(15).max(34),
  bic: z.string().min(8).max(11).optional(),
});

export const TransactionSchema = z.object({
  id: z.string().max(35).optional(),
  endToEndId: z.string().max(35).optional(),
  amount: z.number().positive().multipleOf(0.01).max(999_999_999.99),
  beneficiary: BeneficiarySchema,
  remittanceInfo: z.string().min(1).max(140),
  // ISO 20022 category purpose code (CtgyPurp/Cd). Mandatory for IT beneficiary
  // IBANs per CBI spec 2.12.2.3; the builder defaults it to 'OTHR' when unset.
  purpose: z
    .string()
    .regex(/^[A-Z0-9]{1,4}$/, 'must be a 1-4 char ISO category purpose code')
    .optional(),
});

export const PaymentBatchSchema = z.object({
  initiator: InitiatorSchema,
  executionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  batchBooking: z.boolean(),
  transactions: z.array(TransactionSchema).min(1).max(99_999),
});

export const ValidationErrorSchema = z.object({
  path: z.string(),
  code: z.string(),
  message: z.string(),
  rowNumber: z.number().int().positive().optional(),
});

export const ValidationWarningSchema = z.object({
  path: z.string(),
  code: z.string(),
  message: z.string(),
  rowNumber: z.number().int().positive().optional(),
});

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(ValidationErrorSchema),
  warnings: z.array(ValidationWarningSchema),
});

export type PartyIdentifier = z.infer<typeof PartyIdentifierSchema>;
export type Initiator = z.infer<typeof InitiatorSchema>;
export type Beneficiary = z.infer<typeof BeneficiarySchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type PaymentBatch = z.infer<typeof PaymentBatchSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ValidationWarning = z.infer<typeof ValidationWarningSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
