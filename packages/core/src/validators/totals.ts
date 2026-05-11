import type { PaymentBatch, ValidationError } from '../types/index.js';

export function validateTotals(batch: PaymentBatch): ValidationError[] {
  const errors: ValidationError[] = [];
  const { transactions } = batch;

  const expectedCount = transactions.length;
  const expectedSum = Math.round(transactions.reduce((acc, tx) => acc + tx.amount, 0) * 100) / 100;

  if (expectedCount === 0) {
    errors.push({
      path: 'transactions',
      code: 'EMPTY_BATCH',
      message: 'Batch must contain at least one transaction',
    });
  }

  if (expectedSum <= 0) {
    errors.push({
      path: 'transactions',
      code: 'INVALID_CTRL_SUM',
      message: `Control sum must be positive, got ${expectedSum}`,
    });
  }

  return errors;
}
