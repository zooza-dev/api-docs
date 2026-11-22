#!/usr/bin/env node
/**
 * Vendors api-v1's /v3 subset at a given commit into openapi/subset.json and records the pin in
 * openapi/subset.lock.json (spec DOC-20261120-001).
 *
 * The generator never fetches: updating the subset is this script plus a reviewed commit. It reads from a
 * local api-v1 checkout (git show <commit>:<path>), so the commit must exist there (git fetch first).
 *
 * Usage: node scripts/update-subset.js <commit> [--repo ../api-v1] [--path docs/openapi/zooza_api_v3.json]
 * Then:  node scripts/generate-api-doc.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const LOCK_FILE = path.join(ROOT, 'openapi', 'subset.lock.json');
const SUBSET_FILE = path.join(ROOT, 'openapi', 'subset.json');

function flag(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
}

function main() {
  const commitArg = process.argv[2];
  if (!commitArg || commitArg.startsWith('--')) {
    throw new Error('Usage: node scripts/update-subset.js <commit> [--repo ../api-v1] [--path <file>]');
  }
  const previous = fs.existsSync(LOCK_FILE) ? JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8')) : {};
  const repo = path.resolve(ROOT, flag('--repo', '../api-v1'));
  const file = flag('--path', previous.path || 'docs/openapi/zooza_api_v3.json');

  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { maxBuffer: 64 * 1024 * 1024 });
  const commit = git('rev-parse', '--verify', `${commitArg}^{commit}`).toString().trim();
  const text = git('show', `${commit}:${file}`).toString('utf8');

  const doc = JSON.parse(text);
  if (typeof doc.openapi !== 'string' || !doc.openapi.startsWith('3.') || !doc.paths) {
    throw new Error(`${file} at ${commit} is not an OpenAPI 3 document`);
  }

  const lock = {
    repo: 'api-v1',
    path: file,
    commit,
    sha256: crypto.createHash('sha256').update(text).digest('hex'),
  };
  fs.writeFileSync(SUBSET_FILE, text);
  fs.writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 4) + '\n');
  console.log(`[update-subset] openapi/subset.json ← api-v1 ${commit.slice(0, 10)}:${file}`);
  if (previous.commit && previous.commit !== commit) {
    console.log(`[update-subset] was ${previous.commit.slice(0, 10)}. Now run: node scripts/generate-api-doc.js`);
  }
}

try {
  main();
} catch (e) {
  console.error(`[update-subset] ${e.message}`);
  process.exit(1);
}
