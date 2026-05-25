'use client';

import { secureDelete, secureGet, secureSet } from '@/lib/storage';
import type { Initiator } from '@sepalo/core';
import { useEffect, useState } from 'react';

const PROFILE_KEY = 'initiator-profile';

export function useProfile() {
  const [profile, setProfile] = useState<Initiator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    secureGet<Initiator>(PROFILE_KEY)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(data: Initiator): Promise<void> {
    await secureSet(PROFILE_KEY, data);
    setProfile(data);
  }

  async function clearProfile(): Promise<void> {
    await secureDelete(PROFILE_KEY);
    setProfile(null);
  }

  return { profile, loading, saveProfile, clearProfile };
}
