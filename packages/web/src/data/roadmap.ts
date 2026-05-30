export type ItemStatus = 'doing' | 'planned' | 'done';

export interface RoadmapItem {
  label: string;
  sub?: string;
  status: ItemStatus;
}

export interface RoadmapColumn {
  label: string;
  color: string;
  sub: string;
  items: RoadmapItem[];
}

export const roadmapColumns: RoadmapColumn[] = [
  {
    label: 'Now',
    color: '#1971c2',
    sub: 'Cosa stiamo facendo',
    items: [
      { status: 'doing', label: 'Improve guida utente e documentazione' },
      { status: 'doing', label: 'Modifica csv caricato + ricerca' },
      { status: 'doing', label: 'Template CSV scaricabili' },
      {
        status: 'doing',
        label: '@sepalo/core su npm',
        sub: 'libreria TS standalone',
      },
    ],
  },
  {
    label: 'Next',
    color: '#e8590c',
    sub: 'Subito dopo',
    items: [
      { status: 'planned', label: 'PWA installabile + offline' },
      { status: 'planned', label: 'Tema scuro' },
      { status: 'planned', label: 'Suite test e2e' },
      { status: 'planned', label: 'Immagine docker per @sepalo/web' },
    ],
  },
  {
    label: 'Later',
    color: '#6741d9',
    sub: 'Forse, un giorno',
    items: [
      { status: 'planned', label: 'Storico file generati' },
      { status: 'planned', label: 'Impostare PIN sicurezza' },
      { status: 'planned', label: 'Libreria Sepa Direct Debit' },
    ],
  },
];

export const shippedItems: string[] = [
  'Generazione XML CBI 00.04.01',
  'Validazione XSD nel browser',
  'Import CSV / XLSX',
  'Flusso 3 passi (carica, verifica, genera)',
  'Profilo ordinante cifrato (AES-256)',
  'Validazione IBAN con checksum',
];
