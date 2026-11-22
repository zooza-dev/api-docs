import React from 'react';
// The generated /v3 document (spec DOC-20261120-001). The tiers come from its x-zooza-tiers, the same
// values the API enforces, so this table can't disagree with them.
import doc from '@site/static/zooza_api_v3.json';

const n = (v) => Number(v).toLocaleString('en-GB');

/** The rate tiers: points per minute and per day. */
export default function RateTiers() {
  return (
    <table>
      <thead>
        <tr>
          <th>Tier</th>
          <th>Points per minute</th>
          <th>Points per day</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(doc['x-zooza-tiers'] || {}).map(([name, t]) => (
          <tr key={name}>
            <td>
              <code>{name}</code>
            </td>
            <td>{n(t.points_per_minute)}</td>
            <td>{n(t.points_per_day)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
