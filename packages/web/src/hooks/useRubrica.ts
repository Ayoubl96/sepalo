'use client';

import { secureGet, secureSet } from '@/lib/storage';
import { useAuthStore } from '@/stores/auth';
import type { Beneficiary } from '@sepalo/core';
import { useEffect, useState } from 'react';

export type VoceRubrica = Beneficiary & { id: string };

const CHIAVE_RUBRICA = 'address-book';

export function useRubrica() {
  const cryptoKey = useAuthStore((s) => s.cryptoKey);
  const [entries, setEntries] = useState<VoceRubrica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cryptoKey) return;
    secureGet<VoceRubrica[]>(CHIAVE_RUBRICA, cryptoKey)
      .then((data) => setEntries(data ?? []))
      .finally(() => setLoading(false));
  }, [cryptoKey]);

  async function persist(next: VoceRubrica[]) {
    if (!cryptoKey) return;
    await secureSet(CHIAVE_RUBRICA, next, cryptoKey);
    setEntries(next);
  }

  async function aggiungiVoce(b: Beneficiary) {
    await persist([...entries, { ...b, id: crypto.randomUUID() }]);
  }

  async function aggiornaVoce(id: string, b: Beneficiary) {
    await persist(entries.map((e) => (e.id === id ? { ...b, id } : e)));
  }

  async function rimuoviVoce(id: string) {
    await persist(entries.filter((e) => e.id !== id));
  }

  return { entries, loading, aggiungiVoce, aggiornaVoce, rimuoviVoce };
}
