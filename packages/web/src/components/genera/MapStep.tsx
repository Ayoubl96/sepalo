'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableIcon } from 'lucide-react';
import { useState } from 'react';

export interface ColumnMap {
  beneficiaryName: string;
  beneficiaryIban: string;
  beneficiaryBic: string;
  amount: string;
  remittanceInfo: string;
}

interface MapStepProps {
  fileName: string;
  headers: string[];
  preview: Record<string, string>[];
  columnMap: ColumnMap;
  onChange: (map: ColumnMap) => void;
  onBack: () => void;
  onNext: () => void;
  rowCount: number;
}

const FIELDS: { key: keyof ColumnMap; label: string; required: boolean }[] = [
  { key: 'beneficiaryName', label: 'Beneficiario', required: true },
  { key: 'beneficiaryIban', label: 'IBAN', required: true },
  { key: 'amount', label: 'Importo', required: true },
  { key: 'remittanceInfo', label: 'Causale', required: true },
  { key: 'beneficiaryBic', label: 'BIC / SWIFT', required: false },
];

const REQUIRED_KEYS: (keyof ColumnMap)[] = [
  'beneficiaryName',
  'beneficiaryIban',
  'amount',
  'remittanceInfo',
];

const NONE = '__none__';

export function MapStep({
  fileName,
  headers,
  preview,
  columnMap,
  onChange,
  onBack,
  onNext,
  rowCount,
}: MapStepProps) {
  const [saveMapping, setSaveMapping] = useState(true);

  const canProceed = REQUIRED_KEYS.every((k) => columnMap[k] !== '');

  const mappedRequired = REQUIRED_KEYS.filter((k) => columnMap[k] !== '').length;

  function set(key: keyof ColumnMap, value: string) {
    onChange({ ...columnMap, [key]: value === NONE ? '' : value });
  }

  const totalRequired = REQUIRED_KEYS.length;

  return (
    <div className="px-8 py-6 flex flex-col gap-5 min-h-full">
      {/* File info card */}
      <div className="rounded-xl border border-line px-4 py-3 flex items-center gap-3">
        <TableIcon className="h-[18px] w-[18px] text-accent shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-medium text-ink">{fileName}</span>
          <span className="text-xs text-muted ml-2">· {rowCount} righe</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Cambia file
        </Button>
      </div>

      {/* Main mapping card */}
      <div className="rounded-xl border border-line overflow-hidden flex-1">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="text-base font-semibold text-ink">Abbina le colonne del tuo file</h2>
          <p className="text-sm text-muted mt-1">
            Indica quale colonna corrisponde a ciascun campo. La mappatura viene salvata per i
            prossimi file con la stessa intestazione.
          </p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-xs font-medium text-muted uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Campo Sepalo</th>
              <th className="px-5 py-3 text-left">Colonna nel tuo file</th>
              <th className="px-5 py-3 text-left">Anteprima riga 1</th>
              <th className="px-5 py-3 text-left">Anteprima riga 2</th>
            </tr>
          </thead>
          <tbody>
            {FIELDS.map(({ key, label, required }) => (
              <tr key={key} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3">
                  <span className="font-medium text-sm text-ink">{label}</span>
                  {required && <span className="text-error ml-1">*</span>}
                </td>
                <td className="px-5 py-3">
                  <Select value={columnMap[key] || NONE} onValueChange={(v) => set(key, v)}>
                    <SelectTrigger className={required && !columnMap[key] ? 'border-error' : ''}>
                      <SelectValue placeholder="Scegli una colonna…" />
                    </SelectTrigger>
                    <SelectContent>
                      {!required && <SelectItem value={NONE}>Non mappare</SelectItem>}
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-5 py-3 text-xs font-mono text-muted">
                  {preview[0]?.[columnMap[key]] ?? '—'}
                </td>
                <td className="px-5 py-3 text-xs font-mono text-muted">
                  {preview[1]?.[columnMap[key]] ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-4 border-t border-line flex justify-between items-center bg-surface">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-mono ${mappedRequired >= totalRequired ? 'text-accent' : 'text-warn'}`}
              >
                {mappedRequired}/{totalRequired}
              </span>
              <span className="text-sm text-muted">campi obbligatori abbinati</span>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={saveMapping}
                onChange={(e) => setSaveMapping(e.target.checked)}
                className="accent-primary"
              />
              Salva mappatura per i prossimi file
            </label>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onBack}>
              Indietro
            </Button>
            <Button onClick={onNext} disabled={!canProceed}>
              Continua a verifica
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
