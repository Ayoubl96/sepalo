import type {
  PaymentBatch,
  Transaction,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from '../types/index.js';
import { validateAbi } from './abi.js';
import { validateCuc } from './cuc.js';
import { validateFiscalIdentifier } from './fiscal-code.js';
import { validateIban } from './iban.js';
import { sanitize } from './sepa-charset.js';
import { validateTotals } from './totals.js';

function validateTransaction(
  tx: Transaction,
  index: number,
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const row = index + 1;

  const creditorIban = validateIban(tx.beneficiary.iban);
  if (!creditorIban.valid) {
    errors.push({
      path: `transactions[${index}].beneficiary.iban`,
      code: 'INVALID_IBAN',
      message: creditorIban.error ?? 'Invalid beneficiary IBAN',
      rowNumber: row,
    });
  } else if (!creditorIban.isSepa && !tx.beneficiary.bic) {
    errors.push({
      path: `transactions[${index}].beneficiary.bic`,
      code: 'BIC_REQUIRED_EXTRA_SEPA',
      message: 'BIC is mandatory for extra-SEPA IBANs',
      rowNumber: row,
    });
  }

  if (tx.remittanceInfo.length < 1 || tx.remittanceInfo.length > 140) {
    errors.push({
      path: `transactions[${index}].remittanceInfo`,
      code: 'REMITTANCE_LENGTH',
      message: 'Remittance info must be 1–140 characters',
      rowNumber: row,
    });
  }

  const remittance = sanitize(tx.remittanceInfo);
  if (remittance.replacements.length > 0) {
    warnings.push({
      path: `transactions[${index}].remittanceInfo`,
      code: 'SEPA_CHARSET_SANITIZED',
      message: `${remittance.replacements.length} character(s) will be substituted to comply with SEPA charset`,
      rowNumber: row,
    });
  }

  if (tx.beneficiary.name.length < 1 || tx.beneficiary.name.length > 70) {
    errors.push({
      path: `transactions[${index}].beneficiary.name`,
      code: 'BENEFICIARY_NAME_LENGTH',
      message: 'Beneficiary name must be 1–70 characters',
      rowNumber: row,
    });
  }

  const beneficiaryName = sanitize(tx.beneficiary.name);
  if (beneficiaryName.replacements.length > 0) {
    warnings.push({
      path: `transactions[${index}].beneficiary.name`,
      code: 'SEPA_CHARSET_SANITIZED',
      message: `${beneficiaryName.replacements.length} character(s) in beneficiary name will be substituted`,
      rowNumber: row,
    });
  }

  return { errors, warnings };
}

export function validatePayment(batch: PaymentBatch): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

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

  if (!validateAbi(batch.initiator.abi)) {
    errors.push({
      path: 'initiator.abi',
      code: 'INVALID_ABI',
      message: `ABI ${batch.initiator.abi} is not a valid or recognised Italian bank code`,
    });
  }

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

  for (const [i, tx] of batch.transactions.entries()) {
    const result = validateTransaction(tx, i);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  errors.push(...validateTotals(batch));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
