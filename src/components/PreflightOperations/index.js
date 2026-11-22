import React from 'react';
import Link from '@docusaurus/Link';
// The generated /v3 document. An operation offers a preflight check when its `action` query parameter accepts
// `preflight_check`, so this list can't disagree with the reference.
import doc from '@site/static/zooza_api_v3.json';

const METHODS = ['get', 'put', 'post', 'delete', 'patch'];
const slug = (tag) => tag.toLowerCase().replace(/\s+/g, '-');
const deref = (node) => (node && node.$ref ? node.$ref.split('/').slice(1).reduce((a, k) => a[k], doc) : node);

/** Every /v3 operation with `?action=preflight_check`, from the document. Shared with build-llms-full.js. */
export function preflightOperations() {
  const rows = [];
  for (const [path, item] of Object.entries(doc.paths || {})) {
    for (const method of METHODS) {
      const op = item[method];
      if (!op) continue;
      const param = (op.parameters || []).map(deref).find((p) => p && p.in === 'query' && p.name === 'action');
      const values = (param && param.schema && param.schema.enum) || [];
      if (!values.includes('preflight_check')) continue;
      rows.push({ method: method.toUpperCase(), path, tag: (op.tags || [''])[0], summary: op.summary || '', what: param.description || '' });
    }
  }
  return rows;
}

/** The operations that offer a preflight check, linked to the reference. */
export default function PreflightOperations() {
  return (
    <table>
      <thead>
        <tr>
          <th>Operation</th>
          <th>Request</th>
          <th>What it checks</th>
        </tr>
      </thead>
      <tbody>
        {preflightOperations().map((r) => (
          <tr key={`${r.method} ${r.path}`}>
            <td>
              <Link to={`/api/reference#tag/${slug(r.tag)}/${r.method}${r.path}`}>{r.summary}</Link>
            </td>
            <td>
              <code>
                {r.method} /v3{r.path}?action=preflight_check
              </code>
            </td>
            <td>
              {/* The description is Markdown: show `code` spans as code. */}
              {r.what
                .replace(/^`preflight_check`:\s*/, '')
                .split('`')
                .map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
