import { describe, expect, it } from 'vitest';
import { generatePaymentFile } from '../../api/generate.js';
import { buildXml } from '../../builders/document.js';
import type { PaymentBatch } from '../../types/index.js';
import { validateAgainstXsd } from '../../validators/xsd.js';
import fixture01 from '../fixtures/input/01-single-tx.json' assert { type: 'json' };
import fixture02 from '../fixtures/input/02-multi-tx.json' assert { type: 'json' };
import fixture03 from '../fixtures/input/03-foreign-iban.json' assert { type: 'json' };
import fixture06 from '../fixtures/input/06-valid-pipeline.json' assert { type: 'json' };

const FIXED_DATE = new Date('2024-12-10T10:00:00.000Z');

function buildFixed(batch: PaymentBatch): string {
  return buildXml(batch, FIXED_DATE);
}

describe('validateAgainstXsd — valid XML', () => {
  it('passes for fixture 01 (single IT transaction)', async () => {
    const xml = buildFixed(fixture01 as PaymentBatch);
    const result = await validateAgainstXsd(xml);
    expect(result.errors, JSON.stringify(result.errors, null, 2)).toHaveLength(0);
    expect(result.valid).toBe(true);
  });

  it('passes for fixture 02 (multiple transactions)', async () => {
    const xml = buildFixed(fixture02 as PaymentBatch);
    const result = await validateAgainstXsd(xml);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes for fixture 03 (foreign IBAN with BIC)', async () => {
    const xml = buildFixed(fixture03 as PaymentBatch);
    const result = await validateAgainstXsd(xml);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateAgainstXsd — invalid XML', () => {
  it('rejects malformed XML', async () => {
    const result = await validateAgainstXsd('<broken>');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects XML missing required CBIEnvelPaymentRequest wrapper', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CBIBdyPaymentRequest xmlns="urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01">
  <PmtInf><PmtInfId>PMT001</PmtInfId><PmtMtd>TRF</PmtMtd></PmtInf>
</CBIBdyPaymentRequest>`;
    const result = await validateAgainstXsd(xml);
    expect(result.valid).toBe(false);
    expect(result.errors[0]?.code).toBe('XSD_VALIDATION_ERROR');
  });

  it('rejects wrong root element name', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01">
  <GrpHdr><MsgId>MSG001</MsgId></GrpHdr>
</Document>`;
    const result = await validateAgainstXsd(xml);
    expect(result.valid).toBe(false);
  });

  it('rejects an empty <Ustrd> remittance element (Max140Text minLength=1)', async () => {
    // Build a valid XML, then replace the Ustrd text with an empty one to
    // reproduce the bank-rejection scenario reported by Intesa.
    const xml = buildFixed(fixture01 as PaymentBatch).replace(
      /<pmrq:Ustrd>[^<]*<\/pmrq:Ustrd>/,
      '<pmrq:Ustrd></pmrq:Ustrd>',
    );
    const result = await validateAgainstXsd(xml);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /Ustrd|Max140Text/.test(e.message))).toBe(true);
  });
});

describe('generatePaymentFile — orchestrator', () => {
  it('returns valid XML and no errors for fully valid batch', async () => {
    const result = await generatePaymentFile(fixture06 as PaymentBatch);
    expect(result.errors).toHaveLength(0);
    expect(result.xml).toContain('<CBIBdyPaymentRequest');
    expect(result.xml).toContain('<CBIEnvelPaymentRequest>');
    expect(result.xml).toContain('<CBIPaymentRequest>');
    expect(result.xml).toContain('<pmrq:MsgId>');
  });

  it('includes business errors when initiator IBAN is invalid', async () => {
    const batch: PaymentBatch = {
      ...(fixture06 as PaymentBatch),
      initiator: {
        ...(fixture06 as PaymentBatch).initiator,
        iban: 'XX00000000000000',
      },
    };
    const result = await generatePaymentFile(batch);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain('INVALID_IBAN');
  });

  it('always returns XML even when errors are present', async () => {
    const batch: PaymentBatch = {
      ...(fixture06 as PaymentBatch),
      initiator: {
        ...(fixture06 as PaymentBatch).initiator,
        iban: 'INVALID',
      },
    };
    const result = await generatePaymentFile(batch);
    expect(result.xml).toBeTruthy();
    expect(result.xml).toContain('<CBIBdyPaymentRequest');
  });

  it('propagates SEPA charset warnings', async () => {
    const batch: PaymentBatch = {
      ...(fixture06 as PaymentBatch),
      transactions: [
        {
          ...(fixture06 as PaymentBatch).transactions[0]!,
          remittanceInfo: 'Pagamento per caffè',
        },
      ],
    };
    const result = await generatePaymentFile(batch);
    const warnCodes = result.warnings.map((w) => w.code);
    expect(warnCodes).toContain('SEPA_CHARSET_SANITIZED');
  });
});
