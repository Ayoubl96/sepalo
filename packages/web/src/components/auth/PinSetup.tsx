'use client';

import { AUTH_CHECK_KEY, AUTH_SALT_KEY, AUTH_TOKEN } from '@/lib/auth-keys';
import { toBase64 } from '@/lib/base64';
import { deriveKey, encrypt, generateSalt } from '@/lib/crypto';
import { saveSession } from '@/lib/session';
import { useAuthStore } from '@/stores/auth';
import { set } from 'idb-keyval';
import { useState } from 'react';
import { PinPad } from './PinPad';

type Phase = 'enter' | 'confirm';

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
      setError('I PIN non corrispondono — riprova.');
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
    await saveSession(cryptoKey);

    setKey(cryptoKey);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">Crea il tuo PIN</h1>
      <p className="text-sm text-muted max-w-xs">
        {phase === 'enter'
          ? 'Scegli un PIN di 4 cifre per proteggere i tuoi dati. Non lascia mai il dispositivo.'
          : 'Inserisci di nuovo il PIN per confermare.'}
      </p>
      {error && <p className="text-sm text-error">{error}</p>}
      <PinPad key={phase} digits={digits} onChange={setDigits} onComplete={handleComplete} />
    </div>
  );
}
