'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

interface PinPadProps {
  digits: string[];
  onChange: (digits: string[]) => void;
  onComplete: (pin: string) => void;
  disabled?: boolean;
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export function PinPad({ digits, onChange, onComplete, disabled = false }: PinPadProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (digits.length === 6) {
      onCompleteRef.current(digits.join(''));
    }
  }, [digits]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (disabled) return;
      if (e.key >= '0' && e.key <= '9') {
        onChange([...digits, e.key].slice(0, 6));
      } else if (e.key === 'Backspace') {
        onChange(digits.slice(0, -1));
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [digits, onChange, disabled]);

  function press(value: string) {
    if (disabled) return;
    if (value === '⌫') {
      onChange(digits.slice(0, -1));
    } else if (value !== '' && digits.length < 6) {
      onChange([...digits, value]);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <fieldset className="flex gap-3 border-none p-0 m-0" aria-label="PIN input">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional dots
            key={i}
            className={`h-3 w-3 rounded-full transition-colors ${
              i < digits.length ? 'bg-primary' : 'bg-line border border-line-strong'
            }`}
          />
        ))}
      </fieldset>

      <div className="grid grid-cols-3 gap-3">
        {ROWS.flat().map((label, i) => (
          <Button
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-layout keypad
            key={i}
            variant="outline"
            className={`h-14 w-14 text-lg font-medium ${label === '' ? 'invisible' : ''}`}
            onClick={() => press(label)}
            disabled={disabled || label === ''}
            aria-label={label === '⌫' ? 'Delete' : label === '' ? undefined : label}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
