import { describe, expect, it } from 'vitest';
import { decrypt, deriveKey, encrypt, generateSalt } from './crypto.js';

describe('generateSalt', () => {
  it('returns a 16-byte Uint8Array', () => {
    const salt = generateSalt();
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.byteLength).toBe(16);
  });

  it('produces different values on each call', () => {
    const a = generateSalt();
    const b = generateSalt();
    expect(a).not.toEqual(b);
  });
});

describe('deriveKey', () => {
  it('returns a CryptoKey', async () => {
    const salt = generateSalt();
    const key = await deriveKey('123456', salt);
    expect(key).toBeInstanceOf(CryptoKey);
    expect(key.algorithm.name).toBe('AES-GCM');
    expect(key.usages).toContain('encrypt');
    expect(key.usages).toContain('decrypt');
  });

  it('same PIN + same salt → same effective key (round-trip succeeds)', async () => {
    const salt = generateSalt();
    const key1 = await deriveKey('123456', salt);
    const key2 = await deriveKey('123456', salt);
    const blob = await encrypt('hello', key1);
    await expect(decrypt(blob, key2)).resolves.toBe('hello');
  });

  it('different salts → different keys (decrypt fails)', async () => {
    const key1 = await deriveKey('123456', generateSalt());
    const key2 = await deriveKey('123456', generateSalt());
    const blob = await encrypt('hello', key1);
    await expect(decrypt(blob, key2)).rejects.toThrow();
  });

  it('wrong PIN → decrypt fails', async () => {
    const salt = generateSalt();
    const key1 = await deriveKey('123456', salt);
    const key2 = await deriveKey('999999', salt);
    const blob = await encrypt('secret', key1);
    await expect(decrypt(blob, key2)).rejects.toThrow();
  });
});

describe('encrypt / decrypt', () => {
  it('round-trips a plain string', async () => {
    const key = await deriveKey('pin', generateSalt());
    const blob = await encrypt('hello world', key);
    await expect(decrypt(blob, key)).resolves.toBe('hello world');
  });

  it('round-trips a JSON-serialised object', async () => {
    const key = await deriveKey('pin', generateSalt());
    const payload = JSON.stringify({ name: 'Acme', iban: 'IT60X0542811101000000123456' });
    const blob = await encrypt(payload, key);
    const result = await decrypt(blob, key);
    expect(JSON.parse(result)).toEqual(JSON.parse(payload));
  });

  it('produces different ciphertext for same plaintext (random IV)', async () => {
    const key = await deriveKey('pin', generateSalt());
    const blob1 = await encrypt('same', key);
    const blob2 = await encrypt('same', key);
    expect(blob1.iv).not.toBe(blob2.iv);
    expect(blob1.ciphertext).not.toBe(blob2.ciphertext);
  });

  it('wrong key throws DOMException', async () => {
    const salt = generateSalt();
    const good = await deriveKey('correct', salt);
    const bad = await deriveKey('wrong', salt);
    const blob = await encrypt('data', good);
    await expect(decrypt(blob, bad)).rejects.toThrow(DOMException);
  });

  it('tampered ciphertext throws DOMException', async () => {
    const key = await deriveKey('pin', generateSalt());
    const blob = await encrypt('data', key);
    const tampered = { ...blob, ciphertext: `${blob.ciphertext.slice(0, -4)}AAAA` };
    await expect(decrypt(tampered, key)).rejects.toThrow(DOMException);
  });

  it('round-trips an empty string', async () => {
    const key = await deriveKey('pin', generateSalt());
    const blob = await encrypt('', key);
    await expect(decrypt(blob, key)).resolves.toBe('');
  });

  it('round-trips unicode content', async () => {
    const key = await deriveKey('pin', generateSalt());
    const blob = await encrypt('Pagamento caffè — 100€', key);
    await expect(decrypt(blob, key)).resolves.toBe('Pagamento caffè — 100€');
  });
});
