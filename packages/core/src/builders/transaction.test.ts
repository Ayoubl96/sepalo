import { describe, expect, it } from 'vitest';
import type { Transaction } from '../types/index.js';
import { buildTransaction } from './transaction.js';

const FIXED_DATE = new Date('2024-12-10T10:00:00.000Z');

const italianTx: Transaction = {
  amount: 100.5,
  beneficiary: { name: 'Mario Rossi', iban: 'IT60X0542811101000000654321' },
  remittanceInfo: 'Invoice 2024-001',
};

const foreignTx: Transaction = {
  amount: 100.5,
  beneficiary: { name: 'Hans Müller', iban: 'DE89370400440532013000', bic: 'COBADEFFXXX' },
  remittanceInfo: 'Invoice 2024-002',
};

// biome-ignore lint/suspicious/noExplicitAny: reading a loosely-typed builder result
const build = (tx: Transaction) => buildTransaction(tx, 0, FIXED_DATE) as any;

describe('buildTransaction — CtgyPurp (category purpose)', () => {
  it('defaults to OTHR for an Italian beneficiary IBAN when purpose is unset', () => {
    const result = build(italianTx);
    expect(result.PmtTpInf?.CtgyPurp?.Cd).toBe('OTHR');
  });

  it('uses the provided purpose code for an Italian beneficiary IBAN', () => {
    const result = build({ ...italianTx, purpose: 'SALA' });
    expect(result.PmtTpInf?.CtgyPurp?.Cd).toBe('SALA');
  });

  it('emits PmtTpInf immediately after PmtId and before Amt (XSD sequence)', () => {
    const keys = Object.keys(build(italianTx));
    expect(keys.indexOf('PmtTpInf')).toBe(keys.indexOf('PmtId') + 1);
    expect(keys.indexOf('PmtTpInf')).toBeLessThan(keys.indexOf('Amt'));
  });

  it('omits PmtTpInf for a non-IT beneficiary when no purpose is provided', () => {
    const result = build(foreignTx);
    expect(result.PmtTpInf).toBeUndefined();
  });

  it('emits the provided purpose for a non-IT beneficiary when set', () => {
    const result = build({ ...foreignTx, purpose: 'SUPP' });
    expect(result.PmtTpInf?.CtgyPurp?.Cd).toBe('SUPP');
  });

  it('never emits a Purp element (not required by CBI)', () => {
    expect(build(italianTx).Purp).toBeUndefined();
    expect(build({ ...italianTx, purpose: 'SALA' }).Purp).toBeUndefined();
  });
});
