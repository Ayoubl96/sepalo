'use client';

import { secureGet, secureSet } from '@/lib/storage';
import { useAuthStore } from '@/stores/auth';
import type { Initiator } from '@sepalo/core';
import { useEffect, useState } from 'react';

const PROFILE_KEY = 'initiator-profile';

export function useProfile() {
  const cryptoKey = useAuthStore((s) => s.cryptoKey);
  const [profile, setProfile] = useState<Initiator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cryptoKey) return;
    secureGet<Initiator>(PROFILE_KEY, cryptoKey)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [cryptoKey]);

  async function saveProfile(data: Initiator): Promise<void> {
    if (!cryptoKey) return;
    await secureSet(PROFILE_KEY, data, cryptoKey);
    setProfile(data);
  }

  return { profile, loading, saveProfile };
}
