#!/usr/bin/env node
/**
 * Validates api/llm/tools.yaml (the agent tool catalogue) against static/zooza_api_v3.json.
 *
 * Fails when a tool points at an operation that doesn't exist, when names repeat or aren't
 * snake_case verb-first, or when a write (POST/PUT/PATCH/DELETE) isn't marked `confirm: true`.
 * Groups and costs are read from the document, never from the catalogue, so they can't drift.
 *
 * Usage: node scripts/check-tool-catalogue.js [--print]   (--print lists each tool with group and cost)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const catalogue = yaml.load(fs.readFileSync(path.join(ROOT, 'api/llm/tools.yaml'), 'utf8'));
const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'static/zooza_api_v3.json'), 'utf8'));

const VERBS = ['get', 'list', 'search', 'create', 'update', 'delete', 'set', 'cancel', 'add', 'remove', 'find'];
const WRITES = ['POST', 'PUT', 'PATCH', 'DELETE'];
const errors = [];
const seen = new Set();
const rows = [];

for (const tool of catalogue.tools || []) {
  const where = `tool "${tool.name}"`;
  if (!/^[a-z]+(_[a-z]+)+$/.test(tool.name || '')) errors.push(`${where}: name must be snake_case`);
  else if (!VERBS.includes(tool.name.split('_')[0])) errors.push(`${where}: name must start with a verb (${VERBS.join(', ')})`);
  if (seen.has(tool.name)) errors.push(`${where}: duplicate name`);
  seen.add(tool.name);
  if (!tool.purpose) errors.push(`${where}: missing purpose`);

  const method = String(tool.method || '').toUpperCase();
  const op = doc.paths?.[tool.path]?.[method.toLowerCase()];
  if (!op) {
    errors.push(`${where}: ${method} ${tool.path} is not an operation in static/zooza_api_v3.json`);
    continue;
  }
  if (WRITES.includes(method) && tool.confirm !== true) errors.push(`${where}: writes must set confirm: true`);
  if (!WRITES.includes(method) && tool.confirm === true) errors.push(`${where}: reads must not set confirm: true`);
  const access = op['x-zooza-access'] || { groups: [], cost: 0 };
  rows.push([tool.name, `${method} ${tool.path}`, access.groups.join(' ') || '—', access.cost]);
}

if (errors.length) {
  console.error(`[check-tool-catalogue] ${errors.length} problem(s) in api/llm/tools.yaml:\n  ` + errors.join('\n  '));
  process.exit(1);
}
if (process.argv.includes('--print')) {
  for (const r of rows) console.log(`${r[0].padEnd(26)} ${r[1].padEnd(32)} ${String(r[2]).padEnd(12)} ${r[3]} pt`);
}
console.log(`[check-tool-catalogue] OK (${rows.length} tools)`);
