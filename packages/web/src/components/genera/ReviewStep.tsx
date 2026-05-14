'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProfile } from '@/hooks/useProfile';
import { type ParsedSheet, parseAmount } from '@/lib/parse';
import { validateXmlClientSide } from '@/lib/xsd';
import { buildXml, validatePayment } from '@sepalo/core';
import { AlertCircleIcon, DownloadIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import type { ColumnMap } from './MapStep';

interface ReviewStepProps {
  sheet: ParsedSheet;
  columnMap: ColumnMap;
  onBack: () => void;
  onReset: () => void;
}

export function ReviewStep({ sheet, columnMap, onBack, onReset }: ReviewStepProps) {
  const { profile } = useProfile();
  const [executionDate, setExecutionDate] = useState(todayIso());
  const [batchBooking, setBatchBooking] = useState(false);
  const [errors, setErrors] = useState<{ path: string; message: string }[]>([]);
  const [xmlBlob, setXmlBlob] = useState<Blob | null>(null);
  const [generating, setGenerating] = useState(false);

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
  const preview = transactions.slice(0, 5);

  async function generate() {
    if (!profile) return;
    setErrors([]);
    setXmlBlob(null);
    setGenerating(true);
    try {
      const batch = { initiator: profile, executionDate, batchBooking, transactions };

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
    } finally {
      setGenerating(false);
    }
  }

  function download() {
    if (!xmlBlob) return;
    const url = URL.createObjectURL(xmlBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sepalo-${executionDate}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!profile) {
    return (
      <div className="px-8 py-10 max-w-2xl">
        <div className="rounded-lg bg-warn-soft border border-warn p-4 text-sm text-warn">
          <strong>Profile not set.</strong>{' '}
          <a href="/profilo" className="underline">
            Go to Profile
          </a>{' '}
          to add your company details before generating.
        </div>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-3xl">
      <h2 className="text-xl font-semibold text-ink mb-6">Review & generate</h2>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-1">
          <Label htmlFor="exec-date">Execution date</Label>
          <Input
            id="exec-date"
            type="date"
            value={executionDate}
            onChange={(e) => {
              setExecutionDate(e.target.value);
              setXmlBlob(null);
            }}
            className="w-44"
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <input
            id="batch-booking"
            type="checkbox"
            checked={batchBooking}
            onChange={(e) => {
              setBatchBooking(e.target.checked);
              setXmlBlob(null);
            }}
            className="h-4 w-4 accent-primary"
          />
          <Label htmlFor="batch-booking">Batch booking</Label>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">
          {sheet.rows.length} transaction{sheet.rows.length !== 1 ? 's' : ''} —{' '}
          <span className="font-mono">€ {totalAmount.toFixed(2)}</span>
        </p>
        {sheet.rows.length > 5 && (
          <p className="text-xs text-muted">Showing first 5 of {sheet.rows.length}</p>
        )}
      </div>

      <div className="rounded-lg border border-line overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>IBAN</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Remittance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((tx, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: preview rows, no stable id
              <TableRow key={i}>
                <TableCell>{tx.beneficiary.name}</TableCell>
                <TableCell className="font-mono text-xs">{tx.beneficiary.iban}</TableCell>
                <TableCell className="font-mono text-right">€ {tx.amount.toFixed(2)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">
                  {tx.remittanceInfo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-error bg-error-soft p-4 space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-error mb-2">
            <AlertCircleIcon className="h-4 w-4" />
            {errors.length} validation error{errors.length !== 1 ? 's' : ''}
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
        <div className="mb-6 rounded-lg border border-accent bg-accent-soft p-4 text-sm text-accent flex items-center justify-between">
          <span>XML generated successfully.</span>
          <Button size="sm" onClick={download}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download XML
          </Button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={generate} disabled={!!xmlBlob || generating}>
          {generating ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Validating…
            </>
          ) : (
            'Generate XML'
          )}
        </Button>
        {xmlBlob && (
          <Button variant="ghost" onClick={onReset}>
            Start over
          </Button>
        )}
      </div>
    </div>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
