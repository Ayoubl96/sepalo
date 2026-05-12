'use client';

import { autoDetectColumns } from '@/lib/parse';
import type { ParsedSheet } from '@/lib/parse';
import { useState } from 'react';
import { MapStep } from './MapStep';
import type { ColumnMap } from './MapStep';
import { ReviewStep } from './ReviewStep';
import { UploadStep } from './UploadStep';

type Step = 'upload' | 'map' | 'review';

const EMPTY_MAP: ColumnMap = {
  beneficiaryName: '',
  beneficiaryIban: '',
  beneficiaryBic: '',
  amount: '',
  remittanceInfo: '',
};

export function GeneraPage() {
  const [step, setStep] = useState<Step>('upload');
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [fileName, setFileName] = useState('');
  const [columnMap, setColumnMap] = useState<ColumnMap>(EMPTY_MAP);

  function handleParsed(parsed: ParsedSheet, name: string) {
    const detected = autoDetectColumns(parsed.headers);
    setSheet(parsed);
    setFileName(name);
    setColumnMap({ ...EMPTY_MAP, ...detected });
    setStep('map');
  }

  function reset() {
    setStep('upload');
    setSheet(null);
    setFileName('');
    setColumnMap(EMPTY_MAP);
  }

  return (
    <div className="min-h-full">
      <StepBar step={step} />
      {step === 'upload' && <UploadStep onParsed={handleParsed} />}
      {step === 'map' && sheet && (
        <MapStep
          fileName={fileName}
          headers={sheet.headers}
          preview={sheet.rows.slice(0, 3)}
          columnMap={columnMap}
          onChange={setColumnMap}
          onBack={reset}
          onNext={() => setStep('review')}
        />
      )}
      {step === 'review' && sheet && (
        <ReviewStep
          sheet={sheet}
          columnMap={columnMap}
          onBack={() => setStep('map')}
          onReset={reset}
        />
      )}
    </div>
  );
}

function StepBar({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'upload', label: '1. Upload' },
    { key: 'map', label: '2. Map columns' },
    { key: 'review', label: '3. Review & generate' },
  ];
  const order: Record<Step, number> = { upload: 0, map: 1, review: 2 };

  return (
    <div className="flex items-center gap-0 border-b border-line bg-surface px-8 h-10">
      {steps.map(({ key, label }) => {
        const active = key === step;
        const done = order[key] < order[step];
        return (
          <span
            key={key}
            className={`mr-6 text-xs font-medium ${
              active ? 'text-primary' : done ? 'text-accent' : 'text-muted-2'
            }`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
