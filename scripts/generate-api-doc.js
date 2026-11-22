#!/usr/bin/env node
/**
 * Generates static/zooza_api_v3.json, the /v3 OpenAPI document: the published reference and the gateway's
 * routing, authorization and rate-limit table (spec DOC-20261120-001, handoff
 * zooza-api-gateway-to-api-docs-20261120-001).
 *
 * Inputs (openapi/), applied in this order:
 *   1. subset.json   api-v1's subset, vendored at the commit pinned in subset.lock.json
 *   2. gateway.json  the gateway's own operations, responses, headers and schemas (RFC 7386 merge patch)
 *   3. patch.json    our prose, examples and tags (RFC 7386 merge patch)
 *   4. access.json   which operations /v3 exposes, to which access group, at what cost; tiers; token limits
 *   5. examples.json which recorded calls from examples/ (vendored, pinned in examples.lock.json) go into the
 *                    reference; each is checked against its operation's schema
 *
 * Same inputs, same bytes. Nothing is fetched. If any check fails, nothing is written.
 *
 * Usage:
 *   node scripts/generate-api-doc.js           write static/zooza_api_v3.json
 *   node scripts/generate-api-doc.js --check   fail if the committed file differs from a fresh generation
 *   node scripts/generate-api-doc.js --preview <subset.json>
 *       run every step and check on a candidate subset (e.g. api-v1's working copy) without pinning it, and list
 *       which operations it would add, remove or leave out. Writes nothing.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { scanJson } = require('./lib/api-wording');
const { readBundle, bundleHash, exampleKey } = require('./lib/examples');

const ROOT = path.resolve(__dirname, '..');
const IN = (f) => path.join(ROOT, 'openapi', f);
const OUTPUT = path.join(ROOT, 'static', 'zooza_api_v3.json');
const OUTPUT_REL = 'static/zooza_api_v3.json';

const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
// Access lives only in access.json. The subset may still carry the old per-operation keys; they are dropped.
const ACCESS_KEYS = ['x-zooza-access', 'x-zooza-cost', 'x-zooza-groups'];
// Document-level keys the generator owns. Anything the inputs say about them is replaced.
const DOC_ACCESS_KEYS = ['x-zooza-access-defaults', 'x-zooza-tiers', 'x-zooza-groups', 'x-zooza-token-endpoint'];
// Component types pruned when no operation reaches them. securitySchemes are reached by name, not $ref.
const PRUNABLE = ['schemas', 'responses', 'parameters', 'headers', 'requestBodies', 'examples', 'links', 'callbacks'];

class GenerateError extends Error {}

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new GenerateError(`${path.relative(ROOT, file)}: ${e.message}`);
  }
};
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

/** RFC 7386 JSON Merge Patch: objects merge key by key, null deletes, anything else (arrays too) replaces. */
function mergePatch(target, patch) {
  if (!isObject(patch)) return structuredClone(patch);
  const out = isObject(target) ? { ...target } : {};
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete out[k];
    else out[k] = mergePatch(out[k], v);
  }
  return out;
}

function* operations(doc) {
  for (const [p, item] of Object.entries(doc.paths || {})) {
    for (const m of METHODS) if (isObject(item[m])) yield { path: p, method: m, op: item[m] };
  }
}

function loadSubset(errors) {
  const previewIdx = process.argv.indexOf('--preview');
  if (previewIdx > -1) {
    const file = process.argv[previewIdx + 1];
    if (!file) throw new GenerateError('--preview needs a subset file');
    return { subset: readJson(path.resolve(file)), lock: { commit: `preview:${file}` } };
  }
  const lock = readJson(IN('subset.lock.json'));
  const text = fs.readFileSync(IN('subset.json'), 'utf8');
  const sha = crypto.createHash('sha256').update(text).digest('hex');
  if (sha !== lock.sha256) {
    errors.push(
      `openapi/subset.json doesn't match subset.lock.json (sha256 ${sha.slice(0, 12)}…, lock ${String(lock.sha256).slice(0, 12)}…). ` +
        `Update it only with scripts/update-subset.js.`,
    );
  }
  return { subset: JSON.parse(text), lock };
}

