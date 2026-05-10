# Contributing to Sepalo

Thanks for your interest! Here is how to get involved.

## Local setup

```bash
git clone https://github.com/ayoubl96/sepalo.git
cd sepalo
pnpm install
pnpm dev
```

Requires Node.js ≥ 20 and pnpm ≥ 9.

## Workflow

1. Open an issue to discuss the change before writing code
2. Create a branch following the naming convention:
   - `feat/short-name` — new feature
   - `fix/short-name` — bug fix
   - `chore/short-name` — tooling / config
   - `docs/short-name` — documentation only
3. Write tests for any production code changes
4. Ensure CI is green: `pnpm lint && pnpm typecheck && pnpm test`
5. Open a PR against `main` with a clear description

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add iban mod-97 validator
fix: correct batch booking default value
chore: upgrade xmllint-wasm
docs: update ABI update process
test: add edge cases for latin-1 csv parser
refactor: extract date utils from document builder
```

## Versioning `@sepalo/core`

This package is published to npm. Releases are managed with [Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset        # describe the change
pnpm changeset version # bump versions (done by maintainer)
```

Do not manually edit the version in `packages/core/package.json`.

## Principles

- **Privacy first**: no payment data ever touches the server. Tool pages are 100% client-side.
- **CBI standard**: the target format is `CBIBdyPaymentRequest.00.04.01`. Always verify against the official XSD.
- **No over-engineering**: three similar lines are better than a premature abstraction.

## Code of Conduct

This project adopts the [Contributor Covenant](CODE_OF_CONDUCT.md).
