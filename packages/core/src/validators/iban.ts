export const SEPA_COUNTRIES = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IS',
  'IE',
  'IT',
  'LV',
  'LI',
  'LT',
  'LU',
  'MT',
  'MC',
  'NL',
  'NO',
  'PL',
  'PT',
  'RO',
  'SM',
  'SK',
  'SI',
  'ES',
  'SE',
  'CH',
  'GB',
  'VA',
]);

const IBAN_LENGTHS: Record<string, number> = {
  AD: 24,
  AE: 23,
  AL: 28,
  AT: 20,
  AZ: 28,
  BA: 20,
  BE: 16,
  BG: 22,
  BH: 22,
  BR: 29,
  BY: 28,
  CH: 21,
  CR: 22,
  CY: 28,
  CZ: 24,
  DE: 22,
  DK: 18,
  DO: 28,
  EE: 20,
  EG: 29,
  ES: 24,
  FI: 18,
  FK: 18,
  FR: 27,
  GB: 22,
  GE: 22,
  GI: 23,
  GL: 18,
  GR: 27,
  GT: 28,
  HR: 21,
  HU: 28,
  IE: 22,
  IL: 23,
  IQ: 23,
  IS: 26,
  IT: 27,
  JO: 30,
  KW: 30,
  KZ: 20,
  LB: 28,
  LC: 32,
  LI: 21,
  LT: 20,
  LU: 20,
  LV: 21,
  LY: 25,
  MC: 27,
  MD: 24,
  ME: 22,
  MK: 19,
  MR: 27,
  MT: 31,
  MU: 30,
  NL: 18,
  NO: 15,
  PK: 24,
  PL: 28,
  PS: 29,
  PT: 25,
  QA: 29,
  RO: 24,
  RS: 22,
  SA: 24,
  SC: 31,
  SD: 18,
  SE: 24,
  SI: 19,
  SK: 24,
  SM: 27,
  ST: 25,
  SV: 28,
  TL: 23,
  TN: 24,
  TR: 26,
  UA: 29,
  VA: 22,
  VG: 24,
  XK: 20,
};

export interface IbanValidationResult {
  valid: boolean;
  country: string;
  isSepa: boolean;
  isItalian: boolean;
  error?: string;
}

function mod97(numeric: string): number {
  let remainder = 0;
  for (const ch of numeric) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder;
}

function toNumeric(iban: string): string {
  return iban
    .toUpperCase()
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 65 && code <= 90 ? String(code - 55) : ch;
    })
    .join('');
}

function validateItalianCin(iban: string): boolean {
  // Italian IBAN: ITkk BBBBB SSSSS CCCCCCCCCCC (k=check digits, B=ABI, S=CAB, C=account)
  // CIN is the character at position 4 (0-indexed) of the BBAN (positions 4-26 of the IBAN)
  // BBAN = iban[4..26] => cin at iban[4], abi at iban[5..9], cab at iban[10..14], account at iban[15..26]
  const bban = iban.slice(4); // 23 chars
  if (bban.length !== 23) return false;

  const cin = bban[0];
  const rest = bban.slice(1); // 22 chars: ABI(5) + CAB(5) + account(12)

  const oddTable: Record<string, number> = {
    '0': 1,
    '1': 0,
    '2': 5,
    '3': 7,
    '4': 9,
    '5': 13,
    '6': 15,
    '7': 17,
    '8': 19,
    '9': 21,
    A: 1,
    B: 0,
    C: 5,
    D: 7,
    E: 9,
    F: 13,
    G: 15,
    H: 17,
    I: 19,
    J: 21,
    K: 2,
    L: 4,
    M: 18,
    N: 20,
    O: 11,
    P: 3,
    Q: 6,
    R: 8,
    S: 12,
    T: 14,
    U: 16,
    V: 10,
    W: 22,
    X: 25,
    Y: 24,
    Z: 23,
  };
  const evenTable: Record<string, number> = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25,
  };

  let sum = 0;
  for (let i = 0; i < rest.length; i++) {
    const ch = rest.charAt(i).toUpperCase();
    // positions are 1-indexed: odd positions use oddTable, even use evenTable
    sum += (i + 1) % 2 === 1 ? (oddTable[ch] ?? 0) : (evenTable[ch] ?? 0);
  }

  const expected = String.fromCharCode(65 + (sum % 26));
  return cin?.toUpperCase() === expected;
}

export function validateIban(raw: string): IbanValidationResult {
  const iban = raw.replace(/\s/g, '').toUpperCase();

  if (iban.length < 2) {
    return { valid: false, country: '', isSepa: false, isItalian: false, error: 'IBAN too short' };
  }

  const country = iban.slice(0, 2);

  if (!/^[A-Z]{2}$/.test(country)) {
    return {
      valid: false,
      country: '',
      isSepa: false,
      isItalian: false,
      error: 'Invalid country code',
    };
  }

  const expectedLength = IBAN_LENGTHS[country];
  if (expectedLength === undefined) {
    return {
      valid: false,
      country,
      isSepa: false,
      isItalian: false,
      error: `Unknown country code: ${country}`,
    };
  }

  if (iban.length !== expectedLength) {
    return {
      valid: false,
      country,
      isSepa: false,
      isItalian: false,
      error: `Invalid length: expected ${expectedLength}, got ${iban.length}`,
    };
  }

  if (!/^[A-Z0-9]+$/.test(iban)) {
    return {
      valid: false,
      country,
      isSepa: false,
      isItalian: false,
      error: 'Invalid characters in IBAN',
    };
  }

  // Rearrange: move first 4 chars to end, then convert to numeric
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = toNumeric(rearranged);

  if (mod97(numeric) !== 1) {
    return {
      valid: false,
      country,
      isSepa: false,
      isItalian: false,
      error: 'Invalid checksum (mod-97 failed)',
    };
  }

  const isItalian = country === 'IT';

  if (isItalian && !validateItalianCin(iban)) {
    return {
      valid: false,
      country,
      isSepa: false,
      isItalian: true,
      error: 'Invalid Italian CIN character',
    };
  }

  const isSepa = SEPA_COUNTRIES.has(country);

  return { valid: true, country, isSepa, isItalian };
}
