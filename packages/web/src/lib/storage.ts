import { clear, del, get, set } from 'idb-keyval';
import { decrypt, encrypt } from './crypto';
import type { EncryptedBlob } from './crypto';
import { getOrCreateDeviceKey } from './device-key';

const NS = '@sepalo/v1/';

function nsKey(k: string): string {
  return `${NS}${k}`;
}

export async function secureGet<T>(k: string): Promise<T | null> {
  const key = await getOrCreateDeviceKey();
  const blob = await get<EncryptedBlob>(nsKey(k));
  if (!blob) return null;
  const json = await decrypt(blob, key);
  return JSON.parse(json) as T;
}

export async function secureSet<T>(k: string, value: T): Promise<void> {
  const key = await getOrCreateDeviceKey();
  const blob = await encrypt(JSON.stringify(value), key);
  await set(nsKey(k), blob);
}

export async function secureDelete(k: string): Promise<void> {
  await del(nsKey(k));
}

export async function clearAll(): Promise<void> {
  await clear();
}
