import { describe, expect, it } from 'vitest';
import { getAbiName, validateAbi } from './abi.js';
import { extractAbiFromIban } from '../utils/iban-to-abi.js';

describe('validateAbi', () => {
  it('accepts a known ABI code', () => {
    expect(validateAbi('02008')).toBe(true);
  });

  it('accepts another known ABI', () => {
    expect(validateAbi('05428')).toBe(true);
  });

  it('rejects an ABI not in the list', () => {
    expect(validateAbi('99999')).toBe(false);
  });

  it('rejects fewer than 5 digits', () => {
    expect(validateAbi('0200')).toBe(false);
  });

  it('rejects more than 5 digits', () => {
    expect(validateAbi('020081')).toBe(false);
  });

  it('rejects letters in ABI', () => {
    expect(validateAbi('0200A')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateAbi('')).toBe(false);
  });
});

describe('getAbiName', () => {
  it('returns bank name for known ABI', () => {
    expect(getAbiName('02008')).toBe('UniCredit S.p.A.');
  });

  it('returns bank name for Intesa Sanpaolo', () => {
    expect(getAbiName('03069')).toBe('Intesa Sanpaolo S.p.A.');
  });

  it('returns undefined for unknown ABI', () => {
    expect(getAbiName('99999')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getAbiName('')).toBeUndefined();
  });
});

describe('extractAbiFromIban', () => {
  it('extracts ABI from a valid Italian IBAN', () => {
    expect(extractAbiFromIban('IT60X0542811101000000123456')).toBe('05428');
  });

  it('extracts ABI from IBAN with spaces', () => {
    expect(extractAbiFromIban('IT60 X054 2811 1010 0000 0123 456')).toBe('05428');
  });

  it('extracts ABI for UniCredit', () => {
    expect(extractAbiFromIban('IT40F0200811101000000123456')).toBe('02008');
  });

  it('returns null for non-Italian IBAN', () => {
    expect(extractAbiFromIban('DE89370400440532013000')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractAbiFromIban('')).toBeNull();
  });

  it('returns null for Italian IBAN with wrong length', () => {
    expect(extractAbiFromIban('IT60X054281110100000012345')).toBeNull();
  });
});
