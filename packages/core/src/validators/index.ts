import type { PaymentBatch, ValidationResult, ValidationError, ValidationWarning } from '../types/index.js';
import { validateIban } from './iban.js';
import { validateAbi } from './abi.js';
import { validateCuc } from './cuc.js';
import { validateFiscalIdentifier } from './fiscal-code.js';
import { sanitize } from './sepa-charset.js';
import { validateTotals } from './totals.js';

export function validatePayment(batch: PaymentBatch): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Initiator IBAN
  const initiatorIban = validateIban(batch.initiator.iban);
  if (!initiatorIban.valid) {
    errors.push({
      path: 'initiator.iban',
      code: 'INVALID_IBAN',
      message: initiatorIban.error ?? 'Invalid initiator IBAN',
    });
  } else if (!initiatorIban.isItalian) {
    errors.push({
      path: 'initiator.iban',
      code: 'INITIATOR_IBAN_NOT_ITALIAN',
      message: 'Initiator IBAN must be an Italian IBAN',
    });
  }

  // Initiator ABI
  if (!validateAbi(batch.initiator.abi)) {
    errors.push({
      path: 'initiator.abi',
      code: 'INVALID_ABI',
      message: `ABI ${batch.initiator.abi} is not a valid or recognised Italian bank code`,
    });
  }

  // Initiator identifier
  const { identifier } = batch.initiator;
  if (identifier.type === 'CUC' && !validateCuc(identifier.value)) {
    errors.push({
      path: 'initiator.identifier.value',
      code: 'INVALID_CUC',
      message: 'CUC must be exactly 8 alphanumeric characters (A-Z, 0-9)',
    });
  }
  if (identifier.type === 'CF' && !validateFiscalIdentifier(identifier.value)) {
    errors.push({
      path: 'initiator.identifier.value',
      code: 'INVALID_CF',
      message: 'Codice Fiscale or Partita IVA is invalid',
    });
  }

  // Transactions
  for (let i = 0; i < batch.transactions.length; i++) {
    const tx = batch.transactions[i]!;
    const row = i + 1;

    // Beneficiary IBAN
    const creditorIban = validateIban(tx.beneficiary.iban);
    if (!creditorIban.valid) {
      errors.push({
        path: `transactions[${i}].beneficiary.iban`,
        code: 'INVALID_IBAN',
        message: creditorIban.error ?? 'Invalid beneficiary IBAN',
        rowNumber: row,
      });
    } else if (!creditorIban.isSepa && !tx.beneficiary.bic) {
      errors.push({
        path: `transactions[${i}].beneficiary.bic`,
        code: 'BIC_REQUIRED_EXTRA_SEPA',
        message: 'BIC is mandatory for extra-SEPA IBANs',
        rowNumber: row,
      });
    }

    // Remittance info SEPA charset
    const remittance = sanitize(tx.remittanceInfo);
    if (remittance.replacements.length > 0) {
      warnings.push({
        path: `transactions[${i}].remittanceInfo`,
        code: 'SEPA_CHARSET_SANITIZED',
        message: `${remittance.replacements.length} character(s) will be substituted to comply with SEPA charset`,
        rowNumber: row,
      });
    }

    // Beneficiary name SEPA charset
    const beneficiaryName = sanitize(tx.beneficiary.name);
    if (beneficiaryName.replacements.length > 0) {
      warnings.push({
        path: `transactions[${i}].beneficiary.name`,
        code: 'SEPA_CHARSET_SANITIZED',
        message: `${beneficiaryName.replacements.length} character(s) in beneficiary name will be substituted`,
        rowNumber: row,
      });
    }
  }

  // Totals
  errors.push(...validateTotals(batch));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
