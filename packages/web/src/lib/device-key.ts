import { get, set } from 'idb-keyval';

const DEVICE_KEY_IDB = '@sepalo/v1/device-key';

export async function getOrCreateDeviceKey(): Promise<CryptoKey> {
  const stored = await get<CryptoKey>(DEVICE_KEY_IDB);
  if (stored) return stored;
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
  await set(DEVICE_KEY_IDB, key);
  return key;
}
