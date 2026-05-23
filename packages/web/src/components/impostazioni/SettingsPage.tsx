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
import { clearAll } from '@/lib/storage';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (open) setInput('');
  }, [open]);

  async function handleReset() {
    setResetting(true);
    await clearAll();
    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !resetting && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-error">Reimposta dispositivo</DialogTitle>
          <DialogDescription>
            Questa operazione elimina definitivamente il profilo e la chiave di cifratura da questo
            dispositivo. Non è reversibile.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">
            Scrivi <span className="font-mono font-semibold text-ink">{RESET_CONFIRM_WORD}</span>{' '}
            per confermare.
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
  const [resetOpen, setResetOpen] = useState(false);

  // biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature requires bracket notation
  const appVersion = process.env['NEXT_PUBLIC_APP_VERSION'] ?? '0.x.x';

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Impostazioni</h1>

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
              Elimina definitivamente il profilo e la chiave di cifratura da questo dispositivo.
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

      <ResetDeviceDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>
  );
}
