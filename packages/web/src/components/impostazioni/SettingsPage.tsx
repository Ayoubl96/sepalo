'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toBase64 } from '@/lib/base64';
import { fromBase64 } from '@/lib/base64';
import {
  AUTH_CHECK_KEY,
  AUTH_MODE_KEY,
  AUTH_SALT_KEY,
  AUTH_TOKEN,
  type AuthMode,
} from '@/lib/auth-keys';
import { decrypt, deriveKey, encrypt, generateSalt } from '@/lib/crypto';
import type { EncryptedBlob } from '@/lib/crypto';
import { clearAll, secureGet, secureSet } from '@/lib/storage';
import { useAuthStore } from '@/stores/auth';
import { ExternalLink, KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { get, set } from 'idb-keyval';
import { useEffect, useState } from 'react';
import { PinPad } from '../auth/PinPad';

const ENCRYPTED_KEYS = ['initiator-profile', 'address-book'] as const;

async function reEncryptAll(oldKey: CryptoKey, newKey: CryptoKey) {
  for (const k of ENCRYPTED_KEYS) {
    try {
      const data = await secureGet<unknown>(k, oldKey);
      if (data !== null) await secureSet(k, data, newKey);
    } catch {
      // key may not exist yet — skip silently
    }
  }
}

// ─── Change credential dialog ────────────────────────────────────────────────

type ChangePhase = 'verify' | 'enter-new' | 'confirm-new' | 'saving' | 'done';

function ChangeCredentialDialog({
  open,
  targetMode,
  currentMode,
  onClose,
}: {
  open: boolean;
  targetMode: AuthMode;
  currentMode: AuthMode;
  onClose: (newMode?: AuthMode) => void;
}) {
  const [phase, setPhase] = useState<ChangePhase>('verify');
  const [verifyDigits, setVerifyDigits] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [newDigits, setNewDigits] = useState<string[]>([]);
  const [confirmValue, setConfirmValue] = useState('');
  const [confirmDigits, setConfirmDigits] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [verifiedOldKey, setVerifiedOldKey] = useState<CryptoKey | null>(null);

  const { setKey } = useAuthStore();

  useEffect(() => {
    if (open) {
      setPhase('verify');
      setVerifyDigits([]);
      setNewValue('');
      setNewDigits([]);
      setConfirmValue('');
      setConfirmDigits([]);
      setError('');
      setVerifiedOldKey(null);
    }
  }, [open]);

  async function handleVerify(credential: string) {
    setError('');
    try {
      const saltB64 = await get<string>(AUTH_SALT_KEY);
      if (!saltB64) throw new Error('no salt');
      const salt = fromBase64(saltB64);
      const oldKey = await deriveKey(credential, salt);
      const blob = await get<EncryptedBlob>(AUTH_CHECK_KEY);
      if (!blob) throw new Error('no auth-check');
      const token = await decrypt(blob, oldKey);
      if (token !== AUTH_TOKEN) throw new Error('bad token');
      setVerifiedOldKey(oldKey);
      setPhase('enter-new');
    } catch {
      setError('Credenziale errata — riprova.');
      setVerifyDigits([]);
    }
  }

  async function handleSave(newCredential: string) {
    if (!verifiedOldKey) return;
    setPhase('saving');
    try {
      const newSalt = generateSalt();
      const newKey = await deriveKey(newCredential, newSalt);
      const blob = await encrypt(AUTH_TOKEN, newKey);

      await reEncryptAll(verifiedOldKey, newKey);
      await set(AUTH_SALT_KEY, toBase64(newSalt));
      await set(AUTH_CHECK_KEY, blob);
      await set(AUTH_MODE_KEY, targetMode);

      setKey(newKey);
      setPhase('done');
    } catch {
      setError('Qualcosa è andato storto. Riprova.');
      setPhase('verify');
    }
  }

  const isPin = (mode: AuthMode) => mode === 'pin';
  const minLen = targetMode === 'passphrase' ? 12 : 6;

  // Italian labels respect grammatical gender: PIN (masc.) / passphrase (fem.)
  const credLabel = (mode: AuthMode) => (isPin(mode) ? 'PIN' : 'passphrase');
  const updatedLabel = targetMode === 'pin' ? 'PIN aggiornato' : 'Passphrase aggiornata';
  const mismatchError =
    targetMode === 'pin'
      ? 'I PIN non corrispondono — riprova.'
      : 'Le passphrase non corrispondono — riprova.';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        {phase === 'verify' && (
          <>
            <DialogHeader>
              <DialogTitle>Conferma il {credLabel(currentMode)} attuale</DialogTitle>
              <DialogDescription>
                Inserisci il tuo {credLabel(currentMode)} per continuare.
              </DialogDescription>
            </DialogHeader>
            {error && <p className="text-sm text-error">{error}</p>}
            {isPin(currentMode) ? (
              <div className="flex justify-center py-2">
                <PinPad
                  key="verify"
                  digits={verifyDigits}
                  onChange={setVerifyDigits}
                  onComplete={handleVerify}
                />
              </div>
            ) : (
              <PassphraseField
                value={verifyDigits.join('')}
                onChange={(v) => setVerifyDigits(v.split(''))}
                onSubmit={handleVerify}
                placeholder="Passphrase attuale"
              />
            )}
          </>
        )}

        {phase === 'enter-new' && (
          <>
            <DialogHeader>
              <DialogTitle>
                {targetMode === currentMode
                  ? `Nuovo ${credLabel(targetMode)}`
                  : `Configura ${credLabel(targetMode)}`}
              </DialogTitle>
              <DialogDescription>
                {targetMode === 'passphrase'
                  ? 'Scegli una passphrase di almeno 12 caratteri. Una frase o sequenza di parole funziona bene.'
                  : 'Scegli un nuovo PIN di 6 cifre.'}
              </DialogDescription>
            </DialogHeader>
            {error && <p className="text-sm text-error">{error}</p>}
            {isPin(targetMode) ? (
              <div className="flex justify-center py-2">
                <PinPad
                  key="new"
                  digits={newDigits}
                  onChange={setNewDigits}
                  onComplete={(v) => {
                    setNewValue(v);
                    setNewDigits([]);
                    setPhase('confirm-new');
                    setError('');
                  }}
                />
              </div>
            ) : (
              <PassphraseField
                value={newValue}
                onChange={setNewValue}
                onSubmit={(v) => {
                  if (v.length < minLen) {
                    setError(`La passphrase deve essere di almeno ${minLen} caratteri.`);
                    return;
                  }
                  setNewValue(v);
                  setPhase('confirm-new');
                  setError('');
                }}
                placeholder={`Nuova passphrase (min ${minLen} car.)`}
              />
            )}
          </>
        )}

        {phase === 'confirm-new' && (
          <>
            <DialogHeader>
              <DialogTitle>Conferma {credLabel(targetMode)}</DialogTitle>
              <DialogDescription>
                Inserisci di nuovo il {credLabel(targetMode)} per confermare.
              </DialogDescription>
            </DialogHeader>
            {error && <p className="text-sm text-error">{error}</p>}
            {isPin(targetMode) ? (
              <div className="flex justify-center py-2">
                <PinPad
                  key="confirm"
                  digits={confirmDigits}
                  onChange={setConfirmDigits}
                  onComplete={(v) => {
                    if (v !== newValue) {
                      setError(mismatchError);
                      setConfirmDigits([]);
                      return;
                    }
                    handleSave(v);
                  }}
                />
              </div>
            ) : (
              <PassphraseField
                value={confirmValue}
                onChange={setConfirmValue}
                onSubmit={(v) => {
                  if (v !== newValue) {
                    setError(mismatchError);
                    setConfirmValue('');
                    return;
                  }
                  void handleSave(v);
                }}
                placeholder="Conferma passphrase"
              />
            )}
          </>
        )}

        {phase === 'saving' && (
          <div className="py-8 text-center text-sm text-muted">Ricifratura dei dati in corso…</div>
        )}

        {phase === 'done' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-accent">{updatedLabel}</DialogTitle>
              <DialogDescription>
                Tutti i dati sono stati ricifrati con il nuovo {credLabel(targetMode)}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => onClose(targetMode)}>Fatto</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Passphrase input helper ─────────────────────────────────────────────────

function PassphraseField({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit(value)}
          autoFocus
          className="pr-16"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-ink"
          tabIndex={-1}
        >
          <span className="text-xs">{show ? 'nascondi' : 'mostra'}</span>
        </button>
      </div>
      <Button onClick={() => onSubmit(value)} disabled={!value}>
        Continua
      </Button>
    </div>
  );
}

// ─── Reset device dialog ─────────────────────────────────────────────────────

const RESET_CONFIRM_WORD = 'REIMPOSTA';

function ResetDeviceDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const [resetting, setResetting] = useState(false);
  const { clearKey } = useAuthStore();

  useEffect(() => {
    if (open) setInput('');
  }, [open]);

  async function handleReset() {
    setResetting(true);
    await clearAll();
    clearKey();
    // PinGuard will show PinSetup automatically once cryptoKey is null and auth-salt is gone
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !resetting && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-error">Reimposta dispositivo</DialogTitle>
          <DialogDescription>
            Questa operazione elimina definitivamente PIN, profilo e rubrica da questo dispositivo.
            Non è reversibile.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">
            Scrivi{' '}
            <span className="font-mono font-semibold text-ink">{RESET_CONFIRM_WORD}</span> per
            confermare.
          </p>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={RESET_CONFIRM_WORD}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={resetting}>
            Annulla
          </Button>
          <Button
            variant="destructive"
            disabled={input !== RESET_CONFIRM_WORD || resetting}
            onClick={handleReset}
          >
            {resetting ? 'Reimpostazione…' : 'Reimposta dispositivo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('pin');
  const [changeOpen, setChangeOpen] = useState(false);
  const [targetMode, setTargetMode] = useState<AuthMode>('pin');
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    get<AuthMode>(AUTH_MODE_KEY).then((m) => {
      if (m) setAuthMode(m);
    });
  }, []);

  function openChange(mode: AuthMode) {
    setTargetMode(mode);
    setChangeOpen(true);
  }

  function handleChangeClose(newMode?: AuthMode) {
    setChangeOpen(false);
    if (newMode) setAuthMode(newMode);
  }

  const appVersion = process.env['NEXT_PUBLIC_APP_VERSION'] ?? '0.x.x';

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Impostazioni</h1>

      {/* Sicurezza */}
      <section className="rounded-xl border border-line bg-surface p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={16} className="text-muted-2" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-2">Sicurezza</h2>
        </div>

        {/* Change PIN / passphrase */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">
              {authMode === 'passphrase' ? 'Cambia passphrase' : 'Cambia PIN'}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {authMode === 'passphrase'
                ? 'Aggiorna la tua passphrase. Tutti i dati verranno ricifrati.'
                : 'Aggiorna il tuo PIN di 6 cifre. Tutti i dati verranno ricifrati.'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => openChange(authMode)}
          >
            Cambia
          </Button>
        </div>

        <hr className="border-line" />

        {/* Passphrase sicura */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-accent" />
              <p className="text-sm font-medium text-ink">Passphrase sicura</p>
              {authMode === 'passphrase' && (
                <span className="text-xs bg-accent/10 text-accent rounded px-1.5 py-0.5 font-medium">
                  Attiva
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5 max-w-xs">
              {authMode === 'passphrase'
                ? 'Stai usando una passphrase. Torna al PIN di 6 cifre se preferisci.'
                : 'Usa una passphrase (min 12 caratteri) per uno spazio di chiavi molto più ampio. Consigliata se altri hanno accesso fisico a questo dispositivo.'}
            </p>
          </div>
          <Button
            variant={authMode === 'passphrase' ? 'ghost' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() => openChange(authMode === 'passphrase' ? 'pin' : 'passphrase')}
          >
            {authMode === 'passphrase' ? 'Usa PIN' : 'Attiva'}
          </Button>
        </div>
      </section>

      {/* Zona pericolosa */}
      <section className="rounded-xl border border-error/30 bg-surface p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Trash2 size={16} className="text-error" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-error">
            Zona pericolosa
          </h2>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Reimposta dispositivo</p>
            <p className="text-xs text-muted mt-0.5">
              Elimina definitivamente PIN, profilo e rubrica da questo dispositivo.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={() => setResetOpen(true)}
          >
            Reimposta
          </Button>
        </div>
      </section>

      {/* Informazioni */}
      <section className="rounded-xl border border-line bg-surface p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-2">
            Informazioni
          </h2>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Versione</span>
          <span className="font-mono text-ink">{appVersion}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Licenza</span>
          <span className="text-ink">MIT</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Codice sorgente</span>
          <a
            href="https://github.com/Ayoubl96/sepalo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            GitHub
            <ExternalLink size={12} />
          </a>
        </div>
      </section>

      <ChangeCredentialDialog
        open={changeOpen}
        targetMode={targetMode}
        currentMode={authMode}
        onClose={handleChangeClose}
      />

      <ResetDeviceDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>
  );
}
