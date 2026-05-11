import { clear, del, get, set } from 'idb-keyval';
import { decrypt, encrypt } from './crypto';
import type { EncryptedBlob } from './crypto';

const NS = '@sepalo/v1/';

function key(k: string): string {
  return `${NS}${k}`;
}

export async function secureGet<T>(k: string, cryptoKey: CryptoKey): Promise<T | null> {
  const blob = await get<EncryptedBlob>(key(k));
  if (!blob) return null;
  const json = await decrypt(blob, cryptoKey);
  return JSON.parse(json) as T;
}

export async function secureSet<T>(k: string, value: T, cryptoKey: CryptoKey): Promise<void> {
  const blob = await encrypt(JSON.stringify(value), cryptoKey);
  await set(key(k), blob);
}

export async function secureDelete(k: string): Promise<void> {
  await del(key(k));
}

export async function clearAll(): Promise<void> {
  await clear();
}
