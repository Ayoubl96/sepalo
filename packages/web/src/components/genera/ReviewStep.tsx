'use client';

import { Button } from '@/components/ui/button';
import { type ParsedSheet, parseAmount } from '@/lib/parse';
import { PlusIcon } from 'lucide-react';
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
      },
      remittanceInfo: remittanceMapped
        ? (row[columnMap.remittanceInfo] ?? '')
        : `Pagamento ${name}`.trim(),
    };
  });

  const totalAmount = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="px-8 py-6 flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-2 rounded-xl border border-line overflow-hidden divide-x divide-line">
        <div className="px-5 py-4 bg-surface">
          <p className="text-[11px] uppercase tracking-wider text-muted-2 mb-1">Transazioni</p>
          <p className="text-2xl font-semibold font-mono text-ink">{sheet.rows.length}</p>
        </div>
        <div className="px-5 py-4 bg-surface">
          <p className="text-[11px] uppercase tracking-wider text-muted-2 mb-1">Totale</p>
          <p className="text-2xl font-semibold font-mono text-ink">€ {totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          disabled
          placeholder="Cerca beneficiario, IBAN, causale…"
          className="w-64 h-9 rounded-lg border border-line bg-surface px-3 text-sm text-muted opacity-50 cursor-not-allowed"
        />
        <div className="flex-1" />
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 text-sm text-muted opacity-50 cursor-not-allowed px-3 py-2 rounded-lg border border-line bg-surface"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Aggiungi riga
        </button>
      </div>

      {/* Transaction table */}
      <div className="rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-line">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs text-muted-2 uppercase tracking-wide w-10">
                #
              </th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-2 uppercase tracking-wide">
                Beneficiario
              </th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-2 uppercase tracking-wide">
                IBAN
              </th>
              <th className="px-4 py-2.5 text-right text-xs text-muted-2 uppercase tracking-wide">
                Importo
              </th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-2 uppercase tracking-wide">
                Causale
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {transactions.map((tx, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: display-only list, no stable id
              <tr key={i} className="hover:bg-surface/50">
                <td className="px-4 py-3 text-xs text-muted">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{tx.beneficiary.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{tx.beneficiary.iban}</td>
                <td className="px-4 py-3 font-mono text-right">€ {tx.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-muted max-w-[200px] truncate">
                  {tx.remittanceInfo || `Pagamento ${tx.beneficiary.name}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-line">
        <p className="text-xs text-muted">Le righe in errore non saranno incluse nell&apos;XML.</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>
            Indietro
          </Button>
          <Button onClick={onNext}>Continua a genera</Button>
        </div>
      </div>
    </div>
  );
}
