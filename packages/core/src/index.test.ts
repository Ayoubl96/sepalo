import { describe, expect, it } from 'vitest';
import { VERSION } from './index.js';

describe('@sepalo/core', () => {
  it('exports a version string', () => {
    expect(typeof VERSION).toBe('string');
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });
});
