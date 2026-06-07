// Rybbit analytics global, injected by the script tag in app/layout.tsx.
// See https://rybbit.io/docs for the tracking API.
interface RybbitApi {
  event(name: string, properties?: Record<string, unknown>): void;
}

interface Window {
  rybbit?: RybbitApi;
}
