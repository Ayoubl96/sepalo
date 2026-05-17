'use client';

import { secureGet, secureSet } from '@/lib/storage';
import { useAuthStore } from '@/stores/auth';
import type { Initiator } from '@sepalo/core';
import { useEffect, useState } from 'react';

const CHIAVE_PROFILO = 'initiator-profile';

export function useProfilo() {
  const cryptoKey = useAuthStore((s) => s.cryptoKey);
  const [profile, setProfile] = useState<Initiator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cryptoKey) return;
    secureGet<Initiator>(CHIAVE_PROFILO, cryptoKey)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [cryptoKey]);

  async function salvaProfilo(data: Initiator): Promise<void> {
    if (!cryptoKey) return;
    await secureSet(CHIAVE_PROFILO, data, cryptoKey);
    setProfile(data);
  }

  return { profile, loading, salvaProfilo };
}
