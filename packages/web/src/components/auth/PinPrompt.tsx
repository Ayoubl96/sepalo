'use client';

import { Button } from '@/components/ui/button';
import { fromBase64 } from '@/lib/base64';
import { decrypt, deriveKey } from '@/lib/crypto';
import type { EncryptedBlob } from '@/lib/crypto';
import { useAuthStore } from '@/stores/auth';
import { del, get } from 'idb-keyval';
import { useEffect, useState } from 'react';
import { PinPad } from './PinPad';

const AUTH_CHECK_KEY = '@sepalo/v1/auth-check';
const AUTH_SALT_KEY = '@sepalo/v1/auth-salt';
const AUTH_TOKEN = 'sepalo-auth-v1';

interface PinPromptProps {
  saltB64: string;
  onForgot: () => void;
}

export function PinPrompt({ saltB64, onForgot }: PinPromptProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { failedAttempts, lockedUntil, setKey, recordFailure, resetAttempts } = useAuthStore();

  useEffect(() => {
    if (!lockedUntil) {
      setCountdown(0);
      return;
    }
    const deadline = lockedUntil;
    function tick() {
      const remaining = Math.ceil((deadline - Date.now()) / 1_000);
      if (remaining <= 0) {
        setCountdown(0);
      } else {
        setCountdown(remaining);
      }
    }
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = countdown > 0;

  async function handleComplete(pin: string) {
    if (isLocked) return;

    const salt = fromBase64(saltB64);
    const cryptoKey = await deriveKey(pin, salt);

    const blob = await get<EncryptedBlob>(AUTH_CHECK_KEY);
    if (!blob) return;

    try {
      const token = await decrypt(blob, cryptoKey);
      if (token === AUTH_TOKEN) {
        resetAttempts();
        setKey(cryptoKey);
      } else {
        throw new Error('bad token');
      }
    } catch {
      recordFailure();
      setError('Wrong PIN.');
      setDigits([]);
    }
  }

  async function handleForgot() {
    await del(AUTH_CHECK_KEY);
    await del(AUTH_SALT_KEY);
    resetAttempts();
    onForgot();
  }

  function formatCountdown(s: number): string {
    if (s >= 60) return `${Math.ceil(s / 60)} min`;
    return `${s}s`;
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">Enter your PIN</h1>
      <p className="text-sm text-muted max-w-xs">Enter your 6-digit PIN to unlock your data.</p>

      {isLocked ? (
        <p className="text-sm text-warn font-medium">
          Too many attempts — wait {formatCountdown(countdown)}
        </p>
      ) : error ? (
        <p className="text-sm text-error">
          {error}
          {failedAttempts >= 2 && ` (attempt ${failedAttempts})`}
        </p>
      ) : null}

      <PinPad
        key={failedAttempts}
        digits={digits}
        onChange={setDigits}
        onComplete={handleComplete}
        disabled={isLocked}
      />

      <Button variant="ghost" size="sm" className="text-muted text-xs mt-2" onClick={handleForgot}>
        Forgot PIN? Reset data
      </Button>
    </div>
  );
}
