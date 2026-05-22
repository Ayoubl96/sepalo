'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AUTH_CHECK_KEY, AUTH_SALT_KEY, AUTH_TOKEN, type AuthMode } from '@/lib/auth-keys';
import { fromBase64 } from '@/lib/base64';
import { decrypt, deriveKey } from '@/lib/crypto';
import type { EncryptedBlob } from '@/lib/crypto';
import { useAuthStore } from '@/stores/auth';
import { del, get } from 'idb-keyval';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PinPad } from './PinPad';

function formatCountdown(s: number): string {
  if (s >= 60) return `${Math.ceil(s / 60)} min`;
  return `${s}s`;
}

interface PinPromptProps {
  saltB64: string;
  authMode?: AuthMode;
  onForgot: () => void;
}

export function PinPrompt({ saltB64, authMode = 'pin', onForgot }: PinPromptProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { failedAttempts, lockedUntil, setKey, recordFailure, resetAttempts } = useAuthStore();

  useEffect(() => {
    if (!lockedUntil) {
      setCountdown(0);
      return;
    }
    const deadline = lockedUntil;
    const update = () => {
      const remaining = Math.ceil((deadline - Date.now()) / 1_000);
      setCountdown(remaining > 0 ? remaining : 0);
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = countdown > 0;

  async function attemptUnlock(credential: string) {
    if (isLocked || !credential) return;

    const salt = fromBase64(saltB64);
    const cryptoKey = await deriveKey(credential, salt);
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
      setError(authMode === 'passphrase' ? 'Passphrase errata.' : 'PIN errato.');
      setDigits([]);
      setPassphrase('');
    }
  }

  async function handleForgot() {
    await del(AUTH_CHECK_KEY);
    await del(AUTH_SALT_KEY);
    resetAttempts();
    onForgot();
  }

  const lockMessage = isLocked ? `Troppi tentativi — attendi ${formatCountdown(countdown)}` : null;
  const attemptSuffix = failedAttempts >= 2 ? ` (tentativo ${failedAttempts})` : '';
  const errorMessage = !isLocked && error ? `${error}${attemptSuffix}` : null;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">
        {authMode === 'passphrase' ? 'Inserisci la passphrase' : 'Inserisci il PIN'}
      </h1>
      <p className="text-sm text-muted max-w-xs">
        {authMode === 'passphrase'
          ? 'Inserisci la passphrase per sbloccare i dati.'
          : 'Inserisci il PIN a 6 cifre per sbloccare i dati.'}
      </p>

      {lockMessage && <p className="text-sm text-warn font-medium">{lockMessage}</p>}
      {errorMessage && <p className="text-sm text-error">{errorMessage}</p>}

      {authMode === 'passphrase' ? (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="relative">
            <Input
              type={showPassphrase ? 'text' : 'password'}
              placeholder="La tua passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') attemptUnlock(passphrase);
              }}
              disabled={isLocked}
              autoFocus
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassphrase((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-ink"
              tabIndex={-1}
            >
              {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button onClick={() => attemptUnlock(passphrase)} disabled={isLocked || !passphrase}>
            Sblocca
          </Button>
        </div>
      ) : (
        <PinPad
          key={failedAttempts}
          digits={digits}
          onChange={setDigits}
          onComplete={attemptUnlock}
          disabled={isLocked}
        />
      )}

      <Button variant="ghost" size="sm" className="text-muted text-xs mt-2" onClick={handleForgot}>
        {authMode === 'passphrase'
          ? 'Passphrase dimenticata? Reimposta i dati'
          : 'PIN dimenticato? Reimposta i dati'}
      </Button>
    </div>
  );
}
