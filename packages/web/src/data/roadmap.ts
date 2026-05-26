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
      { status: 'doing', label: 'Pagine pubbliche e landing', sub: 'in corso' },
      { status: 'doing', label: 'Guida utente e documentazione' },
      { status: 'doing', label: 'Analytics Rybbit (self-hosted)' },
    ],
  },
  {
    label: 'Next',
    color: '#e8590c',
    sub: 'Subito dopo',
    items: [
      { status: 'planned', label: 'PWA installabile + offline' },
      { status: 'planned', label: 'Template CSV/XLSX scaricabili' },
      { status: 'planned', label: 'Suite test e2e' },
      { status: 'planned', label: '@sepalo/core su npm', sub: 'libreria TS standalone' },
    ],
  },
  {
    label: 'Later',
    color: '#6741d9',
    sub: 'Forse, un giorno',
    items: [
      { status: 'planned', label: 'Tema scuro' },
      { status: 'planned', label: 'Storico file generati' },
      { status: 'planned', label: 'CLI nativa per CI/CD' },
      { status: 'planned', label: 'Multi-lingua: EN + DE' },
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
