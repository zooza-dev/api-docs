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
  'examples/location-map.md',
  'examples/filtered-timetable.md',
  'examples/custom-catalogue.md',
  'examples/chatbot-logged-in-client.md',
  'examples/wordpress-plugin.md',
  'api/index.md',
  'api/authentication.md',
  'api/errors.md',
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
  'Machine-readable API spec (OpenAPI 3.0): https://docs.zooza.online/zooza_api_v1.yaml',
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
  parts.push(content.trim(), '', '---', '');
}

fs.mkdirSync(path.join(ROOT, 'static'), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, parts.join('\n'), 'utf8');
console.log(`[llms-full] Written to ${path.relative(ROOT, OUTPUT_FILE)} (${parts.join('\n').length} bytes)`);
