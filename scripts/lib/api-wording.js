/**
 * Audience wording rules for developer-facing content (spec DOC-20261118-001), shared by
 * check-api-wording.js (pages and the published document) and generate-api-doc.js (the document,
 * before it is written).
 *
 * Developers using /v3 see one API, Zooza's. Nothing mentions the gateway, api-v1, /v1, forwarding or
 * the old X-ZOOZA-API-KEY / X-ZOOZA-TOKEN auth. "Payment gateway" and "SMS gateway" are real product
 * terms and are allowed. The widget loader path /widgets/v1/ is a widget URL, not the retired REST API.
 */

const RULES = [
  { name: 'internal component', re: /(?<!payment |sms )\bgateways?\b/gi },
  { name: 'internal component', re: /\bapi-v1\b/gi },
  { name: 'retired API', re: /(?<!widgets)\/v1\b(?!\/loader)/gi },
  { name: 'retired auth header', re: /\bX-ZOOZA-(API-KEY|TOKEN)\b/gi },
  { name: 'internal wiring', re: /\b(forwarded|forwards|forwarding|upstream)\b/gi },
];

// Only in the document: limits are never "unlimited" (api-v1's OpenApiV3DocumentTest rule).
const DOCUMENT_RULES = [...RULES, { name: 'promise of no limit', re: /\bunlimited\b/gi }];

// Lines that legitimately talk about the widget loader's own v1 namespace, e.g. window.ZOOZA.widgets.
const LINE_ALLOW = [/widgets\/v1\//i, /\bwidgets v1\b/i];

function scanText(rel, text, findings, rules = RULES) {
  text.split('\n').forEach((line, i) => {
    if (LINE_ALLOW.some((re) => re.test(line))) return;
    for (const rule of rules) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line))) {
        findings.push(`${rel}:${i + 1}  ${rule.name}: "${m[0]}"  →  ${line.trim().slice(0, 140)}`);
      }
    }
  });
}

/** Scans every string in an OpenAPI document. Example values are data, not wording, and are skipped. */
function scanJson(rel, node, pointer, findings, rules = DOCUMENT_RULES) {
  if (typeof node === 'string') {
    for (const rule of rules) {
      rule.re.lastIndex = 0;
      const m = rule.re.exec(node);
      if (m) findings.push(`${rel} ${pointer || '/'}  ${rule.name}: "${m[0]}"`);
    }
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => scanJson(rel, v, `${pointer}/${i}`, findings, rules));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'example' || k === 'examples') continue;
      scanJson(rel, v, `${pointer}/${k.replace(/~/g, '~0').replace(/\//g, '~1')}`, findings, rules);
    }
  }
}

module.exports = { RULES, DOCUMENT_RULES, LINE_ALLOW, scanText, scanJson };
