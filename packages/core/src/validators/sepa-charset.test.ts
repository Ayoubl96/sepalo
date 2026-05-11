import { describe, expect, it } from 'vitest';
import { sanitize, isSepaCompliant } from './sepa-charset.js';

describe('isSepaCompliant', () => {
  it('accepts plain ASCII letters and digits', () => {
    expect(isSepaCompliant('Invoice 2024-001')).toBe(true);
  });

  it('accepts all SEPA special characters', () => {
    expect(isSepaCompliant('/-?:().,\'+')).toBe(true);
  });

  it('rejects accented characters', () => {
    expect(isSepaCompliant('Pagamento caffè')).toBe(false);
  });

  it('rejects emoji', () => {
    expect(isSepaCompliant('Payment 🎉')).toBe(false);
  });

  it('rejects euro sign', () => {
    expect(isSepaCompliant('Amount: 100€')).toBe(false);
  });

  it('accepts empty string', () => {
    expect(isSepaCompliant('')).toBe(true);
  });
});

describe('sanitize', () => {
  it('returns original text unchanged if already compliant', () => {
    const result = sanitize('Invoice 2024-001');
    expect(result.sanitized).toBe('Invoice 2024-001');
    expect(result.replacements).toHaveLength(0);
  });

  it('substitutes accented vowels', () => {
    const result = sanitize('Pagamento caffè');
    expect(result.sanitized).toBe('Pagamento caffe');
    expect(result.replacements).toHaveLength(1);
    expect(result.replacements[0]).toMatchObject({ original: 'è', replacement: 'e' });
  });

  it('substitutes multiple accents', () => {
    const result = sanitize('àèìòù');
    expect(result.sanitized).toBe('aeiou');
    expect(result.replacements).toHaveLength(5);
  });

  it('substitutes ç with c', () => {
    const result = sanitize('François');
    expect(result.sanitized).toBe('Francois');
  });

  it('replaces unmappable characters with space', () => {
    const result = sanitize('100€');
    expect(result.sanitized).toBe('100 ');
    expect(result.replacements[0]).toMatchObject({ original: '€', replacement: ' ' });
  });

  it('records position correctly', () => {
    const result = sanitize('ABCàDEF');
    expect(result.replacements[0]?.position).toBe(3);
  });

  it('handles uppercase accents', () => {
    const result = sanitize('ÉÀÜÑ');
    expect(result.sanitized).toBe('EAUN');
  });
});
