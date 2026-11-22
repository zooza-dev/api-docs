import React from 'react';
import Link from '@docusaurus/Link';
// The generated /v3 document (spec DOC-20261120-001). Read at build time, so this table always shows
// exactly the groups and costs the document publishes.
import doc from '@site/static/zooza_api_v3.json';

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const slug = (tag) => tag.toLowerCase().replace(/\s+/g, '-');

/** Every /v3 operation with its access groups and point cost, linked to the reference. */
export default function OperationCosts() {
  const tagOrder = (doc.tags || []).map((t) => t.name);
  const rows = [];
  for (const [path, item] of Object.entries(doc.paths || {})) {
    for (const method of METHODS) {
      const op = item[method];
      if (!op) continue;
      const tag = (op.tags && op.tags[0]) || '';
      // Operations without x-zooza-access (the token request and GET /me) need no group and are free.
      const access = op['x-zooza-access'] || { groups: [], cost: 0 };
      rows.push({
        tag,
        method: method.toUpperCase(),
        path,
        summary: op.summary || '',
        groups: access.groups,
        cost: access.cost,
      });
    }
  }
  rows.sort((a, b) => tagOrder.indexOf(a.tag) - tagOrder.indexOf(b.tag));

  return (
    <table>
      <thead>
        <tr>
          <th>Operation</th>
          <th>Request</th>
          <th>Access group</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={`${r.method} ${r.path}`}>
            <td>
              <Link to={`/api/reference#tag/${slug(r.tag)}/${r.method}${r.path}`}>{r.summary}</Link>
            </td>
            <td>
              <code>
                {r.method} /v3{r.path}
              </code>
            </td>
            <td>{r.groups.length ? r.groups.map((g) => <code key={g}>{g}</code>) : 'any key'}</td>
            <td>{r.cost}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
