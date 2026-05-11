'use client';

import { toBase64 } from '@/lib/base64';
import { deriveKey, encrypt, generateSalt } from '@/lib/crypto';
import { useAuthStore } from '@/stores/auth';
import { set } from 'idb-keyval';
import { useState } from 'react';
import { PinPad } from './PinPad';

type Phase = 'enter' | 'confirm';

const AUTH_CHECK_KEY = '@sepalo/v1/auth-check';
const AUTH_SALT_KEY = '@sepalo/v1/auth-salt';
const AUTH_TOKEN = 'sepalo-auth-v1';

export function PinSetup() {
  const [phase, setPhase] = useState<Phase>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState('');
  const setKey = useAuthStore((s) => s.setKey);

  async function handleComplete(pin: string) {
    if (phase === 'enter') {
      setFirstPin(pin);
      setDigits([]);
      setPhase('confirm');
      setError('');
      return;
    }

    if (pin !== firstPin) {
      setError('PINs do not match — try again.');
      setFirstPin('');
      setDigits([]);
      setPhase('enter');
      return;
    }

    const salt = generateSalt();
    const cryptoKey = await deriveKey(pin, salt);
    const blob = await encrypt(AUTH_TOKEN, cryptoKey);

    await set(AUTH_SALT_KEY, toBase64(salt));
    await set(AUTH_CHECK_KEY, blob);

    setKey(cryptoKey);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">Set your PIN</h1>
      <p className="text-sm text-muted max-w-xs">
        {phase === 'enter'
          ? 'Choose a 6-digit PIN to protect your data. It never leaves your device.'
          : 'Enter your PIN again to confirm.'}
      </p>
      {error && <p className="text-sm text-error">{error}</p>}
      <PinPad key={phase} digits={digits} onChange={setDigits} onComplete={handleComplete} />
    </div>
  );
}
