---
title: Getting started
description: From a Zooza API key to your first successful call — create a key, request a token, check the key with GET /v3/me, then list programmes.
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting started

This page takes you from nothing to a working call in four steps: get a key, request a token, check what the key
can do, and list the company's programmes. Every step is read-only, so nothing in the company changes.

You need:

- a Zooza company, and an account with the **owner** role in it;
- a server-side environment with cURL, Node.js 18+ or Python 3 (the secret must never run in a browser).

## 1. Create a key

A company owner creates keys in the Zooza app: **Developers → API keys → New key**. Other roles can't create keys.

A new key has:

| Part | Example | Notes |
|---|---|---|
| `client_id` | `zk_4768b32989b7303eac7ff30e` | Not secret. Identifies the key. |
| `client_secret` | `<client_secret>` | **Shown once.** Copy it straight into your secret store. If you lose it, rotate the key to get a new one. |
| Access groups | `core_read` | What the key may call. New keys are read only. |
| Company scope | `pinned` | The key acts only for the company that created it. |

Store the values as environment variables. Locally, use a `.env` file that is listed in `.gitignore`:

```bash title=".env (git-ignored)"
ZOOZA_CLIENT_ID=zk_…
ZOOZA_CLIENT_SECRET=<client_secret>
ZOOZA_OWNER_EMAIL=owner@yourcompany.example
ZOOZA_BASE_URL=https://api.zooza.app/v3
```

`ZOOZA_OWNER_EMAIL` is the email of an owner of the company: the token acts as that owner (see
[why](authentication.md#owner-email)). Use the base URL of your company's [region](index.md#regions-and-base-urls).

:::warning Never paste the secret into chat
Don't paste `client_secret` into a chat, a support ticket or an AI agent. If an agent helps you write the code, let it
read the secret from the environment.
:::

## 2. Request an access token

Exchange the key for a token at [`POST /v3/token`](/api/reference#tag/authentication/POST/token).

<Tabs groupId="api-lang">
<TabItem value="curl" label="cURL" default>

```bash
curl -s -X POST "$ZOOZA_BASE_URL/token" \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\":\"client_credentials\",\"client_id\":\"$ZOOZA_CLIENT_ID\",\"client_secret\":\"$ZOOZA_CLIENT_SECRET\",\"email\":\"$ZOOZA_OWNER_EMAIL\"}"
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
// Node.js 18+ (built-in fetch). Load .env with e.g. `node --env-file=.env token.js`.
const res = await fetch(`${process.env.ZOOZA_BASE_URL}/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: process.env.ZOOZA_CLIENT_ID,
    client_secret: process.env.ZOOZA_CLIENT_SECRET,
    email: process.env.ZOOZA_OWNER_EMAIL,
  }),
});
if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
const { access_token, expires_in } = await res.json();
```

</TabItem>
<TabItem value="python" label="Python">

```python
import os
import requests

res = requests.post(
    f"{os.environ['ZOOZA_BASE_URL']}/token",
    json={
        "grant_type": "client_credentials",
        "client_id": os.environ["ZOOZA_CLIENT_ID"],
        "client_secret": os.environ["ZOOZA_CLIENT_SECRET"],
        "email": os.environ["ZOOZA_OWNER_EMAIL"],
    },
    timeout=10,
)
res.raise_for_status()
token = res.json()
access_token = token["access_token"]
```

</TabItem>
</Tabs>

The response:

```json
{ "access_token": "eyJ…", "token_type": "Bearer", "expires_in": 3600, "scope": "core_read" }
```

The token lasts 60 minutes. Cache it and reuse it for every call; don't request a new token per call, because the
token operation has its own strict limit. If you get `401 invalid_client`, see
[why a token request is refused](authentication.md#invalid-client).

## 3. Check the key: `GET /v3/me`

[`GET /v3/me`](/api/reference#tag/authentication/GET/me) costs no points. It confirms the token works and shows
what the key may do.

<Tabs groupId="api-lang">
<TabItem value="curl" label="cURL" default>

```bash
curl -s "$ZOOZA_BASE_URL/me" -H "Authorization: Bearer $ACCESS_TOKEN"
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
const me = await fetch(`${process.env.ZOOZA_BASE_URL}/me`, {
  headers: { Authorization: `Bearer ${access_token}` },
}).then((r) => r.json());
console.log(me.groups, me.tier, me.points);
```

</TabItem>
<TabItem value="python" label="Python">

```python
me = requests.get(
    f"{os.environ['ZOOZA_BASE_URL']}/me",
    headers={"Authorization": f"Bearer {access_token}"},
    timeout=10,
).json()
print(me["groups"], me["tier"], me["points"])
```

</TabItem>
</Tabs>

```json
{
  "client_id": "zk_…",
  "region": "EU",
  "groups": ["core_read"],
  "tier": "free",
  "points": { "limit_minute": 60, "remaining_minute": 60, "limit_day": 1000, "remaining_day": 1000,
              "reset_day": "2026-11-19T00:00:00Z" },
  "token": { "expires_at": "2026-11-18T11:00:00Z" },
  "operations": [ { "op": "get_courses", "method": "GET", "path": "/v3/courses", "cost": 2 } ]
}
```

`operations` lists every operation the key may call, with its cost. [Access and rate limits](access-and-rate-limits.md)
explains groups, tiers and points.

## 4. Make your first call: list programmes

[`GET /v3/courses`](/api/reference#tag/programmes/GET/courses) lists the company's
[programmes](../concepts.md#programme-course). It costs 2 points.

<Tabs groupId="api-lang">
<TabItem value="curl" label="cURL" default>

```bash
curl -s "$ZOOZA_BASE_URL/courses" -H "Authorization: Bearer $ACCESS_TOKEN"
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
const res = await fetch(`${process.env.ZOOZA_BASE_URL}/courses`, {
  headers: { Authorization: `Bearer ${access_token}` },
});
console.log('Points left this minute:', res.headers.get('X-RateLimit-Remaining'));
const programmes = await res.json();
for (const p of programmes) console.log(p.id, p.name);
```

</TabItem>
<TabItem value="python" label="Python">

```python
res = requests.get(
    f"{os.environ['ZOOZA_BASE_URL']}/courses",
    headers={"Authorization": f"Bearer {access_token}"},
    timeout=10,
)
res.raise_for_status()
print("Points left this minute:", res.headers.get("X-RateLimit-Remaining"))
for p in res.json():
    print(p["id"], p["name"])
```

</TabItem>
</Tabs>

Every response carries `X-RateLimit-*` headers with your remaining budget, in points.

## Next steps

- Read the [API reference](/api/reference) for the operations you need: [classes](/api/reference#tag/classes),
  [sessions](/api/reference#tag/sessions), [registrations](/api/reference#tag/registrations).
- Handle token expiry and refused tokens: [Authentication](authentication.md).
- Handle `429` and plan your call volume: [Access and rate limits](access-and-rate-limits.md).
- Handle failures: [Errors](errors.md).
- Need to create or change data? An owner can add the `core_write` access group to the key; see [Keys](keys.md).
  Keys act on **live data** and there is no sandbox yet, so test writes carefully.
