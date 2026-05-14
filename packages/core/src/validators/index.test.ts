import { describe, expect, it } from 'vitest';
import type { PaymentBatch } from '../types/index.js';
import { validatePayment } from './index.js';

function validBatch(): PaymentBatch {
  return {
    initiator: {
      name: 'Acme S.r.l.',
      identifier: { type: 'CUC', value: 'ABC12345' },
      iban: 'IT60X0542811101000000123456',
      abi: '05428',
    },
    executionDate: '2024-12-15',
    batchBooking: true,
    transactions: [
      {
        id: 'TX-001',
        endToEndId: 'E2E-001',
        amount: 100.5,
        beneficiary: {
          name: 'Mario Rossi',
          iban: 'IT60X0542811101000000123456',
        },
        remittanceInfo: 'Invoice 2024-001',
      },
    ],
  };
}

describe('validatePayment — remittanceInfo length', () => {
  it('rejects empty remittanceInfo (XSD Ustrd minLength=1)', () => {
    const batch = validBatch();
    batch.transactions[0]!.remittanceInfo = '';

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
    const batch = validBatch();
    batch.transactions[0]!.remittanceInfo = 'X'.repeat(141);

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
    const batch = validBatch();
    batch.transactions[0]!.remittanceInfo = 'A';
    expect(validatePayment(batch).valid).toBe(true);
  });

  it('accepts remittanceInfo of exactly 140 chars', () => {
    const batch = validBatch();
    batch.transactions[0]!.remittanceInfo = 'X'.repeat(140);
    expect(validatePayment(batch).valid).toBe(true);
  });

  it('reports the row number of the offending transaction', () => {
    const batch = validBatch();
    batch.transactions.push({
      ...batch.transactions[0]!,
      id: 'TX-002',
      endToEndId: 'E2E-002',
      remittanceInfo: '',
    });

    const result = validatePayment(batch);
    const remittanceErrors = result.errors.filter((e) => e.code === 'REMITTANCE_LENGTH');
    expect(remittanceErrors).toHaveLength(1);
    expect(remittanceErrors[0]!.rowNumber).toBe(2);
  });
});

describe('validatePayment — beneficiary name length', () => {
  it('rejects empty beneficiary name (XSD Cdtr/Nm minLength=1)', () => {
    const batch = validBatch();
    batch.transactions[0]!.beneficiary.name = '';

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
    const batch = validBatch();
    batch.transactions[0]!.beneficiary.name = 'X'.repeat(71);

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
    const batch = validBatch();
    batch.transactions[0]!.beneficiary.name = 'X'.repeat(70);
    expect(validatePayment(batch).valid).toBe(true);
  });
});
