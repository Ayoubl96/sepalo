import { XMLBuilder } from 'fast-xml-parser';
import type { PaymentBatch } from '../types/index.js';
import { buildGroupHeader } from './group-header.js';
import { buildPaymentInfo } from './payment-info.js';

const NAMESPACE = 'urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01';

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: true,
});

export function buildXml(batch: PaymentBatch, creationDate: Date = new Date()): string {
  const doc = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    CBIBdyPaymentRequest: {
      '@_xmlns': NAMESPACE,
      GrpHdr: buildGroupHeader(batch, creationDate),
      PmtInf: buildPaymentInfo(batch, creationDate),
    },
  };

  return builder.build(doc) as string;
}
