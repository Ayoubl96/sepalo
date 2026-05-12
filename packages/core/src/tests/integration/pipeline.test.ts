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
const PMRQ_NS = 'urn:CBI:xsd:CBIPaymentRequest.00.04.01';

function buildFixed(batch: PaymentBatch): string {
  return buildXml(batch, FIXED_DATE);
}

describe('buildXml — fixture 01: single IT transaction', () => {
  const xml = buildFixed(fixture01 as PaymentBatch);

  it('starts with XML declaration', () => {
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it('uses CBIBdyPaymentRequest root element with correct namespaces', () => {
    expect(xml).toContain(`<CBIBdyPaymentRequest xmlns="${NS}"`);
    expect(xml).toContain(`xmlns:pmrq="${PMRQ_NS}"`);
    expect(xml).toContain('<CBIEnvelPaymentRequest>');
    expect(xml).toContain('<CBIPaymentRequest>');
  });

  it('has pmrq:NbOfTxs = 1', () => {
    expect(xml).toContain('<pmrq:NbOfTxs>1</pmrq:NbOfTxs>');
  });

  it('has pmrq:CtrlSum = 100.50', () => {
    expect(xml).toContain('<pmrq:CtrlSum>100.50</pmrq:CtrlSum>');
  });

  it('has correct pmrq:ReqdExctnDt with pmrq:Dt sub-element', () => {
    expect(xml).toContain('<pmrq:ReqdExctnDt>');
    expect(xml).toContain('<pmrq:Dt>2024-12-15</pmrq:Dt>');
  });

  it('contains initiator IBAN in pmrq:DbtrAcct', () => {
    expect(xml).toContain('<pmrq:IBAN>IT60X0542811101000000123456</pmrq:IBAN>');
  });

  it('contains pmrq:DbtrAgt with pmrq:MmbId', () => {
    expect(xml).toContain('<pmrq:MmbId>05428</pmrq:MmbId>');
  });

  it('does NOT contain ITNCC ClrSysId in DbtrAgt', () => {
    expect(xml).not.toContain('<pmrq:Cd>ITNCC</pmrq:Cd>');
  });

  it('has pmrq:EndToEndId = E2E-001', () => {
    expect(xml).toContain('<pmrq:EndToEndId>E2E-001</pmrq:EndToEndId>');
  });

  it('has CUC identifier in pmrq:InitgPty', () => {
    expect(xml).toContain('<pmrq:Issr>CUC</pmrq:Issr>');
    expect(xml).toContain('<pmrq:Id>ABC12345</pmrq:Id>');
  });

  it('does NOT contain pmrq:CdtrAgt for Italian IBAN', () => {
    expect(xml).not.toContain('<pmrq:CdtrAgt>');
  });

  it('has pmrq:ChrgBr = SLEV', () => {
    expect(xml).toContain('<pmrq:ChrgBr>SLEV</pmrq:ChrgBr>');
  });

  it('has pmrq:PmtTpInf with InstrPrty, SvcLvl and LclInstrm', () => {
    expect(xml).toContain('<pmrq:InstrPrty>NORM</pmrq:InstrPrty>');
    expect(xml).toContain('<pmrq:SvcLvl>');
    expect(xml).toContain('<pmrq:LclInstrm>');
  });
});

describe('buildXml — fixture 02: multi-transaction batch', () => {
  const xml = buildFixed(fixture02 as PaymentBatch);

  it('has pmrq:NbOfTxs = 10 in GrpHdr', () => {
    expect(xml).toContain('<pmrq:NbOfTxs>10</pmrq:NbOfTxs>');
  });

  it('has pmrq:BtchBookg = false', () => {
    expect(xml).toContain('<pmrq:BtchBookg>false</pmrq:BtchBookg>');
  });

  it('has correct pmrq:CtrlSum (sum of all amounts)', () => {
    const expected = (100 + 250.75 + 75.2 + 500 + 1200 + 88.5 + 340 + 60 + 175.3 + 420).toFixed(2);
    expect(xml).toContain(`<pmrq:CtrlSum>${expected}</pmrq:CtrlSum>`);
  });
});

describe('buildXml — fixture 03: foreign IBAN with BIC', () => {
  const xml = buildFixed(fixture03 as PaymentBatch);

  it('contains pmrq:CdtrAgt with pmrq:BICFI for non-IT SEPA IBAN', () => {
    expect(xml).toContain('<pmrq:CdtrAgt>');
    expect(xml).toContain('<pmrq:BICFI>COBADEFFXXX</pmrq:BICFI>');
  });

  it('has the German IBAN in pmrq:CdtrAcct', () => {
    expect(xml).toContain('<pmrq:IBAN>DE89370400440532013000</pmrq:IBAN>');
  });
});

describe('buildXml — fixture 04: large amounts', () => {
  const xml = buildFixed(fixture04 as PaymentBatch);

  it('has pmrq:CtrlSum = 999999999.99', () => {
    expect(xml).toContain('<pmrq:CtrlSum>999999999.99</pmrq:CtrlSum>');
  });

  it('has pmrq:InstdAmt = 999999999.99', () => {
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