function validateAccess(access, errors) {
  const where = 'openapi/access.json';
  if (access.version !== 1) errors.push(`${where}: version must be 1`);
  if (!isObject(access.tiers) || !Object.keys(access.tiers).length) errors.push(`${where}: tiers is missing or empty`);
  for (const [name, t] of Object.entries(access.tiers || {})) {
    if (!isPositiveInt(t.points_per_minute) || !isPositiveInt(t.points_per_day)) {
      errors.push(`${where}: tier ${name} needs positive integer points_per_minute and points_per_day`);
    }
  }
  if (!isObject(access.defaults) || !isPositiveInt(access.defaults.cost)) {
    errors.push(`${where}: defaults.cost must be a positive integer`);
  }
  if (!isObject(access.token_endpoint)) errors.push(`${where}: token_endpoint is missing`);
  if (!isObject(access.groups) || !Object.keys(access.groups).length) errors.push(`${where}: groups is missing or empty`);
  for (const [name, g] of Object.entries(access.groups || {})) {
    if (!g || typeof g.title !== 'string' || typeof g.description !== 'string') {
      errors.push(`${where}: group ${name} needs a title and a description`);
    }
  }
  if (!isObject(access.endpoints) || !Object.keys(access.endpoints).length) errors.push(`${where}: endpoints is missing or empty`);
  for (const [id, e] of Object.entries(access.endpoints || {})) {
    const extra = Object.keys(e || {}).filter((k) => k !== 'groups' && k !== 'cost');
    if (extra.length) errors.push(`${where}: ${id} has unknown key(s) ${extra.join(', ')} (only groups and cost)`);
    if (!Array.isArray(e.groups) || !e.groups.length) errors.push(`${where}: ${id} needs at least one group`);
    for (const g of e.groups || []) {
      if (!(access.groups || {})[g]) errors.push(`${where}: ${id} names group "${g}", which isn't in groups`);
    }
    if ('cost' in e && !isPositiveInt(e.cost)) errors.push(`${where}: ${id} cost must be a positive integer`);
  }
}

/** Access may only be set in access.json, never in an overlay. */
function forbidAccessKeys(name, node, pointer, errors) {
  if (Array.isArray(node)) node.forEach((v, i) => forbidAccessKeys(name, v, `${pointer}/${i}`, errors));
  else if (isObject(node)) {
    for (const [k, v] of Object.entries(node)) {
      if (ACCESS_KEYS.includes(k) || DOC_ACCESS_KEYS.includes(k)) {
        errors.push(`openapi/${name} ${pointer}/${k}: access is set only in openapi/access.json`);
      }
      forbidAccessKeys(name, v, `${pointer}/${k}`, errors);
    }
  }
}

function accessLine(groups, cost) {
  const g = groups.map((x) => `\`${x}\``);
  const label = g.length === 1 ? `Access group: ${g[0]}` : `Access groups: ${g.slice(0, -1).join(', ')} or ${g.at(-1)}`;
  return `${label} · Cost: ${cost} ${cost === 1 ? 'point' : 'points'}.`;
}

function collectRefs(node, out) {
  if (Array.isArray(node)) node.forEach((v) => collectRefs(v, out));
  else if (isObject(node)) {
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref' && typeof v === 'string') out.add(v);
      else collectRefs(v, out);
    }
  }
  return out;
}

function resolvePointer(doc, ref) {
  if (!ref.startsWith('#/')) return undefined;
  let node = doc;
  for (const raw of ref.slice(2).split('/')) {
    const key = decodeURIComponent(raw).replace(/~1/g, '/').replace(/~0/g, '~');
    if (!isObject(node) && !Array.isArray(node)) return undefined;
    node = node[key];
    if (node === undefined) return undefined;
  }
  return node;
}

