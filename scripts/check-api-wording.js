#!/usr/bin/env node
/**
 * Fails the build when developer-facing content mentions how the API is built, or the retired API.
 *
 * Audience rule (spec DOC-20261118-001): developers using /v3 see one API, Zooza's. Pages never
 * mention the gateway, api-v1, /v1, forwarding or the old X-ZOOZA-API-KEY / X-ZOOZA-TOKEN auth.
 * "Payment gateway" and "SMS gateway" are real product terms and are allowed. The widget loader path
 * /widgets/v1/ is a widget URL, not the retired REST API, and is allowed too.
 *
 * The rules live in scripts/lib/api-wording.js. The generator applies the same rules before it writes
 * static/zooza_api_v3.json, so a finding there means the file was edited by hand: regenerate it.
 *
 * Usage: node scripts/check-api-wording.js   (exit 1 on any finding)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const { scanText, scanJson } = require('./lib/api-wording');

// Developer-facing Markdown/MDX. Widget pages are included: they must not describe the retired REST API either.
const MD_DIRS = ['docs'];
const EXTRA_FILES = ['static/llms.txt', 'static/agent-setup.md', 'src/pages/index.js'];
const OPENAPI_FILE = 'static/zooza_api_v3.json';

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const findings = [];
const files = [...MD_DIRS.flatMap((d) => walk(path.join(ROOT, d))), ...EXTRA_FILES.map((f) => path.join(ROOT, f))];
for (const abs of files) {
  if (!fs.existsSync(abs)) continue;
  scanText(path.relative(ROOT, abs), fs.readFileSync(abs, 'utf8'), findings);
}

const docFindings = [];
const openapiAbs = path.join(ROOT, OPENAPI_FILE);
if (fs.existsSync(openapiAbs)) {
  scanJson(OPENAPI_FILE, JSON.parse(fs.readFileSync(openapiAbs, 'utf8')), '', docFindings);
}

if (findings.length || docFindings.length) {
  if (findings.length) {
    console.error(`[check-api-wording] ${findings.length} problem(s) in our pages:\n  ` + findings.join('\n  '));
  }
  if (docFindings.length) {
    console.error(
      `[check-api-wording] ${docFindings.length} problem(s) in the /v3 document. Fix the wording in ` +
        `openapi/patch.json (or report it to the subset's owner) and regenerate:\n  ` + docFindings.join('\n  '),
    );
  }
  process.exit(1);
}
console.log(`[check-api-wording] OK (${files.length} pages + ${OPENAPI_FILE})`);
