'use client';

import { autoDetectColumns } from '@/lib/parse';
import type { ParsedSheet } from '@/lib/parse';
import { DEFAULT_PURPOSE } from '@/lib/transactions';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { GeneraStep } from './GeneraStep';
import { MapStep } from './MapStep';
import type { ColumnMap } from './MapStep';
import { ReviewStep } from './ReviewStep';
import { UploadStep } from './UploadStep';

type Step = 'upload' | 'map' | 'review' | 'genera';

const EMPTY_MAP: ColumnMap = {
  beneficiaryName: '',
  beneficiaryIban: '',
  beneficiaryBic: '',
  amount: '',
  remittanceInfo: '',
  purpose: '',
};

export function GeneraPage() {
  const [step, setStep] = useState<Step>('upload');
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [fileName, setFileName] = useState('');
  const [columnMap, setColumnMap] = useState<ColumnMap>(EMPTY_MAP);
  const [defaultPurpose, setDefaultPurpose] = useState(DEFAULT_PURPOSE);

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
    setDefaultPurpose(DEFAULT_PURPOSE);
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader step={step} />
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
          rowCount={sheet.rows.length}
        />
      )}
      {step === 'review' && sheet && (
        <ReviewStep
          sheet={sheet}
          columnMap={columnMap}
          defaultPurpose={defaultPurpose}
          onPurposeChange={setDefaultPurpose}
          onBack={() => setStep('map')}
          onNext={() => setStep('genera')}
        />
      )}
      {step === 'genera' && sheet && (
        <GeneraStep
          sheet={sheet}
          columnMap={columnMap}
          defaultPurpose={defaultPurpose}
          onBack={() => setStep('review')}
          onReset={reset}
        />
      )}
    </div>
  );
}

function PageHeader({ step }: { step: Step }) {
  const stepIndex: Record<Step, number> = { upload: 0, map: 0, review: 1, genera: 2 };
  const current = stepIndex[step];
  const labels = ['Carica e mappa', 'Verifica', 'Genera'] as const;

  return (
    <div className="border-b border-line px-9 pt-5">
      <div className="flex items-end justify-between pb-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Genera file CBI
          </p>
          <h1 className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
            Nuovo XML <span className="font-normal text-muted">· bozza</span>
          </h1>
        </div>
        <div className="flex gap-1.5 pb-0.5">
          {labels.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static label list
                key={i}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${
                  active ? 'bg-ink text-paper' : done ? 'text-accent' : 'text-muted'
                }`}
              >
                {done ? (
                  <CheckIcon size={12} />
                ) : (
                  <span className="font-mono text-xs">{i + 1}</span>
                )}
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
