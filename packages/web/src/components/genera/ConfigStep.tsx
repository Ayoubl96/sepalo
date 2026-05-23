'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { type ParsedSheet, parseAmount } from '@/lib/parse';
import { validateXmlClientSide } from '@/lib/xsd';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildXml, getAbiName, validateIban, validatePayment } from '@sepalo/core';
import type { Initiator } from '@sepalo/core';
import {
  AlertCircleIcon,
  Building2Icon,
  DownloadIcon,
  Loader2Icon,
  PencilIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { type UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import type { ColumnMap } from './MapStep';

interface ConfigStepProps {
  sheet: ParsedSheet;
  columnMap: ColumnMap;
  onBack: () => void;
  onReset: () => void;
}

const initiatorSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio').max(70, 'Max 70 caratteri'),
  cf: z.string().min(11, 'Inserisci CF (16 car.) o P.IVA (11 cifre)').max(16, 'Max 16 caratteri'),
  cuc: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[A-Z0-9]{8}$/i.test(v.trim()),
      'CUC deve essere 8 caratteri alfanumerici',
    ),
  iban: z
    .string()
    .min(1, 'IBAN obbligatorio')
    .refine((v) => validateIban(v.replace(/\s/g, '').toUpperCase()).valid, 'IBAN non valido'),
});

type InitiatorFormValues = z.infer<typeof initiatorSchema>;

function extractAbi(iban: string): string | null {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  if (!clean.startsWith('IT') || clean.length < 10) return null;
  return clean.slice(5, 10);
}

function profileToForm(p: Initiator): InitiatorFormValues {
  return {
    name: p.name,
    cf: p.identifier.type === 'CF' ? p.identifier.value : '',
    cuc: p.identifier.type === 'CUC' ? p.identifier.value : '',
    iban: p.iban,
  };
}

