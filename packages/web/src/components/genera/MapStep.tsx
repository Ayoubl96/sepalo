'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}

const FIELDS: { key: keyof ColumnMap; label: string; required: boolean }[] = [
  { key: 'beneficiaryName', label: 'Beneficiary name', required: true },
  { key: 'beneficiaryIban', label: 'Beneficiary IBAN', required: true },
  { key: 'amount', label: 'Amount (€)', required: true },
  { key: 'remittanceInfo', label: 'Remittance info / description', required: true },
  { key: 'beneficiaryBic', label: 'BIC / SWIFT', required: false },
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
}: MapStepProps) {
  const canProceed = FIELDS.filter((f) => f.required).every((f) => columnMap[f.key] !== '');

  function set(key: keyof ColumnMap, value: string) {
    onChange({ ...columnMap, [key]: value === NONE ? '' : value });
  }

  return (
    <div className="px-8 py-10 max-w-2xl">
      <p className="text-xs text-muted mb-1">{fileName}</p>
      <h2 className="text-xl font-semibold text-ink mb-6">Map columns</h2>

      <div className="space-y-4 mb-8">
        {FIELDS.map(({ key, label, required }) => (
          <div key={key} className="grid grid-cols-[200px_1fr] items-center gap-4">
            <Label className="text-sm">
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </Label>
            <div>
              <Select value={columnMap[key] || NONE} onValueChange={(v) => set(key, v)}>
                <SelectTrigger>
                  <SelectValue placeholder={required ? 'Select a column' : 'Not mapped'} />
                </SelectTrigger>
                <SelectContent>
                  {!required && <SelectItem value={NONE}>Not mapped</SelectItem>}
                  {headers.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                      {preview[0]?.[h] ? (
                        <span className="ml-2 text-muted-2">e.g. {preview[0][h]}</span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next
        </Button>
      </div>
    </div>
  );
}
