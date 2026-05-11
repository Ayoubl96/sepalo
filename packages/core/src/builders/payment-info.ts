import type { PaymentBatch } from '../types/index.js';
import { generateId } from '../utils/id-generator.js';
import { sanitizeText } from '../utils/sanitize.js';
import { buildTransaction } from './transaction.js';

export function buildPaymentInfo(batch: PaymentBatch, creationDate: Date = new Date()) {
  const pmtInfId = generateId('PMT', creationDate);

  return {
    PmtInfId: pmtInfId,
    PmtMtd: 'TRF',
    BtchBookg: batch.batchBooking,
    NbOfTxs: String(batch.transactions.length),
    CtrlSum: batch.transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2),
    PmtTpInf: {
      SvcLvl: { Cd: 'SEPA' },
      CtgyPurp: { Cd: 'SUPP' },
    },
    ReqdExctnDt: { Dt: batch.executionDate },
    Dbtr: {
      Nm: sanitizeText(batch.initiator.name),
    },
    DbtrAcct: {
      Id: { IBAN: batch.initiator.iban },
    },
    DbtrAgt: {
      FinInstnId: {
        ClrSysMmbId: {
          ClrSysId: { Cd: 'ITNCC' },
          MmbId: batch.initiator.abi,
        },
      },
    },
    CdtTrfTxInf: batch.transactions.map((tx, i) => buildTransaction(tx, i, creationDate)),
  };
}
