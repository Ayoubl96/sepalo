import { describe, expect, it } from 'vitest';
import {
  BeneficiarySchema,
  InitiatorSchema,
  PaymentBatchSchema,
  TransactionSchema,
} from './payment.js';

const validInitiator = {
  name: 'Acme S.r.l.',
  identifier: { type: 'CUC' as const, value: 'ABC12345' },
  iban: 'IT60X0542811101000000123456',
  abi: '05428',
};

const validBeneficiary = {
  name: 'Mario Rossi',
  iban: 'IT60X0542811101000000654321',
};

const validTransaction = {
  amount: 100.5,
  beneficiary: validBeneficiary,
  remittanceInfo: 'Invoice 2024-001',
};

const validBatch = {
  initiator: validInitiator,
  executionDate: '2024-12-15',
  batchBooking: true,
  transactions: [validTransaction],
};

describe('InitiatorSchema', () => {
  it('accepts a valid CUC initiator', () => {
    expect(InitiatorSchema.safeParse(validInitiator).success).toBe(true);
  });

  it('accepts a CF identifier', () => {
    const result = InitiatorSchema.safeParse({
      ...validInitiator,
      identifier: { type: 'CF', value: 'RSSMRA80A01H501Z' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown identifier type', () => {
    const result = InitiatorSchema.safeParse({
      ...validInitiator,
      identifier: { type: 'PIVA', value: '12345678901' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects ABI that is not exactly 5 digits', () => {
    const result = InitiatorSchema.safeParse({ ...validInitiator, abi: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = InitiatorSchema.safeParse({ ...validInitiator, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 70 chars', () => {
    const result = InitiatorSchema.safeParse({
      ...validInitiator,
      name: 'A'.repeat(71),
    });
    expect(result.success).toBe(false);
  });
});

describe('BeneficiarySchema', () => {
  it('accepts beneficiary without BIC', () => {
    expect(BeneficiarySchema.safeParse(validBeneficiary).success).toBe(true);
  });

  it('accepts beneficiary with BIC', () => {
    const result = BeneficiarySchema.safeParse({
      ...validBeneficiary,
      bic: 'UNCRITMM',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(
      BeneficiarySchema.safeParse({ ...validBeneficiary, name: '' }).success,
    ).toBe(false);
  });

  it('rejects IBAN shorter than 15 chars', () => {
    expect(
      BeneficiarySchema.safeParse({ ...validBeneficiary, iban: 'IT123' }).success,
    ).toBe(false);
  });

  it('rejects BIC shorter than 8 chars', () => {
    expect(
      BeneficiarySchema.safeParse({ ...validBeneficiary, bic: 'UNC' }).success,
    ).toBe(false);
  });
});

describe('TransactionSchema', () => {
  it('accepts a minimal valid transaction', () => {
    expect(TransactionSchema.safeParse(validTransaction).success).toBe(true);
  });

  it('accepts optional id and endToEndId', () => {
    const result = TransactionSchema.safeParse({
      ...validTransaction,
      id: 'TX-001',
      endToEndId: 'E2E-001',
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero amount', () => {
    expect(
      TransactionSchema.safeParse({ ...validTransaction, amount: 0 }).success,
    ).toBe(false);
  });

  it('rejects negative amount', () => {
    expect(
      TransactionSchema.safeParse({ ...validTransaction, amount: -10 }).success,
    ).toBe(false);
  });

  it('rejects amount above maximum', () => {
    expect(
      TransactionSchema.safeParse({
        ...validTransaction,
        amount: 1_000_000_000,
      }).success,
    ).toBe(false);
  });

  it('rejects remittanceInfo longer than 140 chars', () => {
    expect(
      TransactionSchema.safeParse({
        ...validTransaction,
        remittanceInfo: 'X'.repeat(141),
      }).success,
    ).toBe(false);
  });

  it('rejects id longer than 35 chars', () => {
    expect(
      TransactionSchema.safeParse({
        ...validTransaction,
        id: 'X'.repeat(36),
      }).success,
    ).toBe(false);
  });
});

describe('PaymentBatchSchema', () => {
  it('accepts a valid batch', () => {
    expect(PaymentBatchSchema.safeParse(validBatch).success).toBe(true);
  });

  it('rejects empty transactions array', () => {
    expect(
      PaymentBatchSchema.safeParse({ ...validBatch, transactions: [] }).success,
    ).toBe(false);
  });

  it('rejects invalid date format', () => {
    expect(
      PaymentBatchSchema.safeParse({
        ...validBatch,
        executionDate: '15/12/2024',
      }).success,
    ).toBe(false);
  });

  it('rejects non-boolean batchBooking', () => {
    expect(
      PaymentBatchSchema.safeParse({
        ...validBatch,
        batchBooking: 'yes',
      }).success,
    ).toBe(false);
  });

  it('accepts batchBooking false', () => {
    expect(
      PaymentBatchSchema.safeParse({ ...validBatch, batchBooking: false })
        .success,
    ).toBe(true);
  });
});
