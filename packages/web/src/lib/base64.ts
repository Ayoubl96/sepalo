export function toBase64(buf: Uint8Array<ArrayBuffer>): string {
  return btoa(String.fromCharCode(...buf));
}

export function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
