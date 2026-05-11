export function validateCuc(cuc: string): boolean {
  return /^[A-Z0-9]{8}$/.test(cuc);
}
