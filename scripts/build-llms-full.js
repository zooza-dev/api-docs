#!/usr/bin/env node
/**
 * Generates static/llms-full.txt — a concatenation of all prose documentation
 * pages in Markdown format, prefixed with the OpenAPI spec URL.
 *
 * Run automatically as part of `npm run build`.
 * Can also be run standalone: node scripts/build-llms-full.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUTPUT_FILE = path.join(ROOT, 'static', 'llms-full.txt');
const EXAMPLES_DIR = path.join(ROOT, 'openapi', 'examples');

/** <PreflightOperations /> as Markdown: the operations whose `action` query parameter accepts `preflight_check`. */
function preflightOperationsMarkdown() {
  const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'static', 'zooza_api_v3.json'), 'utf8'));
  const deref = (n) => (n && n.$ref ? n.$ref.split('/').slice(1).reduce((a, k) => a[k], doc) : n);
  const rows = ['| Operation | Request | What it checks |', '|---|---|---|'];
  for (const [p, item] of Object.entries(doc.paths || {})) {
    for (const m of ['get', 'put', 'post', 'delete', 'patch']) {
      const op = item[m];
      const param = op && (op.parameters || []).map(deref).find((x) => x && x.in === 'query' && x.name === 'action');
      if (!param || !((param.schema && param.schema.enum) || []).includes('preflight_check')) continue;
      rows.push(`| ${op.summary || ''} | \`${m.toUpperCase()} /v3${p}?action=preflight_check\` | ${(param.description || '').replace(/^`preflight_check`:\s*/, '').replace(/\|/g, '\\|')} |`);
    }
  }
  return rows.join('\n');
}

/** <ApiExample id="…" title="…" /> as Markdown: the request line, its body and the answer (spec DOC-20261122-001). */
function apiExampleMarkdown(_match, attrs) {
  const id = (attrs.match(/id="([^"]+)"/) || [])[1];
  const title = (attrs.match(/title="([^"]+)"/) || [])[1];
  const file = path.join(EXAMPLES_DIR, `${id}.json`);
  if (!id || !fs.existsSync(file)) throw new Error(`[llms-full] <ApiExample id="${id}">: no such example in openapi/examples/`);
  const ex = JSON.parse(fs.readFileSync(file, 'utf8'));
  const q = Object.entries(ex.request.query || {}).map(([k, v]) => `${k}=${v}`).join('&');
  // Registration rows carry whole programme and class objects; keep llms-full readable by shortening long bodies.
  const json = (v) => {
    const lines = JSON.stringify(v, null, 2).split('\n');
    return lines.length <= 60 ? lines.join('\n') : [...lines.slice(0, 60), `… (${lines.length - 60} more lines; the full answer is in the guide at docs.zooza.online)`].join('\n');
  };
  const out = [`**${title || ex.title}**`, '', '```', `${ex.request.method} /v3${ex.request.path}${q ? `?${q}` : ''}`, '```'];
  if (ex.request.body !== null && ex.request.body !== undefined) out.push('', '```json', json(ex.request.body), '```');
  out.push('', `Answer: ${ex.response.status}`, '', '```json', json(ex.response.body), '```');
  return out.join('\n');
}

// Prose doc paths in documentation order (excludes generated API reference)
const PROSE_DOCS = [
  'concepts.md',
  'quickstart.md',
  'make-up-sessions.md',
  'ai-assistants.md',
  'examples/index.md',
  'examples/multi-step-trial-booking.md',
  'examples/branded-booking-tiles.md',
  'examples/age-tabs.md',
  'examples/block-packages.md',
  'examples/parent-zone.md',
  'examples/contact-lead-forms.md',
  'examples/checkout-passes.md',
  'examples/calendar-designs.md',
  'examples/location-map.md',
  'examples/filtered-timetable.md',
  'examples/custom-catalogue.md',
  'examples/chatbot-logged-in-client.md',
  'examples/wordpress-plugin.md',
  'api/index.md',
  'api/getting-started.md',
  'api/authentication.md',
  'api/access-and-rate-limits.md',
  'api/errors.md',
  'api/error-codes.md',
  'api/preflight-check.md',
  'api/keys.md',
  'api/guides/find-registrations.md',
  'api/guides/change-a-registration.md',
  'api/guides/cancel-a-registration.md',
  'api/guides/set-up-a-term.md',
  'widgets/index.md',
  'widgets/embed-methods.md',
  'widgets/registration-widget.md',
  'widgets/registration-widget-buyer-fields.md',
  'widgets/calendar-widget.md',
  'widgets/map-widget.md',
  'widgets/profile-widget.md',
  'widgets/event-documents.md',
  'widgets/video-widget.md',
  'widgets/checkout-widget.md',
  'widgets/contact-widget.md',
  'enums.md',
];

