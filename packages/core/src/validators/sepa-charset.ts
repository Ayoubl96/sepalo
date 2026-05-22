const SEPA_REGEX = /^[a-zA-Z0-9/ \-?:().,'+ ]*$/;

const ACCENT_MAP: Record<string, string> = {
  à: 'a',
  á: 'a',
  â: 'a',
  ã: 'a',
  ä: 'a',
  å: 'a',
  è: 'e',
  é: 'e',
  ê: 'e',
  ë: 'e',
  ì: 'i',
  í: 'i',
  î: 'i',
  ï: 'i',
  ò: 'o',
  ó: 'o',
  ô: 'o',
  õ: 'o',
  ö: 'o',
  ù: 'u',
  ú: 'u',
  û: 'u',
  ü: 'u',
  ý: 'y',
  ÿ: 'y',
  ç: 'c',
  ñ: 'n',
  ß: 'ss',
  À: 'A',
  Á: 'A',
  Â: 'A',
  Ã: 'A',
  Ä: 'A',
  Å: 'A',
  È: 'E',
  É: 'E',
  Ê: 'E',
  Ë: 'E',
  Ì: 'I',
  Í: 'I',
  Î: 'I',
  Ï: 'I',
  Ò: 'O',
  Ó: 'O',
  Ô: 'O',
  Õ: 'O',
  Ö: 'O',
  Ù: 'U',
  Ú: 'U',
  Û: 'U',
  Ü: 'U',
  Ý: 'Y',
  Ç: 'C',
  Ñ: 'N',
};

export interface SanitizeReplacement {
  position: number;
  original: string;
  replacement: string;
}

export interface SanitizeResult {
  sanitized: string;
  replacements: SanitizeReplacement[];
}

export function sanitize(text: string): SanitizeResult {
  const replacements: SanitizeReplacement[] = [];
  let sanitized = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if (SEPA_REGEX.test(ch)) {
      sanitized += ch;
    } else if (ch in ACCENT_MAP) {
      const replacement = ACCENT_MAP[ch] ?? '';
      replacements.push({ position: i, original: ch, replacement });
      sanitized += replacement;
    } else {
      replacements.push({ position: i, original: ch, replacement: ' ' });
      sanitized += ' ';
    }
  }

  return { sanitized, replacements };
}

export function isSepaCompliant(text: string): boolean {
  return SEPA_REGEX.test(text);
}
