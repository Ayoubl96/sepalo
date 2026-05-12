import { CBI_BODY_XSD, CBI_PAYMENT_REQUEST_XSD } from '../data/xsd/index.js';
import type { ValidationError, ValidationResult } from '../types/index.js';

export async function validateAgainstXsd(xml: string): Promise<ValidationResult> {
  const { validateXML } = await import('xmllint-wasm');

  const result = await validateXML({
    xml: [{ fileName: 'payment.xml', contents: xml }],
    schema: [
      { fileName: 'CBIPaymentRequest.00.04.01.xsd', contents: CBI_PAYMENT_REQUEST_XSD },
      { fileName: 'CBIBdyPaymentRequest.00.04.01.xsd', contents: CBI_BODY_XSD },
    ],
  });

  if (result.valid) {
    return { valid: true, errors: [], warnings: [] };
  }

  const errors: ValidationError[] = result.errors.map((e) => ({
    path: e.loc ? `xml:line:${e.loc.lineNumber}` : 'xml',
    code: 'XSD_VALIDATION_ERROR',
    message: e.message,
  }));

  return { valid: false, errors, warnings: [] };
}
