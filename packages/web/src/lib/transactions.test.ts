import { describe, expect, it } from 'vitest';
import type { ColumnMap } from '../components/genera/MapStep.js';
import { rowsToTransactions } from './transactions.js';

const baseMap: ColumnMap = {
  beneficiaryName: 'name',
  beneficiaryIban: 'iban',
  beneficiaryBic: '',
  amount: 'amount',
  remittanceInfo: 'desc',
  purpose: '',
};

const row = {
  name: 'Mario Rossi',
  iban: 'IT60X0542811101000000123456',
  amount: '100,50',
  desc: 'Fattura 1',
  scopo: 'sala',
};

describe('rowsToTransactions', () => {
  it('applies the batch default purpose when no purpose column is mapped', () => {
    const [tx] = rowsToTransactions([row], baseMap, 'OTHR');
    expect(tx?.purpose).toBe('OTHR');
    expect(tx?.amount).toBe(100.5);
    expect(tx?.beneficiary.iban).toBe('IT60X0542811101000000123456');
  });

  it('lets a mapped per-row value override the default (uppercased)', () => {
    const [tx] = rowsToTransactions([row], { ...baseMap, purpose: 'scopo' }, 'OTHR');
    expect(tx?.purpose).toBe('SALA');
  });

  it('falls back to the default for an invalid per-row code', () => {
    const [tx] = rowsToTransactions(
      [{ ...row, scopo: 'salary' }],
      { ...baseMap, purpose: 'scopo' },
      'OTHR',
    );
    expect(tx?.purpose).toBe('OTHR');
  });

  it('falls back to the default for an empty per-row value', () => {
    const [tx] = rowsToTransactions(
      [{ ...row, scopo: '' }],
      { ...baseMap, purpose: 'scopo' },
      'SUPP',
    );
    expect(tx?.purpose).toBe('SUPP');
  });

  it('synthesises a remittance when no description column is mapped', () => {
    const [tx] = rowsToTransactions([row], { ...baseMap, remittanceInfo: '' }, 'OTHR');
    expect(tx?.remittanceInfo).toBe('Pagamento Mario Rossi');
  });

  it('includes the BIC only when a BIC column is mapped and non-empty', () => {
    const withBic = rowsToTransactions(
      [{ ...row, bicCol: 'UNCRITMM' }],
      { ...baseMap, beneficiaryBic: 'bicCol' },
      'OTHR',
    );
    expect(withBic[0]?.beneficiary.bic).toBe('UNCRITMM');
    expect(rowsToTransactions([row], baseMap, 'OTHR')[0]?.beneficiary.bic).toBeUndefined();
  });
});
