import { sanitize as sepaCharsetSanitize } from '../validators/sepa-charset.js';

export function sanitizeText(text: string): string {
  return sepaCharsetSanitize(text).sanitized;
}
