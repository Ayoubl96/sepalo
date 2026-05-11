import { create } from 'zustand';

interface AuthState {
  cryptoKey: CryptoKey | null;
  setKey: (key: CryptoKey) => void;
  clearKey: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  cryptoKey: null,
  setKey: (cryptoKey) => set({ cryptoKey }),
  clearKey: () => set({ cryptoKey: null }),
}));
