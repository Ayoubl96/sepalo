import { buildXml } from '../builders/document.js';
import type { PaymentBatch, ValidationError, ValidationWarning } from '../types/index.js';
import { validatePayment } from '../validators/index.js';
import { validateAgainstXsd } from '../validators/xsd.js';

export interface GenerateResult {
  xml: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export async function generatePaymentFile(batch: PaymentBatch): Promise<GenerateResult> {
  const { errors: businessErrors, warnings } = validatePayment(batch);
  const xml = buildXml(batch);
  const { errors: xsdErrors } = await validateAgainstXsd(xml);

  return {
    xml,
    errors: [...businessErrors, ...xsdErrors],
    warnings,
  };
}
