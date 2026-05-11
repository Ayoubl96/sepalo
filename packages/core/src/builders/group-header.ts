import type { PaymentBatch } from '../types/index.js';
import { generateId } from '../utils/id-generator.js';
import { sanitizeText } from '../utils/sanitize.js';

export function buildGroupHeader(batch: PaymentBatch, creationDate: Date = new Date()) {
  const txCount = batch.transactions.length;
  const ctrlSum = batch.transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2);

  const creationDateTime = creationDate.toISOString().replace(/\.\d{3}Z$/, '');

  return {
    MsgId: generateId('MSG', creationDate),
    CreDtTm: creationDateTime,
    NbOfTxs: String(txCount),
    CtrlSum: ctrlSum,
    InitgPty: {
      Nm: sanitizeText(batch.initiator.name),
      Id: {
        OrgId: {
          Othr: {
            Id: batch.initiator.identifier.value,
            SchmeNm: { Cd: batch.initiator.identifier.type },
          },
        },
      },
    },
  };
}
