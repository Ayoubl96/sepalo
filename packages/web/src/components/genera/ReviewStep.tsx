'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type ParsedSheet, parseAmount } from '@/lib/parse';
import type { ColumnMap } from './MapStep';

interface ReviewStepProps {
  sheet: ParsedSheet;
  columnMap: ColumnMap;
  onBack: () => void;
  onNext: () => void;
}

export function ReviewStep({ sheet, columnMap, onBack, onNext }: ReviewStepProps) {
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

  return (
    <div className="px-8 py-10 max-w-3xl">
      <h2 className="text-xl font-semibold text-ink mb-6">Verifica transazioni</h2>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">
          {sheet.rows.length} transazion{sheet.rows.length !== 1 ? 'i' : 'e'} —{' '}
          <span className="font-mono">€ {totalAmount.toFixed(2)}</span>
        </p>
        {sheet.rows.length > 5 && (
          <p className="text-xs text-muted">Prime 5 di {sheet.rows.length}</p>
        )}
      </div>

      <div className="rounded-lg border border-line overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiario</TableHead>
              <TableHead>IBAN</TableHead>
              <TableHead className="text-right">Importo</TableHead>
              <TableHead>Causale</TableHead>
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

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Indietro
        </Button>
        <Button onClick={onNext}>Continua</Button>
      </div>
    </div>
  );
}
