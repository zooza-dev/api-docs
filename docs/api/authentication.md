---
title: Authentication
description: Exchange a Zooza API key for an access token with POST /v3/token — request, response, lifetime, caching, limits and why a request is refused.
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Authentication

The Zooza API uses the OAuth 2.0 **client credentials** flow, with one Zooza-specific field. You exchange your key's
`client_id` and `client_secret`, plus the email of an owner of the company, for a bearer token. Then you send that
token on every call.

```
POST /v3/token  →  access_token  →  Authorization: Bearer <access_token>
```

Reference: [`POST /v3/token`](/api/reference#tag/authentication/POST/token).

## The token request

Send the body as JSON or as `application/x-www-form-urlencoded`.

| Field | Required | Value |
|---|---|---|
| `grant_type` | No | `client_credentials`, the only accepted value. You may leave it out. |
| `client_id` | Yes | Your key's client id, e.g. `zk_4768b32989b7303eac7ff30e`. |
| `client_secret` | Yes | Your key's secret. Read it from the environment; never put it in code. |
| `email` | Yes | The email of an owner of the key's company. See [Owner email](#owner-email). |

<Tabs groupId="api-lang">
<TabItem value="curl" label="cURL" default>

```bash
curl -s -X POST https://api.zooza.app/v3/token \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\":\"client_credentials\",\"client_id\":\"$ZOOZA_CLIENT_ID\",\"client_secret\":\"$ZOOZA_CLIENT_SECRET\",\"email\":\"$ZOOZA_OWNER_EMAIL\"}"
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
const res = await fetch('https://api.zooza.app/v3/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: process.env.ZOOZA_CLIENT_ID,
    client_secret: process.env.ZOOZA_CLIENT_SECRET,
    email: process.env.ZOOZA_OWNER_EMAIL,
  }),
});
```

</TabItem>
<TabItem value="python" label="Python">

```python
res = requests.post(
    "https://api.zooza.app/v3/token",
    json={
        "grant_type": "client_credentials",
        "client_id": os.environ["ZOOZA_CLIENT_ID"],
        "client_secret": os.environ["ZOOZA_CLIENT_SECRET"],
        "email": os.environ["ZOOZA_OWNER_EMAIL"],
    },
    timeout=10,
)
```

</TabItem>
</Tabs>

**HTTP Basic.** Instead of the body, you can send `client_id` and `client_secret` as HTTP Basic authentication
(`Authorization: Basic base64(client_id:client_secret)`). `email` always goes in the body.

```bash
curl -s -X POST https://api.zooza.app/v3/token \
  -u "$ZOOZA_CLIENT_ID:$ZOOZA_CLIENT_SECRET" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "email=$ZOOZA_OWNER_EMAIL"
```

**`scope`.** If your client sends a `scope`, it is ignored. The token always gets exactly the access groups the key
has.

## The response

```json
{
  "access_token": "eyJ…",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "core_read core_write"
}
```

| Field | Meaning |
|---|---|
| `access_token` | Send it as `Authorization: Bearer <access_token>`. |
| `token_type` | Always `Bearer`. |
| `expires_in` | Seconds until the token expires: 3600 (60 minutes). |
| `scope` | The key's [access groups](access-and-rate-limits.md#access-groups), space-separated. |

## Owner email {#owner-email}

`email` must belong to a user with the **owner** role in the key's company. The token acts as that owner:

- every call runs with that owner's permissions, and a key can never do more than its owner may;
- changes made through the API are attributed to that owner in Zooza, so the company's history stays meaningful.

The key is not tied to one owner: any current owner of the company can be named. If the named user stops being an
owner, calls made with their tokens stop working, and new token requests naming them are refused. In that case,
name another owner.

## Token lifetime and caching

- A token lasts **60 minutes**. There is **no refresh token**.
- Cache the token and reuse it for every call until it expires. Request a new one when it expires, or shortly before
  (for example when fewer than 60 seconds are left, using `expires_in`).
- Don't request a token per call. The token operation has its own limit (below), and calls with a cached token are
  faster.
- A `401` on a normal call means the token is missing, invalid or expired: request a new token and retry once.

```js
// Minimal token cache (Node.js)
let cached = null; // { token, expiresAt }

async function getToken() {
  if (cached && Date.now() < cached.expiresAt - 60_000) return cached.token;
  const res = await fetch(`${process.env.ZOOZA_BASE_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.ZOOZA_CLIENT_ID,
      client_secret: process.env.ZOOZA_CLIENT_SECRET,
      email: process.env.ZOOZA_OWNER_EMAIL,
    }),
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const { access_token, expires_in } = await res.json();
  cached = { token: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return access_token;
}
```

## Limits on the token operation

`POST /v3/token` doesn't cost points, but it has its own limit:

| Limit | Value |
|---|---|
| Tokens per key | 5 per minute |
| Tokens per IP address | 20 per minute |

Over the limit, it answers `429` with `Retry-After` (seconds to wait).

## Why a token request is refused {#invalid-client}

Refused token requests use OAuth error bodies:

```json
{ "error": "invalid_client", "error_description": "…" }
```

| Status | `error` | Meaning |
|---|---|---|
| `400` | `invalid_request` | A required field is missing. |
| `400` | `unsupported_grant_type` | `grant_type` is something other than `client_credentials`. |
| `401` | `invalid_client` | The credentials were not accepted. |
| `429` | — | Too many token requests; wait `Retry-After` seconds. |
| `503` | — | The credentials couldn't be checked right now. This is not a credential problem; retry later. |

**`invalid_client` never says why**, by design. Check each of these:

1. **Unknown key:** the `client_id` is mistyped, or belongs to another [region](index.md#regions-and-base-urls)
   (keys work only in their company's region).
2. **Wrong secret:** the `client_secret` is mistyped, or the secret was rotated and you're using the old one.
3. **Revoked key:** an owner revoked the key in the app.
4. **Not an owner:** `email` isn't the email of an owner of the key's company, or that user is no longer an owner.
5. **Locked key:** after **10 wrong secrets**, a key is locked for **5 minutes**. Requests during the lock are refused
   even with the right secret. Wait, then try again with the correct secret.

## Calling the API

Send the token on every call:

```
GET https://api.zooza.app/v3/courses
Authorization: Bearer <access_token>
```

You don't need to send a company header: a key always acts for its own company (see
[Company scope](access-and-rate-limits.md#company-scope)).

## Related

- [Getting started](getting-started.md): the whole flow, step by step
- [Access and rate limits](access-and-rate-limits.md): what a token may call, and its budget
- [Keys](keys.md): rotating and revoking keys, and how quickly each change takes effect
- [Errors](errors.md): error bodies on normal calls
