'use client';

import { Button } from '@/components/ui/button';
import { parseFile } from '@/lib/parse';
import type { ParsedSheet } from '@/lib/parse';
import { UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';

interface UploadStepProps {
  onParsed: (sheet: ParsedSheet, fileName: string) => void;
}

const ACCEPT = '.csv,.xlsx,.xls';

export function UploadStep({ onParsed }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handle(file: File) {
    setError('');
    setLoading(true);
    try {
      const sheet = await parseFile(file);
      if (sheet.headers.length === 0) throw new Error('No columns found in file.');
      if (sheet.rows.length === 0) throw new Error('File has no data rows.');
      onParsed(sheet, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file.');
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handle(file);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-16 text-center">
      <h1 className="text-2xl font-semibold text-ink mb-2">Generate XML</h1>
      <p className="text-sm text-muted mb-8 max-w-sm">
        Upload a CSV or Excel file with your payment data. All processing happens locally.
      </p>

      <button
        type="button"
        className={`w-full max-w-md rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer bg-transparent text-left ${
          dragging ? 'border-primary bg-primary-soft' : 'border-line hover:border-primary-soft'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        aria-label="Upload file"
      >
        <UploadIcon className="mx-auto h-10 w-10 text-muted-2 mb-4" />
        <p className="text-sm font-medium text-ink">Drop a file here or click to browse</p>
        <p className="text-xs text-muted mt-1">.csv, .xlsx, .xls</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />

      {loading && <p className="mt-4 text-sm text-muted">Parsing file…</p>}
      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      <div className="mt-8 text-left max-w-md w-full">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-2 mb-2">
          Expected columns
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted">
          <span>
            <span className="text-ink font-medium">name</span> — beneficiary name
          </span>
          <span>
            <span className="text-ink font-medium">iban</span> — beneficiary IBAN
          </span>
          <span>
            <span className="text-ink font-medium">amount</span> — payment amount (€)
          </span>
          <span>
            <span className="text-ink font-medium">description</span> — remittance info
          </span>
          <span>
            <span className="text-ink font-medium">bic</span> — BIC/SWIFT (optional)
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted"
          onClick={(e) => {
            e.stopPropagation();
            downloadSample();
          }}
        >
          Download sample CSV
        </Button>
      </div>
    </div>
  );
}

function downloadSample() {
  const csv = [
    'name,iban,bic,amount,description',
    'Mario Rossi,IT60X0542811101000000123456,BCITITMM,100.00,Fattura 2024/001',
    'Acme S.r.l.,IT60X0542811101000000123456,,250.50,Servizi marzo',
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sepalo-sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}
