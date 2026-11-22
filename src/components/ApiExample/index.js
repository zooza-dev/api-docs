import React from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
// The generated /v3 document: an example may only show an operation the reference has.
import doc from '@site/static/zooza_api_v3.json';

// The vendored examples (openapi/examples/, spec DOC-20261122-001): real recorded calls with personal data replaced.
// Never paste a request or answer into a page; show it with <ApiExample id="<flow>/<file>" />.
const context = require.context('@site/openapi/examples', true, /\.json$/);
const EXAMPLES = Object.fromEntries(context.keys().map((k) => [k.replace(/^\.\//, '').replace(/\.json$/, ''), context(k)]));

const METHODS = ['get', 'put', 'post', 'delete', 'patch'];
const OPERATIONS = {};
for (const [path, item] of Object.entries(doc.paths || {})) {
  for (const m of METHODS) if (item[m]) OPERATIONS[item[m].operationId] = { path, method: m.toUpperCase(), tag: (item[m].tags || [''])[0] };
}
const slug = (tag) => tag.toLowerCase().replace(/\s+/g, '-');
// Bodies longer than this start collapsed.
const LONG = 25;

function query(q) {
  const entries = Object.entries(q || {});
  if (!entries.length) return '';
  // Readable, not encoded: `|` and spaces stay as a reader would type them.
  return `?${entries.map(([k, v]) => `${k}=${v}`).join('&')}`;
}

function Json({ value, title }) {
  const text = JSON.stringify(value, null, 2);
  const block = <CodeBlock language="json">{text}</CodeBlock>;
  if (text.split('\n').length <= LONG) return block;
  return (
    <details>
      <summary>{title}</summary>
      {block}
    </details>
  );
}

/** One recorded /v3 call: the request and what came back. */
export default function ApiExample({ id, title, showDescription = false }) {
  const ex = EXAMPLES[id];
  // Fail the build rather than publish a page that shows nothing or a call the reference doesn't have.
  if (!ex) throw new Error(`<ApiExample id="${id}">: no such example in openapi/examples/`);
  const op = OPERATIONS[ex.operationId];
  if (!op) throw new Error(`<ApiExample id="${id}">: operation ${ex.operationId} isn't in the /v3 document`);

  const { request, response } = ex;
  const trimmed = Object.entries(ex.trimmed || {});
  return (
    <div className="api-example">
      <p>
        <strong>{title || ex.title}</strong>{' '}
        (<Link to={`/api/reference#tag/${slug(op.tag)}/${op.method}${op.path}`}>reference</Link>)
      </p>
      {showDescription && <p>{ex.description}</p>}
      <CodeBlock language="text">{`${request.method} /v3${request.path}${query(request.query)}`}</CodeBlock>
      {request.body !== null && request.body !== undefined && <Json value={request.body} title="Request body" />}
      <p>
        Answer: <code>{response.status}</code>
        {trimmed.length > 0 && <> (lists shortened: {trimmed.map(([at, what]) => `${at} ${what}`).join('; ')})</>}
      </p>
      <Json value={response.body} title={`Answer body (${response.status})`} />
    </div>
  );
}
