import React, { useMemo, useState } from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
// The generated /v3 document (spec DOC-20261120-001). The table is built from its x-zooza-error-codes, which
// api-v1 publishes in the subset, at build time (handoff api-v1-to-api-docs-20261119-001).
import doc from '@site/static/zooza_api_v3.json';
import styles from './styles.module.css';

const VALUE_NOTE = {
  in_message: 'The value ends the message.',
  alongside: 'The value comes under key 0.',
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Error codes grouped by area, in the order of each area's lowest code. */
export function groupedCodes() {
  const codes = [...(doc['x-zooza-error-codes'] || [])].sort((a, b) => a.code.localeCompare(b.code));
  const areas = new Map();
  for (const c of codes) {
    if (!areas.has(c.area)) areas.set(c.area, []);
    areas.get(c.area).push(c);
  }
  return [...areas.entries()];
}

/** Every /v3 error code with its name, description and English message, filterable. */
export default function ErrorCodes() {
  const [query, setQuery] = useState('');
  const groups = useMemo(groupedCodes, []);
  // Tell Docusaurus's link checker about the ids rendered here, so #0065-style links validate.
  const brokenLinks = useBrokenLinks();
  for (const [area, codes] of groups) {
    brokenLinks.collectAnchor(slug(area));
    codes.forEach((c) => brokenLinks.collectAnchor(c.code));
  }
  const q = query.trim().toLowerCase();
  const matches = (c) =>
    !q || [c.code, c.name, c.message, c.description].some((f) => (f || '').toLowerCase().includes(q));
  const shown = groups.map(([area, codes]) => [area, codes.filter(matches)]).filter(([, codes]) => codes.length);
  const total = groups.reduce((n, [, codes]) => n + codes.length, 0);
  const count = shown.reduce((n, [, codes]) => n + codes.length, 0);

  return (
    <div>
      <input
        type="search"
        className={styles.filter}
        placeholder="Filter by code, name or text, e.g. 0037 or discount"
        aria-label="Filter error codes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className={styles.count}>{q ? `${count} of ${total} codes` : `${total} codes`}</p>
      {!q && (
        <p className={styles.areas}>
          {groups.map(([area, codes]) => (
            <a key={area} href={`#${slug(area)}`}>
              {area} ({codes.length})
            </a>
          ))}
        </p>
      )}
      {shown.map(([area, codes]) => (
        <section key={area}>
          <h2 id={slug(area)} className="anchor">
            {area}
          </h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name and meaning</th>
                <th>English message</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.code} id={c.code}>
                  <td>
                    <a href={`#${c.code}`} className={styles.code}>
                      <code>{c.code}</code>
                    </a>
                  </td>
                  <td>
                    <code>{c.name}</code>
                    <div>{c.description}</div>
                    {VALUE_NOTE[c.value] && <div className={styles.value}>{VALUE_NOTE[c.value]}</div>}
                  </td>
                  <td className={styles.message}>{c.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
      {!count && <p>No code matches “{query}”.</p>}
    </div>
  );
}
