'use client';

import { useAuthStore } from '@/stores/auth';
import { get } from 'idb-keyval';
import { useEffect, useState } from 'react';
import { PinPrompt } from './PinPrompt';
import { PinSetup } from './PinSetup';

type Status = 'loading' | 'setup' | 'prompt' | 'unlocked';

const AUTH_SALT_KEY = '@sepalo/v1/auth-salt';

export function PinGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [saltB64, setSaltB64] = useState('');
  const cryptoKey = useAuthStore((s) => s.cryptoKey);

  useEffect(() => {
    if (cryptoKey) {
      setStatus('unlocked');
      return;
    }
    get<string>(AUTH_SALT_KEY).then((stored) => {
      if (stored) {
        setSaltB64(stored);
        setStatus('prompt');
      } else {
        setStatus('setup');
      }
    });
  }, [cryptoKey]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted text-sm">Loading…</span>
      </div>
    );
  }

  if (status === 'setup') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <PinSetup />
      </div>
    );
  }

  if (status === 'prompt') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <PinPrompt saltB64={saltB64} onForgot={() => setStatus('setup')} />
      </div>
    );
  }

  return <>{children}</>;
}
