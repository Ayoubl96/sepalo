'use client';

import { secureGet, secureSet } from '@/lib/storage';
import { useAuthStore } from '@/stores/auth';
import type { Beneficiary } from '@sepalo/core';
import { useEffect, useState } from 'react';

export type BookEntry = Beneficiary & { id: string };

const BOOK_KEY = 'address-book';

export function useAddressBook() {
  const cryptoKey = useAuthStore((s) => s.cryptoKey);
  const [entries, setEntries] = useState<BookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cryptoKey) return;
    secureGet<BookEntry[]>(BOOK_KEY, cryptoKey)
      .then((data) => setEntries(data ?? []))
      .finally(() => setLoading(false));
  }, [cryptoKey]);

  async function persist(next: BookEntry[]) {
    if (!cryptoKey) return;
    await secureSet(BOOK_KEY, next, cryptoKey);
    setEntries(next);
  }

  async function addEntry(b: Beneficiary) {
    await persist([...entries, { ...b, id: crypto.randomUUID() }]);
  }

  async function updateEntry(id: string, b: Beneficiary) {
    await persist(entries.map((e) => (e.id === id ? { ...b, id } : e)));
  }

  async function removeEntry(id: string) {
    await persist(entries.filter((e) => e.id !== id));
  }

  return { entries, loading, addEntry, updateEntry, removeEntry };
}
