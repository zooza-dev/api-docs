---
title: Access and rate limits
description: What a Zooza API key may call (access groups, company scope) and how much (points, costs, rate tiers, headers and 429 handling).
sidebar_position: 4
---
import OperationCosts from '@site/src/components/OperationCosts';
import RateTiers from '@site/src/components/RateTiers';


# Access and rate limits

Two things decide what a call may do:

- **Access groups** decide *which* operations a key may call, and **company scope** decides *whose data*.
- The **rate tier** decides *how much* the key may call, measured in points.

[`GET /v3/me`](/api/reference#tag/authentication/GET/me) shows all of it for your key, live, and costs nothing.

## Access groups {#access-groups}

An access group is a named set of operations. Access is denied by default: a key may call only the operations of the
groups it holds. A key with several groups may call the operations of all of them.

| Group | Allows |
|---|---|
| `core_read` | The read operations (`GET`) |
| `core_write` | The operations that create or change data (`POST`, `PUT`) |

"Read only" means `core_read`. "Read and write" means `core_read` and `core_write`.

- [Every operation, with its group and cost](#costs-per-operation) is listed below. In the machine-readable document
  they are each operation's `x-zooza-access` (`{"groups": […], "cost": …}`), and the reference shows them at the end
  of each operation's description.
- Calling an operation outside the key's groups answers `403`.
- **A key can never do more than its owner.** The token acts as the [owner named in the token
  request](authentication.md#owner-email), and access groups only narrow what that owner may do.
- A change to a key's groups applies to tokens requested after the change (so within 60 minutes at most). See
  [Keys](keys.md#when-changes-take-effect).

## Company scope {#company-scope}

A key acts for **exactly one company**: the company that created it (company scope `pinned`). It can't read or
change another company's data, even a company the same owner also owns or one in the same network. You don't send
a company id; every call works on the key's company.

## `GET /v3/me`

```json
{
  "client_id": "zk_…",
  "region": "EU",
  "groups": ["core_read"],
  "tier": "free",
  "points": {
    "limit_minute": 60, "remaining_minute": 54,
    "limit_day": 1000, "remaining_day": 872,
    "reset_day": "2026-11-19T00:00:00Z"
  },
  "token": { "expires_at": "2026-11-18T11:00:00Z" },
  "operations": [
    { "op": "get_courses", "method": "GET", "path": "/v3/courses", "cost": 2 }
  ]
}
```

| Field | Meaning |
|---|---|
| `client_id` | The key |
| `region` | `EU`, `UK` or `ASIA`: the key's region |
| `groups` | The key's access groups |
| `tier` | Your company's rate tier, the same for all its keys |
| `points` | The company's budget per minute and per day, what's left, and when the day resets (midnight UTC) |
| `token.expires_at` | When the token used for this call expires |
| `operations` | Every operation the key may call, with its cost |

It's the recommended way to check remaining budget and permissions before a batch job.

## Rate limits: points

Limits are counted in **points, not requests**. Each operation costs points, and your company's rate tier gives it a
budget per minute and per day. The day window resets at midnight UTC.

The budget belongs to the company, not to a key: all of its keys draw on the same points, so two integrations running
at once share it. The tier follows the company's Zooza plan; see `GET /v3/me` for the live numbers.

:::note Today's defaults
The costs and tiers below are today's defaults and may change. The authoritative numbers are in the
[table of operations](#costs-per-operation) and the tier table below (both generated from the published document),
and `GET /v3/me`.
:::

**Costs**

| Kind of call | Points |
|---|---|
| Read one record (`GET` with an id) | 1 |
| Read a list | 2 |
| Create or change (`POST`, `PUT`) | 5 |
| Download link (invoice PDF) | 10 |
| `GET /v3/me`, `POST /v3/token` | 0 |

### Costs per operation {#costs-per-operation}

Generated from the published [OpenAPI document](https://api.zooza.app/v3/openapi.json), so it always matches what
is charged.

<OperationCosts />

**Rate tiers**

<RateTiers />

The tier is your company's and follows its Zooza plan. `GET /v3/me` shows which tier applies.

### When points are charged

- Points are charged **before** the call runs.
- They are refunded only when the API couldn't handle the call at all: `503` (temporarily unavailable) and `504`
  (no answer in time).
- Every other answer costs the operation's points, including `400` and `500`.

## Rate-limit headers

Every successful call and every `429` carries the budget, in points:

| Header | Meaning |
|---|---|
| `X-RateLimit-Limit` | Points per minute |
| `X-RateLimit-Remaining` | Points left in the current minute |
| `X-RateLimit-Reset` | Seconds until the minute budget resets |
| `X-RateLimit-Limit-Day` | Points per day |
| `X-RateLimit-Remaining-Day` | Points left today (UTC) |
| `X-RateLimit-Reset-Day` | Seconds until the daily budget resets |

## Handling `429`

Over budget, the API answers `429` with a `Retry-After` header: the number of seconds to wait.

- Wait at least `Retry-After` seconds before the next call. Don't retry in a tight loop.
- For batch jobs, watch `X-RateLimit-Remaining` and slow down before you hit zero.
- If you regularly run out of the daily budget, cache what you read: programmes, classes and venues change rarely.

```js
async function callWithRetry(url, options, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    const wait = Number(res.headers.get('Retry-After') || 1);
    await new Promise((r) => setTimeout(r, wait * 1000));
  }
  throw new Error('Still rate limited after retries');
}
```

The token operation has its own, separate limit: see [Authentication](authentication.md#limits-on-the-token-operation).

## Related

- [Keys](keys.md): changing a key's access groups
- [Errors](errors.md): `403`, `429` and the other error bodies
- [API reference](/api/reference): the groups and cost of every operation
