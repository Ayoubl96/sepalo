import { describe, expect, it } from 'vitest';
import { validateCodiceFiscale, validatePartitaIva, validateFiscalIdentifier } from './fiscal-code.js';

describe('validateCodiceFiscale', () => {
  it('accepts a valid codice fiscale', () => {
    expect(validateCodiceFiscale('RSSMRA80A01H501U')).toBe(true);
  });

  it('accepts with leading/trailing spaces', () => {
    expect(validateCodiceFiscale('  RSSMRA80A01H501U  ')).toBe(true);
  });

  it('accepts lowercase (normalised internally)', () => {
    expect(validateCodiceFiscale('rssmra80a01h501u')).toBe(true);
  });

  it('rejects wrong control character', () => {
    expect(validateCodiceFiscale('RSSMRA80A01H501A')).toBe(false);
  });

  it('rejects too short', () => {
    expect(validateCodiceFiscale('RSSMRA80A01H50')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(validateCodiceFiscale('RSSMRA80A01H501!')).toBe(false);
  });
});

describe('validatePartitaIva', () => {
  it('accepts a valid P.IVA', () => {
    expect(validatePartitaIva('12345678903')).toBe(true);
  });

  it('accepts all-zero P.IVA (mathematically valid checksum)', () => {
    expect(validatePartitaIva('00000000000')).toBe(true);
  });

  it('rejects fewer than 11 digits', () => {
    expect(validatePartitaIva('1234567890')).toBe(false);
  });

  it('rejects more than 11 digits', () => {
    expect(validatePartitaIva('123456789031')).toBe(false);
  });

  it('rejects letters', () => {
    expect(validatePartitaIva('1234567890A')).toBe(false);
  });

  it('rejects wrong check digit', () => {
    expect(validatePartitaIva('12345678901')).toBe(false);
  });
});

describe('validateFiscalIdentifier', () => {
  it('accepts a valid CF', () => {
    expect(validateFiscalIdentifier('RSSMRA80A01H501U')).toBe(true);
  });

  it('accepts a valid P.IVA', () => {
    expect(validateFiscalIdentifier('12345678903')).toBe(true);
  });

  it('rejects neither CF nor PIVA', () => {
    expect(validateFiscalIdentifier('NOTVALID')).toBe(false);
  });
});
