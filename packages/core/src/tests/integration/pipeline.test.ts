import { describe, expect, it } from 'vitest';
import { buildXml } from '../../builders/document.js';
import type { PaymentBatch } from '../../types/index.js';
import fixture01 from '../fixtures/input/01-single-tx.json' assert { type: 'json' };
import fixture02 from '../fixtures/input/02-multi-tx.json' assert { type: 'json' };
import fixture03 from '../fixtures/input/03-foreign-iban.json' assert { type: 'json' };
import fixture04 from '../fixtures/input/04-large-amounts.json' assert { type: 'json' };
import fixture05 from '../fixtures/input/05-special-chars.json' assert { type: 'json' };

const FIXED_DATE = new Date('2024-12-10T10:00:00.000Z');
const NS = 'urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01';

function buildFixed(batch: PaymentBatch): string {
  return buildXml(batch, FIXED_DATE);
}

describe('buildXml — fixture 01: single IT transaction', () => {
  const xml = buildFixed(fixture01 as PaymentBatch);

  it('starts with XML declaration', () => {
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it('uses CBIBdyPaymentRequest root element with correct namespace', () => {
    expect(xml).toContain(`<CBIBdyPaymentRequest xmlns="${NS}">`);
  });

  it('has NbOfTxs = 1', () => {
    expect(xml).toContain('<NbOfTxs>1</NbOfTxs>');
  });

  it('has CtrlSum = 100.50', () => {
    expect(xml).toContain('<CtrlSum>100.50</CtrlSum>');
  });

  it('has correct ReqdExctnDt with Dt sub-element', () => {
    expect(xml).toContain('<ReqdExctnDt>');
    expect(xml).toContain('<Dt>2024-12-15</Dt>');
  });

  it('contains initiator IBAN in DbtrAcct', () => {
    expect(xml).toContain('<IBAN>IT60X0542811101000000123456</IBAN>');
  });

  it('contains DbtrAgt with ITNCC and ABI', () => {
    expect(xml).toContain('<Cd>ITNCC</Cd>');
    expect(xml).toContain('<MmbId>05428</MmbId>');
  });

  it('has EndToEndId = E2E-001', () => {
    expect(xml).toContain('<EndToEndId>E2E-001</EndToEndId>');
  });

  it('has CUC identifier in InitgPty', () => {
    expect(xml).toContain('<Cd>CUC</Cd>');
    expect(xml).toContain('<Id>ABC12345</Id>');
  });

  it('does NOT contain CdtrAgt for Italian IBAN', () => {
    expect(xml).not.toContain('<CdtrAgt>');
  });
});

describe('buildXml — fixture 02: multi-transaction batch', () => {
  const xml = buildFixed(fixture02 as PaymentBatch);

  it('has NbOfTxs = 10 in GrpHdr', () => {
    expect(xml.match(/<NbOfTxs>10<\/NbOfTxs>/g)).toHaveLength(2);
  });

  it('has BtchBookg = false', () => {
    expect(xml).toContain('<BtchBookg>false</BtchBookg>');
  });

  it('has correct CtrlSum (sum of all amounts)', () => {
    const expected = (100 + 250.75 + 75.2 + 500 + 1200 + 88.5 + 340 + 60 + 175.3 + 420).toFixed(2);
    expect(xml).toContain(`<CtrlSum>${expected}</CtrlSum>`);
  });
});

describe('buildXml — fixture 03: foreign IBAN with BIC', () => {
  const xml = buildFixed(fixture03 as PaymentBatch);

  it('contains CdtrAgt with BIC for non-IT SEPA IBAN', () => {
    expect(xml).toContain('<CdtrAgt>');
    expect(xml).toContain('<BICFI>COBADEFFXXX</BICFI>');
  });

  it('has the German IBAN in CdtrAcct', () => {
    expect(xml).toContain('<IBAN>DE89370400440532013000</IBAN>');
  });
});

describe('buildXml — fixture 04: large amounts', () => {
  const xml = buildFixed(fixture04 as PaymentBatch);

  it('has CtrlSum = 999999999.99', () => {
    expect(xml).toContain('<CtrlSum>999999999.99</CtrlSum>');
  });

  it('has InstdAmt = 999999999.99', () => {
    expect(xml).toContain('999999999.99');
  });
});

describe('buildXml — fixture 05: special characters sanitized', () => {
  const xml = buildFixed(fixture05 as PaymentBatch);

  it('sanitizes accented characters in remittanceInfo', () => {
    expect(xml).not.toContain('à');
    expect(xml).not.toContain('è');
    expect(xml).not.toContain('—');
  });

  it('sanitizes accented characters in beneficiary name', () => {
    expect(xml).not.toContain('ç');
    expect(xml).not.toContain('ü');
    expect(xml).toContain('Francois Muller');
  });

  it('sanitizes initiator name', () => {
    expect(xml).not.toContain('à');
    expect(xml).toContain('Societa Caffe');
  });
});
