import type { PaymentBatch } from '../types/index.js';
import { generateId } from '../utils/id-generator.js';
import { sanitizeText } from '../utils/sanitize.js';
import { buildTransaction } from './transaction.js';

export function buildPaymentInfo(batch: PaymentBatch, creationDate: Date = new Date()) {
  const pmtInfId = generateId('PMT', creationDate);

  return {
    PmtInfId: pmtInfId,
    PmtMtd: 'TRF',
    ...(batch.batchBooking !== undefined ? { BtchBookg: batch.batchBooking } : {}),
    PmtTpInf: {
      InstrPrty: 'NORM',
      SvcLvl: { Cd: 'SEPA' },
      LclInstrm: { Cd: 'SEPA' },
    },
    ReqdExctnDt: { Dt: batch.executionDate },
    Dbtr: {
      Nm: sanitizeText(batch.initiator.name),
    },
    DbtrAcct: {
      Id: { IBAN: batch.initiator.iban },
    },
    ...(batch.initiator.abi
      ? {
          DbtrAgt: {
            FinInstnId: {
              ClrSysMmbId: {
                MmbId: batch.initiator.abi,
              },
            },
          },
        }
      : {}),
    ChrgBr: 'SLEV',
    CdtTrfTxInf: batch.transactions.map((tx, i) => buildTransaction(tx, i, creationDate)),
  };
}
