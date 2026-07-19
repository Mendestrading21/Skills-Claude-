#!/usr/bin/env node
/**
 * Post-export step for the web PWA build.
 *
 * `expo export --platform web` (output: "single") produces a bare SPA shell in
 * dist/. This script rewrites dist/index.html to add the PWA <head> (manifest,
 * theme colour, iOS meta tags) and the service-worker registration, then does a
 * couple of sanity checks so the build fails loudly if the manifest/SW/icons
 * from public/ didn't make it into dist/.
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectPwa } from './pwa-head.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

async function requireFile(rel) {
  const path = join(dist, rel);
  try {
    await access(path, constants.R_OK);
  } catch {
    throw new Error(`PWA build check failed: missing dist/${rel}. Is it in public/?`);
  }
}

async function main() {
  const indexPath = join(dist, 'index.html');
  const original = await readFile(indexPath, 'utf8');
  const patched = injectPwa(original);
  await writeFile(indexPath, patched, 'utf8');

  await Promise.all([
    requireFile('manifest.json'),
    requireFile('sw.js'),
    requireFile('icons/icon-192.png'),
    requireFile('icons/icon-512.png'),
    requireFile('icons/icon-maskable-512.png'),
    requireFile('icons/apple-touch-icon.png'),
  ]);

  const changed = patched !== original;
  console.log(
    changed
      ? '✓ PWA head injected into dist/index.html and asset checks passed.'
      : '✓ PWA head already present; asset checks passed.',
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