function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return content;
  return content.slice(end + 4).trimStart();
}

function stripMdxImports(content) {
  // Remove import statements that are MDX-specific
  return content.replace(/^import\s+.+from\s+['"].+['"]\s*;?\s*$/gm, '').trimStart();
}

// React tables on the pages, rendered here as Markdown from the same document
const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'static', 'zooza_api_v3.json'), 'utf8'));
const cell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const VALUE_NOTE = { in_message: 'value ends the message', alongside: 'value under key 0' };
const errorCodesMarkdown = () =>
  ['| Code | Name | Area | When it is returned | English message | Value |', '|---|---|---|---|---|---|']
    .concat(
      [...(doc['x-zooza-error-codes'] || [])]
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((c) => `| ${c.code} | ${c.name} | ${cell(c.area)} | ${cell(c.description)} | ${cell(c.message)} | ${VALUE_NOTE[c.value] || ''} |`)
    )
    .join('\n');
const operationCostsMarkdown = () => {
  const rows = ['| Request | Access group | Points |', '|---|---|---|'];
  for (const [p, item] of Object.entries(doc.paths || {})) {
    for (const m of ['get', 'post', 'put', 'patch', 'delete']) {
      const op = item[m];
      // Operations without x-zooza-access (the token request and GET /me) need no group and are free.
      const access = op && (op['x-zooza-access'] || { groups: [], cost: 0 });
      if (op) rows.push(`| ${m.toUpperCase()} /v3${p} | ${access.groups.join(', ') || 'any key'} | ${access.cost} |`);
    }
  }
  return rows.join('\n');
};

const rateTiersMarkdown = () =>
  ['| Tier | Points per minute | Points per day |', '|---|---|---|']
    .concat(Object.entries(doc['x-zooza-tiers'] || {}).map(([name, t]) => `| ${name} | ${t.points_per_minute} | ${t.points_per_day} |`))
    .join('\n');

// Reuse the positioning intro from llms.txt (everything before the first "## " section)
const llmsIntro = fs
  .readFileSync(path.join(ROOT, 'static', 'llms.txt'), 'utf8')
  .split(/^## /m)[0]
  .replace(/^# .*\n/, '')
  .trim();

const parts = [
  '# Zooza Developer Docs — Full Text',
  '',
  llmsIntro,
  '',
  'Machine-readable API reference (OpenAPI 3.0, one per region): https://api.zooza.app/v3/openapi.json (EU), https://uk.api.zooza.app/v3/openapi.json (UK), https://asia.api.zooza.app/v3/openapi.json (ASIA)',
  '',
  '---',
  '',
];

for (const relPath of PROSE_DOCS) {
  const absPath = path.join(DOCS_DIR, relPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`[llms-full] Skipping missing file: ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(absPath, 'utf8');
  content = stripFrontmatter(content);
  content = stripMdxImports(content);
  content = content.replace(/^<ErrorCodes \/>$/m, errorCodesMarkdown).replace(/^<OperationCosts \/>$/m, operationCostsMarkdown).replace(/^<RateTiers \/>$/m, rateTiersMarkdown)
    .replace(/<ChatButton[^>]*>([^<]*)<\/ChatButton>/g, '$1: support@zooza.online')
    .replace(/^<ApiExample([^>]*)\/>$/gm, apiExampleMarkdown)
    .replace(/^<PreflightOperations \/>$/m, () => preflightOperationsMarkdown());
  parts.push(content.trim(), '', '---', '');
}

fs.mkdirSync(path.join(ROOT, 'static'), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, parts.join('\n'), 'utf8');
console.log(`[llms-full] Written to ${path.relative(ROOT, OUTPUT_FILE)} (${parts.join('\n').length} bytes)`);
