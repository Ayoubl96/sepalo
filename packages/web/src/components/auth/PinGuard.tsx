'use client';

import { AUTH_MODE_KEY, AUTH_SALT_KEY, type AuthMode } from '@/lib/auth-keys';
import { useAuthStore } from '@/stores/auth';
import { get } from 'idb-keyval';
import { useEffect, useState } from 'react';
import { PinPrompt } from './PinPrompt';
import { PinSetup } from './PinSetup';

type Status = 'loading' | 'setup' | 'prompt' | 'unlocked';

export function PinGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [saltB64, setSaltB64] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('pin');
  const cryptoKey = useAuthStore((s) => s.cryptoKey);

  useEffect(() => {
    if (cryptoKey) {
      setStatus('unlocked');
      return;
    }
    Promise.all([get<string>(AUTH_SALT_KEY), get<AuthMode>(AUTH_MODE_KEY)]).then(
      ([storedSalt, storedMode]) => {
        if (storedSalt) {
          setSaltB64(storedSalt);
          setAuthMode(storedMode ?? 'pin');
          setStatus('prompt');
        } else {
          setStatus('setup');
        }
      },
    );
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
        <PinPrompt saltB64={saltB64} authMode={authMode} onForgot={() => setStatus('setup')} />
      </div>
    );
  }

  return <>{children}</>;
}
