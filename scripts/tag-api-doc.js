#!/usr/bin/env node
/**
 * Cuts a release tag for the generated /v3 document: v3-doc-YYYY.MM.DD-N (spec DOC-20261120-001).
 * The gateway vendors static/zooza_api_v3.json at such a tag.
 *
 * Refuses unless: on main, the working tree is clean, main matches origin/main, and the committed document is
 * up to date (generate-api-doc --check). Creates an annotated tag locally and prints the push command; it
 * never pushes.
 *
 * Usage: node scripts/tag-api-doc.js
 */

const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const git = (...args) => execFileSync('git', args, { cwd: ROOT }).toString().trim();

function fail(message) {
  console.error(`[tag-api-doc] ${message}`);
  process.exit(1);
}

const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
if (branch !== 'main') fail(`tags are cut from main only (you're on ${branch})`);
if (git('status', '--porcelain')) fail('the working tree is not clean');
git('fetch', '--quiet', '--tags', 'origin', 'main');
if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main')) fail('main is not the same as origin/main; pull or push first');

try {
  execFileSync('node', [path.join(__dirname, 'generate-api-doc.js'), '--check'], { cwd: ROOT, stdio: 'inherit' });
} catch {
  fail('the committed document is not up to date; regenerate and commit it first');
}

const now = new Date();
const day = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}.${String(now.getUTCDate()).padStart(2, '0')}`;
const existing = git('tag', '--list', `v3-doc-${day}-*`).split('\n').filter(Boolean);
const n = existing.reduce((max, t) => Math.max(max, Number(t.split('-').pop()) || 0), 0) + 1;
const tag = `v3-doc-${day}-${n}`;

const lock = require(path.join(ROOT, 'openapi', 'subset.lock.json'));
git('tag', '-a', tag, '-m', `/v3 document, api-v1 subset ${lock.commit.slice(0, 10)}`);
console.log(`[tag-api-doc] created ${tag} at ${git('rev-parse', '--short', 'HEAD')}`);
console.log(`[tag-api-doc] publish it with: git push origin ${tag}`);
