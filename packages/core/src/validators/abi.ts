import abiList from '../data/abi-list.json' assert { type: 'json' };

const ABI_MAP = abiList as Record<string, string>;

export function validateAbi(abi: string): boolean {
  return /^\d{5}$/.test(abi) && abi in ABI_MAP;
}

export function getAbiName(abi: string): string | undefined {
  return ABI_MAP[abi];
}
