# Zooza API: setup for AI coding agents

You are helping a developer build an integration with Zooza. Read this file before you write any code, and follow
it exactly.

## What Zooza is

Zooza runs booking, registrations, attendance, payments and invoicing for businesses that teach classes and
courses (kids' clubs, swimming, dance, music, sports, language schools, franchises). The Zooza API gives the
developer's **server** access to that company's data.

## What the developer may have given you

The developer's prompt may include any of these. All of them are **non-secret**: treat them as given, and don't ask
for them again.

- **API base URL**, one per region:
  - EU: `https://api.zooza.app/v3`
  - UK: `https://uk.api.zooza.app/v3`
  - ASIA: `https://asia.api.zooza.app/v3`
- **`client_id`** of their API key, e.g. `zk_4768b32989b7303eac7ff30e`.
- **Access level**: `core_read` (read only) or `core_read core_write` (read and write).
- **Widget id**, if they also embed Zooza widgets.

If the base URL is missing, ask which region their Zooza account is in.

## Secrets: rules you must follow

- The **`client_secret` is secret.** Never ask the developer to paste it into this chat, and never write it into code,
  a URL, a log line, a test fixture or a commit.
- Read credentials from the environment. Locally, use a `.env` file and make sure `.env` is listed in `.gitignore`
  before you create it.

  ```bash
  ZOOZA_API_URL=https://api.zooza.app/v3
  ZOOZA_CLIENT_ID=zk_…
  ZOOZA_CLIENT_SECRET=            # the developer fills this in themselves
  ZOOZA_OWNER_EMAIL=owner@yourcompany.example
  ```

- If a variable is missing, tell the developer which one to set and where (the `.env` file or their secret
  manager), then stop. Do not work around it.
- Only server-side code calls the API. Never put a key, secret or token into browser code or a mobile app.

## Step 1: get an access token

`POST /v3/token` exchanges the key for a bearer token. `email` must belong to an **owner** of the key's company, and
the token acts as that owner.

```bash
curl -X POST "$ZOOZA_API_URL/token" \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\":\"client_credentials\",\"client_id\":\"$ZOOZA_CLIENT_ID\",\"client_secret\":\"$ZOOZA_CLIENT_SECRET\",\"email\":\"$ZOOZA_OWNER_EMAIL\"}"
```

```javascript
// Node 18+. Cache the token and reuse it until shortly before it expires.
let token = { value: null, expires_at: 0 };

async function zoozaToken() {
  if (token.value && Date.now() < token.expires_at - 60_000) return token.value;
  const res = await fetch(`${process.env.ZOOZA_API_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.ZOOZA_CLIENT_ID,
      client_secret: process.env.ZOOZA_CLIENT_SECRET,
      email: process.env.ZOOZA_OWNER_EMAIL,
    }),
  });
  if (!res.ok) throw new Error(`Zooza token request failed: ${res.status}`);
  const body = await res.json(); // { access_token, token_type: "Bearer", expires_in, scope }
  token = { value: body.access_token, expires_at: Date.now() + body.expires_in * 1000 };
  return token.value;
}
```

- A token lasts **one hour** (`expires_in`), and there is no refresh token. Mint a new one when it expires.
- **Cache the token.** Never mint one per request: the token endpoint has its own strict limit, and repeated wrong
  secrets lock the key for a few minutes.
- `401 invalid_client` never says why. Ask the developer to check, in this order:
  1. the `client_id` and secret are right;
  2. the key isn't revoked;
  3. the email belongs to a current owner of the company;
  4. the region's base URL matches the account.

## Step 2: verify the key with `GET /v3/me`

Your first call is always `GET /v3/me`. It is read-only, costs nothing, and returns:

- the key's access groups;
- the company's rate tier;
- the points left this minute and today (the company's budget, shared by all its keys);
- the token's expiry;
- every operation the key may call, with its cost.

Use that list to decide what you can build. Don't call operations that aren't in it.

```bash
curl "$ZOOZA_API_URL/me" -H "Authorization: Bearer $ACCESS_TOKEN"
```

```javascript
const me = await fetch(`${process.env.ZOOZA_API_URL}/me`, {
  headers: { Authorization: `Bearer ${await zoozaToken()}` },
}).then((r) => r.json());
```

A good first data call is `GET /v3/courses`, which lists the company's programmes.

## Step 3: ask before every write

Keys act on the company's **live data**. There is no sandbox.

- **Before you run, or write code that runs, any `POST` or `PUT`, describe the change and get the developer's
  explicit "yes".** This includes test scripts and migrations.
- Prefer reads while you explore. Show the developer what a write would send before sending it.
- Never loop writes over many records without a dry run the developer has reviewed.

## Pitfalls

- Lists don't share one shape. Most return `{total, page, page_size, settings, data}` with a zero-based `page`;
  `GET /v3/courses` returns a plain array, and `GET /v3/registrations` returns
  `{total, total_capped, page, offset, results}`. Check the "Lists and pagination" section of the OpenAPI document
  before writing a pagination helper.
- Always send `advanced_search=1` on `GET /v3/registrations`. Without it you get a `422`.
- Dates and times are in the region's local time (EU `Europe/Bratislava`, UK `Europe/London`, ASIA `Asia/Dubai`).
- Error messages come in the company's language. Branch on error codes, never on message text.
- In the API, programmes are `courses`, classes are `schedules`, sessions are `events` and venues are `places`.

## Rate limits and errors

- Each operation costs points from the company's budget (per minute and per day), which all its keys share. Each
  operation's access groups and cost are in the OpenAPI document (`x-zooza-access` on each operation, e.g.
  `{"groups": ["core_read"], "cost": 2}`) and in `GET /v3/me`. The rate tiers are in `x-zooza-tiers`.
- Every response carries `X-RateLimit-Remaining` and `X-RateLimit-Remaining-Day`, counted in points.
- On `429`, wait the number of seconds in `Retry-After`, then retry once. Never retry in a tight loop.
- On `422`, the body lists every validation problem, with `location`, `path`, `code` and `message`. Fix all of them
  before you retry.
- On `400`, the body is `{"errors": [...], "request_valid": false}`. Each entry maps a four-digit error code to a message in the company's language. Look codes up at
  https://docs.zooza.online/api/error-codes and branch on the code, never on the message.
- On `403`, the operation is outside the key's access groups. Tell the developer, and don't retry.

## Where everything is

- **API reference**, every operation, grouped by resource: https://docs.zooza.online/api/reference
- **OpenAPI document**, machine-readable, one per region:
  - EU: https://api.zooza.app/v3/openapi.json
  - UK: https://uk.api.zooza.app/v3/openapi.json
  - ASIA: https://asia.api.zooza.app/v3/openapi.json

  Check field names against it before relying on them.
- **Guide pages:**
  - [Getting started](https://docs.zooza.online/api/getting-started/)
  - [Authentication](https://docs.zooza.online/api/authentication/)
  - [Access and rate limits](https://docs.zooza.online/api/access-and-rate-limits/)
  - [Errors](https://docs.zooza.online/api/errors/)
  - [Error codes](https://docs.zooza.online/api/error-codes/)
  - [Keys and security](https://docs.zooza.online/api/keys/)
- **Widgets** (booking forms, calendars, the client portal), embedded on the website with a widget key, not an API
  key: https://docs.zooza.online/widgets/
- **Zooza terminology** (programme, class, session, registration, …): https://docs.zooza.online/concepts/
- **Everything in one file:** https://docs.zooza.online/llms-full.txt
