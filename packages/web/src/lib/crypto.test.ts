import { describe, expect, it } from 'vitest';
import { decrypt, encrypt } from './crypto.js';

async function makeKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

describe('encrypt / decrypt', () => {
  it('round-trips a plain string', async () => {
    const key = await makeKey();
    const blob = await encrypt('hello world', key);
    await expect(decrypt(blob, key)).resolves.toBe('hello world');
  });

  it('round-trips a JSON-serialised object', async () => {
    const key = await makeKey();
    const payload = JSON.stringify({ name: 'Acme', iban: 'IT60X0542811101000000123456' });
    const blob = await encrypt(payload, key);
    const result = await decrypt(blob, key);
    expect(JSON.parse(result)).toEqual(JSON.parse(payload));
  });

  it('produces different ciphertext for same plaintext (random IV)', async () => {
    const key = await makeKey();
    const blob1 = await encrypt('same', key);
    const blob2 = await encrypt('same', key);
    expect(blob1.iv).not.toBe(blob2.iv);
    expect(blob1.ciphertext).not.toBe(blob2.ciphertext);
  });

  it('wrong key throws DOMException', async () => {
    const good = await makeKey();
    const bad = await makeKey();
    const blob = await encrypt('data', good);
    await expect(decrypt(blob, bad)).rejects.toThrow(DOMException);
  });

  it('tampered ciphertext throws DOMException', async () => {
    const key = await makeKey();
    const blob = await encrypt('data', key);
    const tampered = { ...blob, ciphertext: `${blob.ciphertext.slice(0, -4)}AAAA` };
    await expect(decrypt(tampered, key)).rejects.toThrow(DOMException);
  });

  it('round-trips an empty string', async () => {
    const key = await makeKey();
    const blob = await encrypt('', key);
    await expect(decrypt(blob, key)).resolves.toBe('');
  });

  it('round-trips unicode content', async () => {
    const key = await makeKey();
    const blob = await encrypt('Pagamento caffè — 100€', key);
    await expect(decrypt(blob, key)).resolves.toBe('Pagamento caffè — 100€');
  });
});
