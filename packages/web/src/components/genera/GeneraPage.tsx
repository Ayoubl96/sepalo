'use client';

import { autoDetectColumns } from '@/lib/parse';
import type { ParsedSheet } from '@/lib/parse';
import { useState } from 'react';
import { ConfigStep } from './ConfigStep';
import { MapStep } from './MapStep';
import type { ColumnMap } from './MapStep';
import { ReviewStep } from './ReviewStep';
import { UploadStep } from './UploadStep';

type Step = 'upload' | 'map' | 'review' | 'config';

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
          onNext={() => setStep('config')}
        />
      )}
      {step === 'config' && sheet && (
        <ConfigStep
          sheet={sheet}
          columnMap={columnMap}
          onBack={() => setStep('review')}
          onReset={reset}
        />
      )}
    </div>
  );
}

function StepBar({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'upload', label: '1. Carica' },
    { key: 'map', label: '2. Mappa' },
    { key: 'review', label: '3. Verifica' },
    { key: 'config', label: '4. Configura' },
  ];
  const order: Record<Step, number> = { upload: 0, map: 1, review: 2, config: 3 };

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
