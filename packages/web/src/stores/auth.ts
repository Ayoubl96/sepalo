import { create } from 'zustand';

const COOLDOWNS_MS = [0, 1_000, 5_000, 30_000, 300_000, 3_600_000];

interface AuthState {
  cryptoKey: CryptoKey | null;
  failedAttempts: number;
  lockedUntil: number | null;
  setKey: (key: CryptoKey) => void;
  clearKey: () => void;
  recordFailure: () => void;
  resetAttempts: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  cryptoKey: null,
  failedAttempts: 0,
  lockedUntil: null,
  setKey: (cryptoKey) => set({ cryptoKey }),
  clearKey: () => set({ cryptoKey: null }),
  recordFailure: () => {
    const next = get().failedAttempts + 1;
    const cooldownMs = COOLDOWNS_MS[Math.min(next, COOLDOWNS_MS.length - 1)] ?? 0;
    const lockedUntil = cooldownMs > 0 ? Date.now() + cooldownMs : null;
    set({ failedAttempts: next, lockedUntil });
  },
  resetAttempts: () => set({ failedAttempts: 0, lockedUntil: null }),
}));
