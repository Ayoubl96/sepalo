# Sepalo

**Generate CBI XML files (CBIBdyPaymentRequest.00.04.01) directly in your browser — no data ever leaves your device.**

[![CI](https://github.com/ayoubl96/sepalo/actions/workflows/ci.yml/badge.svg)](https://github.com/ayoubl96/sepalo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Monorepo

| Package | Description |
|---|---|
| [`packages/core`](packages/core) | `@sepalo/core` — TypeScript library for parsing, validation and CBI XML generation |
| [`packages/web`](packages/web) | `@sepalo/web` — Next.js 15 application (App Router) |

## Requirements

- Node.js ≥ 20
- pnpm ≥ 9

## Local development

```bash
pnpm install
pnpm dev          # starts packages/web on localhost:3000
pnpm typecheck    # type-check all packages
pnpm test         # run tests across all packages
pnpm lint         # biome check
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

## License

MIT — see [LICENSE](LICENSE).
