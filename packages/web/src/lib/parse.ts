export interface ParsedSheet {
  headers: string[];
  rows: Record<string, string>[];
}

export async function parseFile(file: File): Promise<ParsedSheet> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return parseCsv(file);
  if (ext === 'xlsx' || ext === 'xls') return parseXlsx(file);
  throw new Error(`Unsupported file type: .${ext}`);
}

function parseCsv(file: File): Promise<ParsedSheet> {
  return new Promise((resolve, reject) => {
    import('papaparse').then(({ default: Papa }) => {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const headers = result.meta.fields ?? [];
          resolve({ headers, rows: result.data });
        },
        error: reject,
      });
    });
  });
}

async function parseXlsx(file: File): Promise<ParsedSheet> {
  const { read, utils } = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const wb = read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0] ?? ''];
  if (!ws) throw new Error('Empty workbook');
  const raw = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
  if (raw.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(raw[0] ?? {});
  const rows = raw.map((r) => Object.fromEntries(headers.map((h) => [h, String(r[h] ?? '')])));
  return { headers, rows };
}

const FIELD_KEYWORDS: Record<string, string[]> = {
  beneficiaryName: ['name', 'nome', 'beneficiary', 'beneficiario', 'ragione'],
  beneficiaryIban: ['iban'],
  beneficiaryBic: ['bic', 'swift'],
  amount: ['amount', 'importo', 'value', 'valore', 'amount_eur', 'importo_eur'],
  remittanceInfo: ['description', 'descrizione', 'remittance', 'causale', 'note', 'notes'],
};

export function autoDetectColumns(headers: string[]): Record<string, string> {
  const lower = headers.map((h) => h.toLowerCase());
  const result: Record<string, string> = {};
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    const idx = lower.findIndex((h) => keywords.some((kw) => h.includes(kw)));
    if (idx !== -1) result[field] = headers[idx] ?? '';
  }
  return result;
}
