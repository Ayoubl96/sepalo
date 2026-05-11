import { describe, expect, it } from 'vitest';
import { validateIban } from './iban.js';

describe('validateIban — valid IBANs', () => {
  it('IT: valid Italian IBAN', () => {
    const r = validateIban('IT60X0542811101000000123456');
    expect(r.valid).toBe(true);
    expect(r.country).toBe('IT');
    expect(r.isItalian).toBe(true);
    expect(r.isSepa).toBe(true);
  });

  it('IT: accepts IBAN with spaces', () => {
    expect(validateIban('IT60 X054 2811 1010 0000 0123 456').valid).toBe(true);
  });

  it('DE: valid German IBAN', () => {
    const r = validateIban('DE89370400440532013000');
    expect(r.valid).toBe(true);
    expect(r.country).toBe('DE');
    expect(r.isSepa).toBe(true);
    expect(r.isItalian).toBe(false);
  });

  it('FR: valid French IBAN', () => {
    const r = validateIban('FR7630006000011234567890189');
    expect(r.valid).toBe(true);
    expect(r.isSepa).toBe(true);
  });

  it('GB: valid UK IBAN', () => {
    const r = validateIban('GB29NWBK60161331926819');
    expect(r.valid).toBe(true);
    expect(r.isSepa).toBe(true);
  });

  it('SM: valid San Marino IBAN (SEPA)', () => {
    const r = validateIban('SM86U0322509800000000270100');
    expect(r.valid).toBe(true);
    expect(r.isSepa).toBe(true);
  });

  it('ES: valid Spanish IBAN', () => {
    const r = validateIban('ES9121000418450200051332');
    expect(r.valid).toBe(true);
    expect(r.isSepa).toBe(true);
  });

  it('BE: valid Belgian IBAN', () => {
    const r = validateIban('BE68539007547034');
    expect(r.valid).toBe(true);
    expect(r.isSepa).toBe(true);
  });

  it('US: non-SEPA country code unknown', () => {
    const r = validateIban('US12345678901234567890');
    expect(r.valid).toBe(false);
  });

  it('BR: extra-SEPA IBAN (known length, not SEPA)', () => {
    const r = validateIban('BR9700360305000010009795493P1');
    expect(r.valid).toBe(true);
    expect(r.isSepa).toBe(false);
  });
});

describe('validateIban — invalid IBANs', () => {
  it('rejects wrong checksum digits', () => {
    const r = validateIban('IT61X0542811101000000123456');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/checksum/i);
  });

  it('rejects wrong length for IT (too short)', () => {
    const r = validateIban('IT60X054281110100000012345');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/length/i);
  });

  it('rejects wrong length for IT (too long)', () => {
    const r = validateIban('IT60X05428111010000001234567');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/length/i);
  });

  it('rejects empty string', () => {
    expect(validateIban('').valid).toBe(false);
  });

  it('rejects invalid characters', () => {
    const r = validateIban('IT60X054281110100000012345!');
    expect(r.valid).toBe(false);
  });

  it('rejects invalid country code (starts with digits)', () => {
    const r = validateIban('1T60X0542811101000000123456');
    expect(r.valid).toBe(false);
  });

  it('rejects wrong Italian CIN (valid mod-97, invalid CIN)', () => {
    // IT65A... has valid check digits but CIN=A is wrong for this ABI/CAB/account
    const r = validateIban('IT65A0542811101000000123456');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/CIN/i);
  });

  it('rejects all-zero IBAN (mod-97 failure)', () => {
    const r = validateIban('DE00000000000000000000');
    expect(r.valid).toBe(false);
  });

  it('rejects unknown country code', () => {
    const r = validateIban('XX12345678901234');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/Unknown country/i);
  });

  it('rejects lowercase input with invalid chars after normalisation check', () => {
    // IBAN with special char that survives toUpperCase
    const r = validateIban('IT60X054281110100000012345€');
    expect(r.valid).toBe(false);
  });
});
