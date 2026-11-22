/**
 * The vendored examples bundle (openapi/examples/, spec DOC-20261122-001): reading it and hashing it.
 * Shared by update-examples.js (which writes it) and generate-api-doc.js (which checks it against the lock).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = path.resolve(__dirname, '..', '..', 'openapi', 'examples');

/** sha256 over the bundle: each file's relative path and bytes, in sorted order. */
function bundleHash(filesByRel) {
  const h = crypto.createHash('sha256');
  for (const rel of Object.keys(filesByRel).sort()) h.update(`${rel}\n`).update(filesByRel[rel]).update('\n');
  return h.digest('hex');
}

/** Reads openapi/examples/ as { rel: text }. */
function readBundle(dir = DIR) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const rel of fs.readdirSync(dir, { recursive: true })) {
    if (String(rel).endsWith('.json')) out[String(rel).split(path.sep).join('/')] = fs.readFileSync(path.join(dir, rel), 'utf8');
  }
  return out;
}

/** The example's key in an OpenAPI `examples` map: its file name without the order number. */
const exampleKey = (id) => id.split('/').pop().replace(/^\d+-/, '');

module.exports = { DIR, bundleHash, readBundle, exampleKey };
