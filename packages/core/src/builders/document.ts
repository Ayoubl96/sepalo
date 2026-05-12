import { XMLBuilder } from 'fast-xml-parser';
import type { PaymentBatch } from '../types/index.js';
import { buildGroupHeader } from './group-header.js';
import { buildPaymentInfo } from './payment-info.js';

const BODY_NS = 'urn:CBI:xsd:CBIBdyPaymentRequest.00.04.01';
const PMRQ_NS = 'urn:CBI:xsd:CBIPaymentRequest.00.04.01';
const PMRQ = 'pmrq';

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: true,
});

function withPrefix(prefix: string, obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map((item) => withPrefix(prefix, item));
  if (typeof obj !== 'object' || obj === null) return obj;
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
      k.startsWith('@_') || k === '#text' ? k : `${prefix}:${k}`,
      withPrefix(prefix, v),
    ]),
  );
}

export function buildXml(batch: PaymentBatch, creationDate: Date = new Date()): string {
  const doc = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    CBIBdyPaymentRequest: {
      '@_xmlns': BODY_NS,
      [`@_xmlns:${PMRQ}`]: PMRQ_NS,
      CBIEnvelPaymentRequest: {
        CBIPaymentRequest: withPrefix(PMRQ, {
          GrpHdr: buildGroupHeader(batch, creationDate),
          PmtInf: buildPaymentInfo(batch, creationDate),
        }),
      },
    },
  };

  return builder.build(doc) as string;
}
