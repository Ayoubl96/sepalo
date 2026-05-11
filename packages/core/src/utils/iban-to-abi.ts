export function extractAbiFromIban(iban: string): string | null {
  const normalized = iban.replace(/\s/g, '').toUpperCase();
  if (!normalized.startsWith('IT') || normalized.length !== 27) return null;
  // Italian IBAN: IT(2) + check(2) + CIN(1) + ABI(5) + CAB(5) + account(12)
  return normalized.slice(5, 10);
}
