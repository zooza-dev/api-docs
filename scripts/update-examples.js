#!/usr/bin/env node
/**
 * Vendors a demo app's examples bundle into openapi/examples/ at a pinned commit (spec DOC-20261122-001).
 * Reads with `git show` at that commit, never the working tree, and records repo, path, commit and sha256 in
 * openapi/examples.lock.json. Never edit openapi/examples/ by hand; re-run this instead.
 *
 * While copying, request ids (a body's `request_id`, the `x-request-id` header) become fixed placeholders, numbered
 * in sorted file order, so the same commit always gives the same bytes.
 *
 * Usage: node scripts/update-examples.js <commit> [--repo ../api-example-backoffice] [--path examples]
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { bundleHash } = require('./lib/examples');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'openapi', 'examples');
const LOCK = path.join(ROOT, 'openapi', 'examples.lock.json');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const fail = (m) => {
  console.error(`[update-examples] ${m}`);
  process.exit(1);
};

const commitArg = process.argv[2];
if (!commitArg || commitArg.startsWith('--')) fail('usage: node scripts/update-examples.js <commit> [--repo <dir>] [--path <dir>]');
const repo = path.resolve(ROOT, arg('--repo', '../api-example-backoffice'));
const bundlePath = arg('--path', 'examples');
const git = (...a) => execFileSync('git', ['-C', repo, ...a], { maxBuffer: 64 * 1024 * 1024 }).toString();

const commit = git('rev-parse', `${commitArg}^{commit}`).trim();
const files = git('ls-tree', '-r', '--name-only', commit, '--', bundlePath)
  .split('\n')
  .filter((f) => f.endsWith('.json') && path.basename(f) !== 'manifest.json')
  .sort();
if (!files.length) fail(`no examples under ${bundlePath}/ at ${commit.slice(0, 10)}`);

let n = 0;
const placeholder = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
function rewriteIds(node) {
  if (Array.isArray(node)) return node.map(rewriteIds);
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = (k === 'request_id' || k === 'x-request-id') && typeof v === 'string' && v ? placeholder() : rewriteIds(v);
    }
    return out;
  }
  return node;
}

// The local test company's own data and language, replaced while copying (openapi/examples.rewrite.json).
const rewrite = JSON.parse(fs.readFileSync(path.join(ROOT, 'openapi', 'examples.rewrite.json'), 'utf8'));
const forbidden = rewrite.forbidden.map((re) => new RegExp(re));
function anonymise(node) {
  if (Array.isArray(node)) return node.map(anonymise);
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = k in rewrite.keys && v !== null && v !== '' && typeof v !== 'object' ? rewrite.keys[k] : anonymise(v);
    }
    return out;
  }
  if (typeof node !== 'string') return node;
  if (node in rewrite.values) return rewrite.values[node];
  let s = node;
  for (const [from, to] of rewrite.substrings) s = s.split(from).join(to);
  return s;
}
function survivors(node, where, out) {
  if (Array.isArray(node)) node.forEach((v, i) => survivors(v, `${where}/${i}`, out));
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) survivors(v, `${where}/${k}`, out);
  else if (typeof node === 'string') for (const re of forbidden) if (re.test(node)) out.push(`${where}: "${node.slice(0, 80)}"`);
  return out;
}

fs.rmSync(OUT, { recursive: true, force: true });
const written = {};
for (const f of files) {
  const rel = path.relative(bundlePath, f);
  const ex = anonymise(rewriteIds(JSON.parse(git('show', `${commit}:${f}`))));
  const left = survivors({ request: ex.request, response: ex.response, title: ex.title, description: ex.description }, f, []);
  if (left.length) fail(`local or Slovak data survived; extend openapi/examples.rewrite.json:\n  ${left.join('\n  ')}`);
  const expected = rel.replace(/\.json$/, '');
  if (ex.id !== expected) fail(`${f}: id "${ex.id}" doesn't match its path "${expected}"`);
  const text = JSON.stringify(ex, null, 2) + '\n';
  fs.mkdirSync(path.join(OUT, path.dirname(rel)), { recursive: true });
  fs.writeFileSync(path.join(OUT, rel), text);
  written[rel] = text;
}

const lock = {
  repo: path.basename(repo),
  path: bundlePath,
  commit,
  files: files.length,
  sha256: bundleHash(written),
};
fs.writeFileSync(LOCK, JSON.stringify(lock, null, 2) + '\n');
console.log(`[update-examples] vendored ${files.length} examples from ${lock.repo} ${commit.slice(0, 10)}; ${n} request ids replaced`);
