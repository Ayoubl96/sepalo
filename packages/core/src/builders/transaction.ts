import type { Transaction } from '../types/index.js';
import { generateId } from '../utils/id-generator.js';
import { sanitizeText } from '../utils/sanitize.js';
import { SEPA_COUNTRIES } from '../validators/iban.js';

export function buildTransaction(tx: Transaction, index: number, creationDate: Date = new Date()) {
  const endToEndId = tx.endToEndId ?? tx.id ?? generateId(`E2E${index + 1}`, creationDate);
  const country = tx.beneficiary.iban.replace(/\s/g, '').slice(0, 2).toUpperCase();
  const isItalian = country === 'IT';
  const isSepa = SEPA_COUNTRIES.has(country);

  const cdtrAgt = buildCdtrAgt(tx, isItalian, isSepa);

  // Category purpose (CtgyPurp) is mandatory for Italian beneficiary IBANs
  // (CBI spec 2.12.2.3): default to 'OTHR' when unset. For non-IT beneficiaries
  // it is optional and only emitted when the caller provides an explicit code.
  const categoryPurpose = tx.purpose ?? (isItalian ? 'OTHR' : undefined);

  return {
    PmtId: {
      InstrId: tx.id ?? generateId(`TX${index + 1}`, creationDate),
      EndToEndId: endToEndId,
    },
    ...(categoryPurpose && {
      PmtTpInf: { CtgyPurp: { Cd: categoryPurpose } },
    }),
    Amt: {
      InstdAmt: {
        '#text': tx.amount.toFixed(2),
        '@_Ccy': 'EUR',
      },
    },
    ...(cdtrAgt && { CdtrAgt: cdtrAgt }),
    Cdtr: {
      Nm: sanitizeText(tx.beneficiary.name),
    },
    CdtrAcct: {
      Id: { IBAN: tx.beneficiary.iban },
    },
    RmtInf: {
      Ustrd: sanitizeText(tx.remittanceInfo),
    },
  };
}

function buildCdtrAgt(tx: Transaction, isItalian: boolean, isSepa: boolean): object | null {
  // Italian IBAN: CdtrAgt is absent
  if (isItalian) return null;

  // Non-IT SEPA: BIC recommended, NOTPROVIDED accepted
  if (isSepa) {
    const bic = tx.beneficiary.bic ?? 'NOTPROVIDED';
    return { FinInstnId: { BICFI: bic } };
  }

  // Extra-SEPA: BIC mandatory (validator enforces presence; builder uses what's there)
  return { FinInstnId: { BICFI: tx.beneficiary.bic ?? 'NOTPROVIDED' } };
}