/** Drops components no operation reaches (directly or through other components). Returns what was dropped. */
function pruneComponents(doc) {
  const components = doc.components || {};
  const reached = new Set();
  const { components: _omit, ...rest } = doc;
  const queue = [...collectRefs(rest, new Set())];
  while (queue.length) {
    const ref = queue.pop();
    if (reached.has(ref)) continue;
    reached.add(ref);
    const target = resolvePointer(doc, ref);
    if (target !== undefined) queue.push(...collectRefs(target, new Set()));
  }
  const dropped = [];
  for (const type of PRUNABLE) {
    for (const name of Object.keys(components[type] || {})) {
      if (!reached.has(`#/components/${type}/${name}`)) {
        delete components[type][name];
        dropped.push(`${type}/${name}`);
      }
    }
    if (components[type] && !Object.keys(components[type]).length) delete components[type];
  }
  return dropped;
}

/**
 * Step 5 (spec DOC-20261122-001): adds the examples listed in openapi/examples.json to their operations, as named
 * examples on the response for their status and on the request body. Each must match its schema.
 */
function addExamples(doc, errors, log) {
  const config = readJson(IN('examples.json'));
  const lock = readJson(IN('examples.lock.json'));
  const bundle = readBundle();
  const sha = bundleHash(bundle);
  if (sha !== lock.sha256) {
    errors.push(`openapi/examples/ doesn't match examples.lock.json. Update it only with scripts/update-examples.js.`);
    return;
  }
  const Ajv = require('ajv');
  const ajv = new Ajv({ strict: false, allErrors: true });
  require('ajv-formats')(ajv);
  // Local $refs resolve against the document's components.
  ajv.addSchema({ $id: 'doc', components: structuredClone(doc.components || {}) });
  const toAjv = (schema) => JSON.parse(JSON.stringify(schema).replace(/"#\/components\//g, '"doc#/components/'));
  const check = (schema, value, what) => {
    const validate = ajv.compile(toAjv(schema));
    if (validate(value)) return true;
    errors.push(`${what}: ${validate.errors.slice(0, 3).map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ')}`);
    return false;
  };
  const byId = new Map([...operations(doc)].map((o) => [o.op.operationId, o]));
  const deref = (node) => (node && node.$ref ? structuredClone(resolvePointer(doc, node.$ref)) : node);
  const setExample = (media, key, ex, what) => {
    if ('example' in media) {
      delete media.example;
      log.push(`example replaced by recorded examples: ${what}`);
    }
    media.examples = { ...(media.examples || {}), [key]: { summary: ex.title, description: ex.description, value: ex.value } };
  };

  for (const id of config.reference || []) {
    const text = bundle[`${id}.json`];
    if (!text) {
      errors.push(`examples.json lists ${id}, which isn't in openapi/examples/`);
      continue;
    }
    const ex = JSON.parse(text);
    const where = `example ${id}`;
    const found = byId.get(ex.operationId);
    if (!found) {
      errors.push(`${where}: operation ${ex.operationId} isn't in the document`);
      continue;
    }
    const { op } = found;
    const status = String(ex.response.status);
    if (!op.responses || !op.responses[status]) {
      errors.push(`${where}: ${ex.operation} documents no ${status} response`);
      continue;
    }
    const key = exampleKey(id);
    // Inline a shared response first, so the example lands on this operation only.
    const response = (op.responses[status] = deref(op.responses[status]));
    const media = response.content && response.content['application/json'];
    if (!media || !media.schema) {
      errors.push(`${where}: ${ex.operation} ${status} has no JSON schema`);
      continue;
    }
    if (!check(media.schema, ex.response.body, `${where}: response doesn't match ${ex.operation} ${status}`)) continue;
    setExample(media, key, { ...ex, value: ex.response.body }, `${ex.operation} ${status}`);

    const body = ex.request && ex.request.body;
    if (body !== null && body !== undefined && ex.response.status < 400) {
      op.requestBody = deref(op.requestBody);
      const reqMedia = op.requestBody && op.requestBody.content && op.requestBody.content['application/json'];
      if (!reqMedia || !reqMedia.schema) errors.push(`${where}: ${ex.operation} has no JSON request body`);
      else if (check(reqMedia.schema, body, `${where}: request doesn't match ${ex.operation}`)) {
        setExample(reqMedia, key, { ...ex, value: body }, `${ex.operation} request`);
      }
    }
  }
  log.push(`examples: ${(config.reference || []).length} in the reference, ${Object.keys(config.blocked || {}).length} blocked (bundle ${lock.commit.slice(0, 10)})`);
}

function generate() {
  const errors = [];
  const log = [];

  const { subset, lock } = loadSubset(errors);
  const gateway = readJson(IN('gateway.json'));
  const patch = readJson(IN('patch.json'));
  const access = readJson(IN('access.json'));

  validateAccess(access, errors);
  forbidAccessKeys('gateway.json', gateway, '', errors);
  forbidAccessKeys('patch.json', patch, '', errors);
  if (errors.length) throw new GenerateError(errors.join('\n'));

  // 1–3: subset, then the gateway's operations, then our prose.
  let doc = mergePatch(mergePatch(subset, gateway), patch);

  const gatewayOps = new Set();
  for (const { path: p, method } of operations(gateway)) gatewayOps.add(`${method} ${p}`);

  // 4: access. Exposed operations get x-zooza-access; the rest of the subset is left out.
  const endpoints = access.endpoints;
  const seenIds = new Map();
  const exposed = new Set();
  for (const { path: p, method, op } of [...operations(doc)]) {
    const key = `${method.toUpperCase()} ${p}`;
    if (!op.operationId) errors.push(`${key} has no operationId`);
    else if (seenIds.has(op.operationId)) errors.push(`operationId ${op.operationId} is used by ${seenIds.get(op.operationId)} and ${key}`);
    else seenIds.set(op.operationId, key);

    for (const k of ACCESS_KEYS) delete op[k];
    if (gatewayOps.has(`${method} ${p}`)) continue;

    const rule = endpoints[op.operationId];
    if (!rule) {
      delete doc.paths[p][method];
      log.push(`left out (not in access.json): ${op.operationId || key}`);
      continue;
    }
    exposed.add(op.operationId);
    const groups = [...rule.groups];
    const cost = rule.cost ?? access.defaults.cost;
    const line = accessLine(groups, cost);
    op.description = op.description ? `${op.description.trimEnd()}\n\n${line}` : line;
    op['x-zooza-access'] = { groups, cost };
  }
  for (const [p, item] of Object.entries(doc.paths)) {
    if (!METHODS.some((m) => isObject(item[m]))) delete doc.paths[p];
  }

  // The hard failure: access.json opens an operation the subset doesn't have (a typo, or a rename upstream).
  for (const id of Object.keys(endpoints)) {
    if (!exposed.has(id)) {
      errors.push(`access.json names ${id}, which isn't in the subset (api-v1 ${lock.commit.slice(0, 10)}). A typo, or the operation was renamed.`);
    }
  }

  // Tags: every operation's tag must be declared; tags left without operations are dropped.
  const used = new Set();
  for (const { path: p, method, op } of operations(doc)) {
    for (const t of op.tags || []) used.add(t);
    if (!op.tags || !op.tags.length) errors.push(`${method.toUpperCase()} ${p} has no tag`);
  }
  const declared = new Set((doc.tags || []).map((t) => t.name));
  for (const t of used) if (!declared.has(t)) errors.push(`tag "${t}" is used by an operation but not declared in tags`);
  if (doc.tags) {
    for (const t of doc.tags) if (!used.has(t.name)) log.push(`tag dropped (no operations): ${t.name}`);
    doc.tags = doc.tags.filter((t) => used.has(t.name));
  }

  // 5: reference examples from the vendored bundle, each checked against its schema. Before pruning, so a shared
  // response inlined here doesn't leave an unreachable component behind.
  addExamples(doc, errors, log);

  for (const c of pruneComponents(doc)) log.push(`component dropped (unreachable): ${c}`);

  // Document-level access, then error codes last, in a fixed order.
  const out = {};
  for (const [k, v] of Object.entries(doc)) {
    if (!DOC_ACCESS_KEYS.includes(k) && k !== 'x-zooza-error-codes') out[k] = v;
  }
  out['x-zooza-access-defaults'] = access.defaults;
  out['x-zooza-tiers'] = access.tiers;
  out['x-zooza-groups'] = access.groups;
  out['x-zooza-token-endpoint'] = access.token_endpoint;
  if (doc['x-zooza-error-codes']) out['x-zooza-error-codes'] = doc['x-zooza-error-codes'];
  doc = out;

  // The gateway's boot checks, one for one, so a document it would refuse is never written.
  for (const { path: p, method, op } of operations(doc)) {
    if (gatewayOps.has(`${method} ${p}`)) continue;
    const a = op['x-zooza-access'];
    const key = `${method.toUpperCase()} ${p}`;
    if (!a || !Array.isArray(a.groups) || !a.groups.length) errors.push(`${key}: x-zooza-access needs non-empty groups`);
    for (const g of (a && a.groups) || []) if (!doc['x-zooza-groups'][g]) errors.push(`${key}: group ${g} isn't in x-zooza-groups`);
    if (!a || !isPositiveInt(a.cost)) errors.push(`${key}: x-zooza-access cost must be a positive integer`);
  }
  if (!Object.keys(doc['x-zooza-tiers'] || {}).length) errors.push('x-zooza-tiers is empty');

  for (const ref of collectRefs(doc, new Set())) {
    if (resolvePointer(doc, ref) === undefined) errors.push(`unresolved $ref ${ref}`);
  }

  const wording = [];
  scanJson(OUTPUT_REL, doc, '', wording);
  // Prose must describe access as it is now: x-zooza-access per operation, not the retired per-operation keys.
  const retired = [{ name: 'retired extension', re: /x-zooza-cost\b/g }];
  scanJson(OUTPUT_REL, doc, '', wording, retired);
  errors.push(...wording.map((w) => `wording: ${w}`));

  if (errors.length) throw new GenerateError(errors.join('\n'));
  return { text: JSON.stringify(doc, null, 4) + '\n', log, lock, count: [...operations(doc)].length };
}

const opList = (doc) => new Set([...operations(doc)].map(({ path: p, method }) => `${method.toUpperCase()} ${p}`));

function main() {
  const check = process.argv.includes('--check');
  const { text, log, lock, count } = generate();
  for (const line of log) console.log(`[generate-api-doc] ${line}`);

  if (process.argv.includes('--preview')) {
    const before = fs.existsSync(OUTPUT) ? opList(JSON.parse(fs.readFileSync(OUTPUT, 'utf8'))) : new Set();
    const after = opList(JSON.parse(text));
    for (const o of after) if (!before.has(o)) console.log(`[generate-api-doc] preview: would add ${o}`);
    for (const o of before) if (!after.has(o)) console.log(`[generate-api-doc] preview: would remove ${o}`);
    console.log(`[generate-api-doc] preview OK: every check passes (${count} operations). Nothing written.`);
    return;
  }

  if (check) {
    const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';
    if (current !== text) {
      console.error(
        `[generate-api-doc] ${OUTPUT_REL} differs from a fresh generation. Don't edit it by hand: ` +
          `change openapi/ and run node scripts/generate-api-doc.js.`,
      );
      process.exit(1);
    }
    console.log(`[generate-api-doc] OK: ${OUTPUT_REL} is up to date (${count} operations, api-v1 ${lock.commit.slice(0, 10)})`);
    return;
  }
  fs.writeFileSync(OUTPUT, text);
  console.log(`[generate-api-doc] wrote ${OUTPUT_REL} (${count} operations, api-v1 ${lock.commit.slice(0, 10)})`);
}

try {
  main();
} catch (e) {
  if (!(e instanceof GenerateError)) throw e;
  console.error(`[generate-api-doc] not written:\n  ${e.message.split('\n').join('\n  ')}`);
  process.exit(1);
}
