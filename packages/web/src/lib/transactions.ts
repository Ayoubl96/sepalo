import type { ColumnMap } from '@/components/genera/MapStep';
import type { Transaction } from '@sepalo/core';
import { parseAmount } from './parse';

/**
 * ISO 20022 category purpose codes offered in the UI, with Italian labels.
 * Emitted as CtgyPurp/Cd — mandatory for Italian beneficiary IBANs (CBI 2.12.2.3).
 * All codes are valid in both the ExternalCategoryPurpose and ExternalPurpose lists.
 */
export const CATEGORY_PURPOSES: { code: string; label: string }[] = [
  { code: 'OTHR', label: 'Altro (predefinito)' },
  { code: 'SUPP', label: 'Pagamento a fornitore' },
  { code: 'SALA', label: 'Stipendio' },
  { code: 'PENS', label: 'Pensione' },
  { code: 'SSBE', label: 'Previdenza / contributi sociali' },
  { code: 'TAXS', label: 'Pagamento tasse' },
  { code: 'VATX', label: 'Pagamento IVA' },
  { code: 'TRAD', label: 'Transazione commerciale' },
  { code: 'INTC', label: 'Pagamento infragruppo' },
  { code: 'INTE', label: 'Interessi' },
  { code: 'GOVT', label: 'Pagamento verso la P.A.' },
  { code: 'TREA', label: 'Operazione di tesoreria' },
  { code: 'CASH', label: 'Gestione liquidità' },
];

export const DEFAULT_PURPOSE = 'OTHR';

const PURPOSE_CODE = /^[A-Z0-9]{1,4}$/;

/** Resolves the category purpose for a row: a valid per-row value overrides the batch default. */
function resolvePurpose(rowValue: string | undefined, defaultPurpose: string): string {
  const code = (rowValue ?? '').trim().toUpperCase();
  return PURPOSE_CODE.test(code) ? code : defaultPurpose;
}

/**
 * Maps parsed spreadsheet rows to core `Transaction` objects.
 * Shared by the review and generate steps to keep a single source of truth.
 */
export function rowsToTransactions(
  rows: Record<string, string>[],
  columnMap: ColumnMap,
  defaultPurpose: string,
): Transaction[] {
  const remittanceMapped = columnMap.remittanceInfo !== '';
  const purposeMapped = columnMap.purpose !== '';

  return rows.map((row) => {
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
      purpose: resolvePurpose(purposeMapped ? row[columnMap.purpose] : undefined, defaultPurpose),
    };
  });
}
