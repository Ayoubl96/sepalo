import { describe, expect, it } from 'vitest';
import { validateCuc } from './cuc.js';

describe('validateCuc', () => {
  it('accepts 8 uppercase letters', () => {
    expect(validateCuc('ABCDEFGH')).toBe(true);
  });

  it('accepts 8 digits', () => {
    expect(validateCuc('12345678')).toBe(true);
  });

  it('accepts mixed uppercase letters and digits', () => {
    expect(validateCuc('ABC12345')).toBe(true);
  });

  it('rejects fewer than 8 characters', () => {
    expect(validateCuc('ABC123')).toBe(false);
  });

  it('rejects more than 8 characters', () => {
    expect(validateCuc('ABC123456')).toBe(false);
  });

  it('rejects lowercase letters', () => {
    expect(validateCuc('abc12345')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(validateCuc('ABC1234!')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateCuc('')).toBe(false);
  });
});