function buildInitiator(data: InitiatorFormValues): Initiator {
  return {
    name: data.name.trim(),
    identifier: data.cuc?.trim()
      ? { type: 'CUC', value: data.cuc.trim().toUpperCase() }
      : { type: 'CF', value: data.cf.trim().toUpperCase() },
    iban: data.iban.replace(/\s/g, '').toUpperCase(),
    abi: extractAbi(data.iban) ?? '',
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileCard({
  profile,
  profileBank,
  onEdit,
}: {
  profile: Initiator;
  profileBank: string | null;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Building2Icon className="h-5 w-5 text-muted-2 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-ink">{profile.name}</p>
          <p className="text-xs font-mono text-muted">{profile.iban}</p>
          {profileBank && <p className="text-xs text-muted">{profileBank}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
      >
        <PencilIcon className="h-3 w-3" />
        Modifica
      </button>
    </div>
  );
}

function InitiatorForm({
  form,
  saveChecked,
  onSaveCheckedChange,
  onSubmit,
}: {
  form: UseFormReturn<InitiatorFormValues>;
  saveChecked: boolean;
  onSaveCheckedChange: (v: boolean) => void;
  onSubmit: (data: InitiatorFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors: formErrors },
  } = form;

  const ibanValue = useWatch({ control, name: 'iban' });
  const cleanIban = ibanValue?.replace(/\s/g, '').toUpperCase() ?? '';
  const ibanValid = validateIban(cleanIban).valid;
  const abi = ibanValid ? extractAbi(cleanIban) : null;
  const bankName = abi ? (getAbiName(abi) ?? null) : null;

  return (
    <form id="config-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="name">Ragione sociale / Nome</Label>
        <Input id="name" placeholder="Acme S.r.l." maxLength={70} {...register('name')} />
        {formErrors.name && <p className="text-xs text-error">{formErrors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cf">Codice Fiscale / P.IVA</Label>
        <Input
          id="cf"
          placeholder="RSSMRA80A01H501U oppure 12345678901"
          maxLength={16}
          {...register('cf')}
        />
        {formErrors.cf && <p className="text-xs text-error">{formErrors.cf.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cuc">
          CUC <span className="text-muted font-normal">(opzionale)</span>
        </Label>
        <Input id="cuc" placeholder="AB12CD34" maxLength={8} {...register('cuc')} />
        {formErrors.cuc && <p className="text-xs text-error">{formErrors.cuc.message}</p>}
        <p className="text-xs text-muted">Se fornito, il CUC ha priorità sul Codice Fiscale.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="iban">IBAN del conto ordinante</Label>
        <Input
          id="iban"
          placeholder="IT60 X054 2811 1010 0000 0123 456"
          className="font-mono"
          {...register('iban')}
        />
        {formErrors.iban && <p className="text-xs text-error">{formErrors.iban.message}</p>}
        {bankName && ibanValid && <p className="text-xs text-accent">{bankName}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="save-profile"
          type="checkbox"
          checked={saveChecked}
          onChange={(e) => onSaveCheckedChange(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <Label htmlFor="save-profile" className="font-normal cursor-pointer">
          Salva per i prossimi file
        </Label>
      </div>
    </form>
  );
}

function PaymentConfig({
  executionDate,
  batchBooking,
  onDateChange,
  onBatchBookingChange,
}: {
  executionDate: string;
  batchBooking: boolean;
  onDateChange: (v: string) => void;
  onBatchBookingChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="exec-date">Data di esecuzione</Label>
        <Input
          id="exec-date"
          type="date"
          value={executionDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-44"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-ink mb-2">Tipo di addebito</p>
        <div className="flex gap-3">
          <BookingOption
            label="Cumulativo"
            description="Un unico addebito per l'importo totale"
            selected={!batchBooking}
            onSelect={() => onBatchBookingChange(false)}
          />
          <BookingOption
            label="Singola"
            description="Un addebito per ogni transazione"
            selected={batchBooking}
            onSelect={() => onBatchBookingChange(true)}
          />
        </div>
      </div>
    </div>
  );
}

function BookingOption({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex-1 rounded-lg border p-3 cursor-pointer transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'border-line bg-surface hover:bg-paper-2'
      }`}
    >
      <input
        type="radio"
        name="batch-booking"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="text-xs text-muted mt-0.5">{description}</p>
    </label>
  );
}

function SummaryCard({
  profile,
  profileBank,
  sheet,
  totalAmount,
  executionDate,
  batchBooking,
  showForm,
  generating,
  xmlBlob,
  onBack,
  onReset,
  onGenerate,
}: {
  profile: Initiator | null;
  profileBank: string | null;
  sheet: ParsedSheet;
  totalAmount: number;
  executionDate: string;
  batchBooking: boolean;
  showForm: boolean;
  generating: boolean;
  xmlBlob: Blob | null;
  onBack: () => void;
  onReset: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className="lg:sticky lg:top-6 self-start">
      <div className="rounded-xl border border-line bg-surface p-5 space-y-3">
        <h3 className="text-sm font-semibold text-ink">Riepilogo</h3>

        <SummaryRow label="Ordinante" value={profile?.name ?? '—'} />
        <SummaryRow label="IBAN" value={profile?.iban ?? '—'} mono />
        {profileBank && <SummaryRow label="Banca" value={profileBank} />}
        <hr className="border-line" />
        <SummaryRow label="Transazioni" value={String(sheet.rows.length)} />
        <SummaryRow label="Totale" value={`€ ${totalAmount.toFixed(2)}`} mono />
        <SummaryRow label="Data" value={executionDate} />
        <SummaryRow label="Tipo" value={batchBooking ? 'Singola' : 'Cumulativo'} />
        <SummaryRow label="Schema" value="CBIBdyPaymentRequest.00.04.01" mono />

        <div className="pt-2 space-y-2">
          <Button
            type={showForm ? 'submit' : 'button'}
            form={showForm ? 'config-form' : undefined}
            className="w-full"
            disabled={generating || !!xmlBlob}
            onClick={showForm ? undefined : onGenerate}
          >
            {generating ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Validazione…
              </>
            ) : (
              'Genera XML'
            )}
          </Button>

          {xmlBlob && (
            <Button variant="ghost" className="w-full" onClick={onReset}>
              Ricomincia
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Indietro
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="text-muted shrink-0">{label}</span>
      <span className={`text-ink text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConfigStep({ sheet, columnMap, onBack, onReset }: ConfigStepProps) {
  const { profile, loading, saveProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [saveChecked, setSaveChecked] = useState(true);
  const [executionDate, setExecutionDate] = useState(todayIso());
  const [batchBooking, setBatchBooking] = useState(false);
  const [errors, setErrors] = useState<{ path: string; message: string }[]>([]);
  const [xmlBlob, setXmlBlob] = useState<Blob | null>(null);
  const [generating, setGenerating] = useState(false);
  const [fileId] = useState(generateFileId);

  const showForm = !profile || editing;

  const form = useForm<InitiatorFormValues>({
    resolver: zodResolver(initiatorSchema),
    defaultValues: { name: '', cf: '', cuc: '', iban: '' },
  });

  useEffect(() => {
    if (profile) {
      setSaveChecked(false);
      form.reset(profileToForm(profile));
    } else {
      setSaveChecked(true);
    }
  }, [profile, form]);

  const remittanceMapped = columnMap.remittanceInfo !== '';

  const transactions = sheet.rows.map((row) => {
    const name = row[columnMap.beneficiaryName] ?? '';
    return {
      amount: parseAmount(row[columnMap.amount] ?? ''),
      beneficiary: {
        name,
        iban: (row[columnMap.beneficiaryIban] ?? '').replace(/\s/g, ''),
        bic: columnMap.beneficiaryBic ? row[columnMap.beneficiaryBic] || undefined : undefined,
      },
      remittanceInfo: remittanceMapped
        ? (row[columnMap.remittanceInfo] ?? '')
        : `Pagamento ${name}`.trim(),
    };
  });

  const totalAmount = transactions.reduce((s, t) => s + t.amount, 0);

  async function runGenerate(initiator: Initiator) {
    const batch = { initiator, executionDate, batchBooking, transactions };
    const { errors: businessErrors } = validatePayment(batch);
    if (businessErrors.length > 0) {
      setErrors(businessErrors);
      return;
    }
    const xml = buildXml(batch);
    const xsdErrors = await validateXmlClientSide(xml);
    if (xsdErrors.length > 0) {
      setErrors(xsdErrors);
      return;
    }
    setXmlBlob(new Blob([xml], { type: 'application/xml' }));
    setEditing(false);
  }

  async function onGenerate(data: InitiatorFormValues) {
    setErrors([]);
    setXmlBlob(null);
    setGenerating(true);
    try {
      const initiator = buildInitiator(data);
      if (saveChecked) await saveProfile(initiator);
      await runGenerate(initiator);
    } finally {
      setGenerating(false);
    }
  }

  function handleGenerateFromProfile() {
    if (!profile) return;
    setErrors([]);
    setXmlBlob(null);
    setGenerating(true);
    runGenerate(profile).finally(() => setGenerating(false));
  }

  function download() {
    if (!xmlBlob) return;
    const url = URL.createObjectURL(xmlBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileId}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="px-8 py-16 flex items-center gap-2 text-sm text-muted">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        Caricamento…
      </div>
    );
  }

  const profileAbi = profile ? extractAbi(profile.iban) : null;
  const profileBank = profileAbi ? (getAbiName(profileAbi) ?? null) : null;

  return (
    <div className="px-8 py-10">
      <h2 className="text-xl font-semibold text-ink mb-6">Configura e genera</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-2 mb-4">
              Ordinante
            </h3>
            {profile && !editing ? (
              <ProfileCard
                profile={profile}
                profileBank={profileBank}
                onEdit={() => setEditing(true)}
              />
            ) : (
              <InitiatorForm
                form={form}
                saveChecked={saveChecked}
                onSaveCheckedChange={setSaveChecked}
                onSubmit={onGenerate}
              />
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-2 mb-4">
              Configurazione pagamento
            </h3>
            <PaymentConfig
              executionDate={executionDate}
              batchBooking={batchBooking}
              onDateChange={(v) => {
                setExecutionDate(v);
                setXmlBlob(null);
              }}
              onBatchBookingChange={(v) => {
                setBatchBooking(v);
                setXmlBlob(null);
              }}
            />
          </section>

          {errors.length > 0 && (
            <div className="rounded-lg border border-error bg-error-soft p-4 space-y-1 max-w-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-error mb-2">
                <AlertCircleIcon className="h-4 w-4" />
                {errors.length} error{errors.length !== 1 ? 'i' : 'e'} di validazione
              </div>
              {errors.map((e, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static error list
                <p key={i} className="text-xs text-error">
                  <span className="font-mono">{e.path}</span>: {e.message}
                </p>
              ))}
            </div>
          )}

          {xmlBlob && (
            <div className="rounded-lg border border-accent bg-accent-soft p-4 text-sm text-accent flex items-center justify-between max-w-lg">
              <span>File XML generato con successo.</span>
              <Button size="sm" onClick={download}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Scarica XML
              </Button>
            </div>
          )}
        </div>

        <SummaryCard
          profile={profile}
          profileBank={profileBank}
          sheet={sheet}
          totalAmount={totalAmount}
          executionDate={executionDate}
          batchBooking={batchBooking}
          showForm={showForm}
          generating={generating}
          xmlBlob={xmlBlob}
          onBack={onBack}
          onReset={onReset}
          onGenerate={handleGenerateFromProfile}
        />
      </div>
    </div>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateFileId(): string {
  return `SEPALO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
