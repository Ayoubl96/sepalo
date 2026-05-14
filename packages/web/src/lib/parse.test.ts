import { describe, expect, it } from 'vitest';
import { parseAmount } from './parse.js';

describe('parseAmount', () => {
  it('parses a plain decimal', () => {
    expect(parseAmount('123.45')).toBe(123.45);
  });

  it('accepts comma as decimal separator (IT locale)', () => {
    expect(parseAmount('123,45')).toBe(123.45);
  });

  it('strips currency symbols and whitespace', () => {
    expect(parseAmount('€ 123.45')).toBe(123.45);
  });

  it('converts a negative amount to positive (debit normalisation)', () => {
    expect(parseAmount('-100.50')).toBe(100.5);
  });

  it('converts a negative IT-locale amount to positive', () => {
    expect(parseAmount('-123,45')).toBe(123.45);
  });

  it('converts a negative amount with currency symbol to positive', () => {
    expect(parseAmount('-€ 250,00')).toBe(250);
  });

  it('rounds to 2 decimals', () => {
    expect(parseAmount('100.005')).toBe(100.01);
    expect(parseAmount('-100.005')).toBe(100.01);
  });

  it('returns 0 for non-numeric input', () => {
    expect(parseAmount('abc')).toBe(0);
    expect(parseAmount('')).toBe(0);
  });

  it('preserves positive zero (caller validates positivity)', () => {
    expect(parseAmount('0')).toBe(0);
    expect(parseAmount('-0')).toBe(0);
  });
});
