'use client';

import { parseFile } from '@/lib/parse';
import type { ParsedSheet } from '@/lib/parse';
import { DownloadIcon, InfoIcon, UploadIcon } from 'lucide-react';
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
      if (sheet.headers.length === 0) throw new Error('Nessuna colonna trovata nel file.');
      if (sheet.rows.length === 0) throw new Error('Il file non contiene righe di dati.');
      onParsed(sheet, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore durante la lettura del file.');
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
    <div className="flex flex-col items-center justify-center min-h-full px-8 py-16">
      <div className="max-w-2xl w-full">
        <button
          type="button"
          aria-label="Area di caricamento file"
          className={`relative w-full h-80 rounded-2xl border-2 border-dashed p-0 transition-colors cursor-pointer ${
            dragging ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/40'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-4 h-full">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center shadow-md">
              <UploadIcon size={28} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-ink mb-1">Rilascia il file qui</p>
              <p className="text-sm text-muted">
                oppure{' '}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  scegli dal computer
                </button>
              </p>
            </div>
          </div>
          <p className="absolute bottom-4 left-0 right-0 text-center text-[11px] text-muted">
            CSV (UTF-8 o Latin-1) · XLSX · max 5 MB / 5.000 righe
          </p>
        </button>

        <div className="mt-5 flex justify-between items-center text-sm">
          <button
            type="button"
            className="flex items-center gap-1.5 text-primary"
            onClick={downloadSample}
          >
            <DownloadIcon size={14} />
            Scarica un CSV di esempio
          </button>
          <span className="flex items-center gap-1.5 text-muted">
            <InfoIcon size={14} />
            Quali colonne servono?
          </span>
        </div>
      </div>

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

      {loading && <p className="mt-6 text-sm text-muted">Analisi in corso…</p>}
      {error && <p className="mt-6 text-sm text-error">{error}</p>}
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
