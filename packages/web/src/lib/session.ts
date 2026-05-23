import { del, get, set } from 'idb-keyval';
import { AUTH_SESSION_KEY, SESSION_TTL_MS } from './auth-keys';

interface AuthSession {
  key: CryptoKey;
  expiresAt: number;
}

export async function saveSession(key: CryptoKey): Promise<void> {
  await set(AUTH_SESSION_KEY, { key, expiresAt: Date.now() + SESSION_TTL_MS });
}

export async function loadSession(): Promise<CryptoKey | null> {
  const session = await get<AuthSession>(AUTH_SESSION_KEY);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    await del(AUTH_SESSION_KEY);
    return null;
  }
  return session.key;
}

export async function clearSession(): Promise<void> {
  await del(AUTH_SESSION_KEY);
}
