'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import type { ParsedSheet } from '@/lib/parse';
import { rowsToTransactions } from '@/lib/transactions';
import { validateXmlClientSide } from '@/lib/xsd';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildXml, getAbiName, validateIban, validatePayment } from '@sepalo/core';
import type { Initiator } from '@sepalo/core';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  DownloadIcon,
  FileCodeIcon,
  Loader2Icon,
  LockIcon,
  PencilIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import type { ColumnMap } from './MapStep';

interface GeneraStepProps {
  sheet: ParsedSheet;
  columnMap: ColumnMap;
  defaultPurpose: string;
  onBack: () => void;
  onReset: () => void;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio').max(70, 'Max 70 caratteri'),
  cfpiva: z
    .string()
    .min(11, 'Inserisci CF (16 car.) o P.IVA (11 cifre)')
    .max(16, 'Max 16 caratteri')
    .refine(
      (v) => v.trim().length === 11 || v.trim().length === 16,
      'Deve essere CF (16 caratteri) o P.IVA (11 cifre)',
    ),
  iban: z
    .string()
    .min(1, 'IBAN obbligatorio')
    .refine((v) => validateIban(v.replace(/\s/g, '').toUpperCase()).valid, 'IBAN non valido'),
  cuc: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[A-Z0-9]{8}$/i.test(v.trim()),
      'CUC deve essere 8 caratteri alfanumerici',
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractAbi(iban: string): string | null {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  if (!clean.startsWith('IT') || clean.length < 10) return null;
  return clean.slice(5, 10);
}

function buildInitiator(data: ProfileFormValues): Initiator {
  return {
    name: data.name.trim(),
    identifier: data.cuc?.trim()
      ? { type: 'CUC', value: data.cuc.trim().toUpperCase() }
      : { type: 'CF', value: data.cfpiva.trim().toUpperCase() },
    iban: data.iban.replace(/\s/g, '').toUpperCase(),
    abi: extractAbi(data.iban) ?? '',
  };
}

function profileToForm(p: Initiator): ProfileFormValues {
  return {
    name: p.name,
    cfpiva: p.identifier.value,
    iban: p.iban,
    cuc: p.identifier.type === 'CUC' ? p.identifier.value : '',
  };
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function makeFileId(): string {
  return `SEPALO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function computeSha256(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileRequired({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="rounded-xl border border-warn/40 bg-warn/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircleIcon className="h-4 w-4 text-warn shrink-0" />
        <p className="text-sm font-semibold text-warn">Sezione obbligatoria · da compilare</p>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg border-2 border-dashed border-muted-2 flex items-center justify-center shrink-0">
          <UserIcon className="h-5 w-5 text-muted-2" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">Dati ordinante</p>
          <p className="text-xs text-muted mt-0.5">
            Ragione sociale, codice fiscale e IBAN. Vanno nel blocco &lt;InitgPty&gt; dell&apos;XML.
          </p>
          <Button size="sm" className="mt-3" onClick={onOpen}>
            Compila →
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileChip({
  profile,
  bank,
  onEdit,
}: {
  profile: Initiator;
  bank: string | null;
  onEdit: () => void;
}) {
  const initials = profile.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="rounded-xl border border-line bg-surface p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{profile.name}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            <CheckIcon className="h-2.5 w-2.5" /> ordinante salvato
          </span>
        </div>
        <p className="text-xs font-mono text-muted mt-0.5 truncate">
          {profile.iban}
          {bank ? ` · ${bank}` : ''}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} className="shrink-0">
        <PencilIcon className="h-3.5 w-3.5 mr-1" /> Modifica
      </Button>
    </div>
  );
}

function BookingOption({
  label,
  desc,
  mono,
  selected,
  onSelect,
}: {
  label: string;
  desc: string;
  mono: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex-1 rounded-xl border p-3 cursor-pointer transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'border-line bg-surface hover:bg-paper-2'
      }`}
    >
      <input
        type="radio"
        name="booking-type"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <span className="font-mono text-[10px] text-muted">{mono}</span>
      </div>
      <p className="text-xs text-muted">{desc}</p>
    </label>
  );
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm py-1.5 border-b border-line last:border-0">
      <span className="text-muted shrink-0">{label}</span>
      <span className={`text-ink text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function ProfilePopup({
  defaultValues,
  onClose,
  onSave,
  onUseOnce,
}: {
  defaultValues?: ProfileFormValues;
  onClose: () => void;
  onSave: (data: ProfileFormValues) => Promise<void>;
  onUseOnce: (data: ProfileFormValues) => void;
}) {
  const submitModeRef = useRef<'once' | 'save'>('save');
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultValues ?? { name: '', cfpiva: '', iban: '', cuc: '' },
  });

  const ibanVal = useWatch({ control, name: 'iban' });
  const cleanIban = (ibanVal ?? '').replace(/\s/g, '').toUpperCase();
  const ibanOk = validateIban(cleanIban).valid;
  const abi = ibanOk ? extractAbi(cleanIban) : null;
  const bank = abi ? (getAbiName(abi) ?? null) : null;

  async function onSubmit(data: ProfileFormValues) {
    if (submitModeRef.current === 'save') {
      setSaving(true);
      try {
        await onSave(data);
      } finally {
        setSaving(false);
      }
    } else {
      onUseOnce(data);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-paper rounded-2xl shadow-2xl w-full max-w-[540px] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-line flex justify-between items-start">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted mb-1">Dati ordinante</p>
            <h2 className="text-lg font-semibold text-ink">Chi sei tu, banca?</h2>
            <p className="text-xs text-muted mt-1">
              Vanno nel blocco &lt;InitgPty&gt; dell&apos;XML. La banca controlla che combacino con
              il conto.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 grid grid-cols-2 gap-x-4 gap-y-4">
            {/* Name — full width */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="p-name">Ragione sociale o nome</Label>
              <Input id="p-name" placeholder="Es. Rossi & Partners Sas" {...register('name')} />
              {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
            </div>

            {/* CF/PIVA — full width */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="p-cfpiva">Codice fiscale o P.IVA</Label>
              <Input
                id="p-cfpiva"
                placeholder="RSSMRA80A01H501U oppure 12345678901"
                className="font-mono"
                {...register('cfpiva', { setValueAs: (v: string) => v.trim().toUpperCase() })}
              />
              {errors.cfpiva && <p className="text-xs text-error">{errors.cfpiva.message}</p>}
              <p className="text-xs text-muted">
                11 cifre per P.IVA · 16 caratteri per il Codice fiscale
              </p>
            </div>

            {/* IBAN — full width */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="p-iban">IBAN ordinante</Label>
              <Input
                id="p-iban"
                placeholder="IT60 X054 2811 1010 0000 0123 456"
                className="font-mono tracking-wide"
                {...register('iban')}
              />
              {errors.iban && <p className="text-xs text-error">{errors.iban.message}</p>}
              {bank && ibanOk && <p className="text-xs text-accent">{bank}</p>}
            </div>

            {/* CUC — left col */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="p-cuc">
                CUC <span className="text-muted font-normal">· opzionale</span>
              </Label>
              <Input
                id="p-cuc"
                placeholder="es. 1A2B3C4D"
                maxLength={8}
                className="font-mono"
                {...register('cuc', { setValueAs: (v: string) => v.trim().toUpperCase() })}
              />
              {errors.cuc && <p className="text-xs text-error">{errors.cuc.message}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-surface border-t border-line flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-primary h-4 w-4" />
              Ricorda i dati per i prossimi file
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => {
                  submitModeRef.current = 'once';
                  handleSubmit(onSubmit)();
                }}
              >
                Solo questa volta
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={() => {
                  submitModeRef.current = 'save';
                  handleSubmit(onSubmit)();
                }}
              >
                {saving ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" /> : null}
                Salva e usa
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar sub-components ───────────────────────────────────────────────────

function SidePending({
  initiator,
  bank,
  txCount,
  totalAmount,
  executionDate,
  batchBooking,
  generating,
  onGenerate,
  onBack,
}: {
  initiator: Initiator | null;
  bank: string | null;
  txCount: number;
  totalAmount: number;
  executionDate: string;
  batchBooking: boolean;
  generating: boolean;
  onGenerate: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Riepilogo</h3>
        <div className="space-y-0">
          <SummaryRow label="Ordinante" value={initiator?.name ?? '—'} />
          <SummaryRow label="IBAN" value={initiator?.iban ?? '—'} mono />
          {bank && <SummaryRow label="Banca" value={bank} />}
          <div className="border-t border-line my-2" />
          <SummaryRow label="Transazioni" value={String(txCount)} />
          <SummaryRow label="Totale" value={`€ ${totalAmount.toFixed(2)}`} mono />
          <SummaryRow label="Data" value={executionDate} />
          <SummaryRow label="Tipo" value={!batchBooking ? 'Cumulativo' : 'Singola'} />
          <SummaryRow label="Schema" value="CBI 00.04.01" mono />
        </div>
        <Button className="w-full mt-5" disabled={!initiator || generating} onClick={onGenerate}>
          {generating ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              Validazione…
            </>
          ) : (
            <>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Genera e scarica
            </>
          )}
        </Button>
        <p
          className={`text-[11px] text-center mt-2 flex items-center justify-center gap-1 ${initiator ? 'text-muted' : 'text-warn'}`}
        >
          {initiator ? (
            <>
              <LockIcon className="h-3 w-3" /> Validazione XSD client-side · pronto
            </>
          ) : (
            <>
              <AlertCircleIcon className="h-3 w-3" /> Compila i dati ordinante per continuare
            </>
          )}
        </p>
      </div>
      <Button variant="outline" className="w-full" onClick={onBack}>
        Indietro
      </Button>
    </>
  );
}

function SideDone({
  fileId,
  sha256,
  txCount,
  totalAmount,
  onDownload,
  onReset,
}: {
  fileId: string;
  sha256: string;
  txCount: number;
  totalAmount: number;
  onDownload: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 text-center">
      <CheckCircleIcon className="h-11 w-11 text-accent mx-auto mb-3" />
      <p className="text-[11px] uppercase tracking-wider text-accent mb-2">File scaricato</p>
      <h3 className="text-xl font-semibold text-ink mb-1">
        {txCount} bonifici, € {totalAmount.toFixed(2)}
      </h3>
      <p className="text-xs text-muted mb-5">
        File validato e pronto. Caricalo nell&apos;home banking come bonifico massivo.
      </p>

      <div className="rounded-lg border border-line bg-surface p-3 flex items-center gap-3 mb-4 text-left">
        <FileCodeIcon className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileId}.xml</p>
          {sha256 && (
            <p className="text-[11px] font-mono text-muted">
              sha-256 {sha256.slice(0, 8)}…{sha256.slice(-6)}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onDownload}>
          <DownloadIcon className="h-4 w-4" />
        </Button>
      </div>

      <Button variant="ghost" className="w-full text-sm" onClick={onReset}>
        + Genera un altro file
      </Button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GeneraStep({ sheet, columnMap, defaultPurpose, onBack, onReset }: GeneraStepProps) {
  const { profile, loading: profileLoading, saveProfile } = useProfile();
  const [overrideInitiator, setOverrideInitiator] = useState<Initiator | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [executionDate, setExecutionDate] = useState(todayIso);
  const [batchBooking, setBatchBooking] = useState(false);
  const [editableFileId, setEditableFileId] = useState(makeFileId);
  const [generating, setGenerating] = useState(false);
  const [genErrors, setGenErrors] = useState<{ path: string; message: string }[]>([]);
  const [xmlBlob, setXmlBlob] = useState<Blob | null>(null);
  const [sha256, setSha256] = useState('');

  const effectiveInitiator = overrideInitiator ?? profile;
  const profileAbi = effectiveInitiator ? extractAbi(effectiveInitiator.iban) : null;
  const profileBank = profileAbi ? (getAbiName(profileAbi) ?? null) : null;

  const transactions = rowsToTransactions(sheet.rows, columnMap, defaultPurpose);
  const totalAmount = transactions.reduce((s, t) => s + t.amount, 0);

  async function runGenerate(initiator: Initiator) {
    setGenErrors([]);
    setXmlBlob(null);
    setSha256('');
    setGenerating(true);
    try {
      const batch = { initiator, executionDate, batchBooking, transactions };
      const { errors: businessErrors } = validatePayment(batch);
      if (businessErrors.length > 0) {
        setGenErrors(businessErrors);
        return;
      }
      const xml = buildXml(batch);
      const xsdErrors = await validateXmlClientSide(xml);
      if (xsdErrors.length > 0) {
        setGenErrors(xsdErrors);
        return;
      }
      const blob = new Blob([xml], { type: 'application/xml' });
      const hash = await computeSha256(blob);
      setXmlBlob(blob);
      setSha256(hash);
    } finally {
      setGenerating(false);
    }
  }

  function download() {
    if (!xmlBlob) return;
    const url = URL.createObjectURL(xmlBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editableFileId}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    window.rybbit?.event('xml_download');
  }

  if (profileLoading) {
    return (
      <div className="px-8 py-16 flex items-center gap-2 text-sm text-muted">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        Caricamento…
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      <h2 className="text-2xl font-semibold text-ink mb-1">Tutto pronto?</h2>
      <p className="text-sm text-muted mb-8">Ultima occhiata e generi l&apos;XML.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Profile section */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-2 mb-3">
              Dati ordinante
            </h3>
            {!effectiveInitiator ? (
              <ProfileRequired onOpen={() => setPopupOpen(true)} />
            ) : (
              <ProfileChip
                profile={effectiveInitiator}
                bank={profileBank}
                onEdit={() => setPopupOpen(true)}
              />
            )}
          </section>

          {/* Params section */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-2 mb-3">
              Parametri del bonifico
            </h3>
            <div className="rounded-xl border border-line bg-surface p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="exec-date">Data esecuzione</Label>
                  <Input
                    id="exec-date"
                    type="date"
                    value={executionDate}
                    onChange={(e) => {
                      setExecutionDate(e.target.value);
                      setXmlBlob(null);
                    }}
                    className="font-mono w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="file-id">Identificativo file</Label>
                  <Input
                    id="file-id"
                    value={editableFileId}
                    onChange={(e) => setEditableFileId(e.target.value)}
                    className="font-mono w-full"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-ink mb-2">Tipo di registrazione</p>
                <div className="grid grid-cols-2 gap-3">
                  <BookingOption
                    label="Cumulativo"
                    desc="Una voce in estratto conto"
                    mono="BtchBookg=true"
                    selected={!batchBooking}
                    onSelect={() => {
                      setBatchBooking(false);
                      setXmlBlob(null);
                    }}
                  />
                  <BookingOption
                    label="Singola"
                    desc="Una voce per ogni bonifico"
                    mono="BtchBookg=false"
                    selected={batchBooking}
                    onSelect={() => {
                      setBatchBooking(true);
                      setXmlBlob(null);
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Errors */}
          {genErrors.length > 0 && (
            <div className="rounded-xl border border-error bg-error/5 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-error mb-1">
                <AlertCircleIcon className="h-4 w-4" />
                {genErrors.length} error{genErrors.length !== 1 ? 'i' : 'e'} di validazione
              </div>
              {genErrors.map((e, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static error list
                <p key={i} className="text-xs text-error">
                  <span className="font-mono">{e.path}</span>: {e.message}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:sticky lg:top-8 self-start space-y-3">
          {!xmlBlob ? (
            <SidePending
              initiator={effectiveInitiator}
              bank={profileBank}
              txCount={sheet.rows.length}
              totalAmount={totalAmount}
              executionDate={executionDate}
              batchBooking={batchBooking}
              generating={generating}
              onGenerate={() => {
                if (effectiveInitiator) runGenerate(effectiveInitiator);
              }}
              onBack={onBack}
            />
          ) : (
            <SideDone
              fileId={editableFileId}
              sha256={sha256}
              txCount={transactions.length}
              totalAmount={totalAmount}
              onDownload={download}
              onReset={onReset}
            />
          )}
        </div>
      </div>

      {popupOpen && (
        <ProfilePopup
          {...(effectiveInitiator ? { defaultValues: profileToForm(effectiveInitiator) } : {})}
          onClose={() => setPopupOpen(false)}
          onSave={async (data) => {
            const initiator = buildInitiator(data);
            await saveProfile(initiator);
            setOverrideInitiator(initiator);
            setPopupOpen(false);
            setXmlBlob(null);
          }}
          onUseOnce={(data) => {
            setOverrideInitiator(buildInitiator(data));
            setPopupOpen(false);
            setXmlBlob(null);
          }}
        />
      )}
    </div>
  );
}
