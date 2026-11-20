#!/usr/bin/env node
// Verify bundled official skills byte-for-byte against pinned upstream Git blob IDs.
// Run: node scripts/verify-vendored-skills.mjs
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(resolve(root, '.agents/skills-manifest.json'), 'utf8'));
let errors = 0;
for (const entry of manifest.files) {
  const target = resolve(root, entry.path);
  if (!target.startsWith(root + sep)) {
    console.error('Unsafe path in manifest:', entry.path);
    errors++;
    continue;
  }
  let contents;
  try {
    contents = readFileSync(target);
  } catch {
    console.error('Missing skill file:', entry.path);
    errors++;
    continue;
  }
  const actualSha = createHash('sha1')
    .update(Buffer.from('blob ' + contents.length + '\0'))
    .update(contents)
    .digest('hex');
  if (actualSha !== entry.gitBlobSha) {
    console.error('Content differs from upstream:', entry.path);
    errors++;
  }
}
if (errors) {
  console.error('Official skills verification failed:', errors, 'problem(s)');
  process.exitCode = 1;
} else {
  console.log('Verified', manifest.files.length, 'official skill and support files against pinned Git blob IDs.');
}
