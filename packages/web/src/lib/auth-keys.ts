export const AUTH_CHECK_KEY = '@sepalo/v1/auth-check';
export const AUTH_SALT_KEY = '@sepalo/v1/auth-salt';
export const AUTH_MODE_KEY = '@sepalo/v1/auth-mode';
export const AUTH_SESSION_KEY = '@sepalo/v1/auth-session';
export const AUTH_TOKEN = 'sepalo-auth-v1';
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type AuthMode = 'pin' | 'passphrase';
