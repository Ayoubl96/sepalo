#!/usr/bin/env node
// Copies xmllint-wasm runtime files from node_modules into public/vendor/
// so they can be loaded as static assets, bypassing the bundler.
// The browser worker resolves its dependencies via import.meta.url, which
// only works reliably when the files are served verbatim from the same origin.

import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// xmllint-wasm is a dep of @sepalo/core, resolve from there
const coreRequire = createRequire(join(__dirname, '../../core/package.json'));
const pkgJsonPath = coreRequire.resolve('xmllint-wasm/package.json');
const xmllintDir = dirname(pkgJsonPath);
const targetDir = join(__dirname, '..', 'public', 'vendor', 'xmllint-wasm');

const FILES = ['index-browser.mjs', 'xmllint-browser.mjs', 'xmllint.wasm'];

await mkdir(targetDir, { recursive: true });
for (const file of FILES) {
  await copyFile(join(xmllintDir, file), join(targetDir, file));
  // biome-ignore lint/suspicious/noConsole: build script
  console.log(`vendored ${file}`);
}
