import { describe, expect, it } from 'vitest';
import type { PaymentBatch, Transaction } from '../types/index.js';
import { validatePayment } from './index.js';

function validTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'TX-001',
    endToEndId: 'E2E-001',
    amount: 100.5,
    beneficiary: {
      name: 'Mario Rossi',
      iban: 'IT60X0542811101000000123456',
    },
    remittanceInfo: 'Invoice 2024-001',
    ...overrides,
  };
}

function validBatch(txOverrides: Partial<Transaction> = {}): PaymentBatch {
  return {
    initiator: {
      name: 'Acme S.r.l.',
      identifier: { type: 'CUC', value: 'ABC12345' },
      iban: 'IT60X0542811101000000123456',
      abi: '05428',
    },
    executionDate: '2024-12-15',
    batchBooking: true,
    transactions: [validTransaction(txOverrides)],
  };
}

describe('validatePayment — remittanceInfo length', () => {
  it('rejects empty remittanceInfo (XSD Ustrd minLength=1)', () => {
    const batch = validBatch({ remittanceInfo: '' });

    const result = validatePayment(batch);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'transactions[0].remittanceInfo',
        code: 'REMITTANCE_LENGTH',
        rowNumber: 1,
      }),
    );
  });

  it('rejects remittanceInfo longer than 140 chars', () => {
    const batch = validBatch({ remittanceInfo: 'X'.repeat(141) });

    const result = validatePayment(batch);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'transactions[0].remittanceInfo',
        code: 'REMITTANCE_LENGTH',
      }),
    );
  });

  it('accepts remittanceInfo of exactly 1 char', () => {
    const batch = validBatch({ remittanceInfo: 'A' });
    expect(validatePayment(batch).valid).toBe(true);
  });

  it('accepts remittanceInfo of exactly 140 chars', () => {
    const batch = validBatch({ remittanceInfo: 'X'.repeat(140) });
    expect(validatePayment(batch).valid).toBe(true);
  });

  it('reports the row number of the offending transaction', () => {
    const batch = validBatch();
    batch.transactions.push(
      validTransaction({ id: 'TX-002', endToEndId: 'E2E-002', remittanceInfo: '' }),
    );

    const result = validatePayment(batch);
    const remittanceErrors = result.errors.filter((e) => e.code === 'REMITTANCE_LENGTH');
    expect(remittanceErrors).toHaveLength(1);
    const [firstError] = remittanceErrors;
    expect(firstError?.rowNumber).toBe(2);
  });
});

describe('validatePayment — beneficiary name length', () => {
  it('rejects empty beneficiary name (XSD Cdtr/Nm minLength=1)', () => {
    const batch = validBatch({ beneficiary: { name: '', iban: 'IT60X0542811101000000123456' } });

    const result = validatePayment(batch);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'transactions[0].beneficiary.name',
        code: 'BENEFICIARY_NAME_LENGTH',
        rowNumber: 1,
      }),
    );
  });

  it('rejects beneficiary name longer than 70 chars', () => {
    const batch = validBatch({
      beneficiary: { name: 'X'.repeat(71), iban: 'IT60X0542811101000000123456' },
    });

    const result = validatePayment(batch);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'transactions[0].beneficiary.name',
        code: 'BENEFICIARY_NAME_LENGTH',
      }),
    );
  });

  it('accepts beneficiary name of exactly 70 chars', () => {
    const batch = validBatch({
      beneficiary: { name: 'X'.repeat(70), iban: 'IT60X0542811101000000123456' },
    });
    expect(validatePayment(batch).valid).toBe(true);
  });
});
