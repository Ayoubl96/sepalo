const ALPHA_NUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomAlphaNum(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHA_NUM[Math.floor(Math.random() * ALPHA_NUM.length)];
  }
  return result;
}

function toDateTimePart(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    String(date.getFullYear()) +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

export function generateId(prefix: string, date: Date = new Date()): string {
  return `${prefix}${toDateTimePart(date)}${randomAlphaNum(6)}`;
}
