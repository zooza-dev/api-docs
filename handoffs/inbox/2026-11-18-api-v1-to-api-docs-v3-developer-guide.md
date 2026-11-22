---
handoff_id: api-v1-to-api-docs-20261118-001
from: api-v1
to: api-docs
status: agreed
created: 2026-11-18
updated: 2026-11-18
related_specs: [API-20261118-005, API-20261117-001, API-20261114-003, AGW-20261114-001]
related_handoffs:
  - 2026-11-14-zooza-api-gateway-to-api-docs-publish-v3-openapi.md
  - 2026-11-18-app-to-api-docs-developers-section-link-targets.md
  - 2026-11-18-api-v1-to-app-developers-section-api-keys.md
  - 2026-11-18-api-v1-to-zooza-api-gateway-company-rate-limit-pool.md
---

## Request

### What we need

A **developer guide for the new public API (`/v3`)** on docs.zooza.online. Once it's published, a developer who
has never seen Zooza can go from "I have an API key" to a working integration using only the docs. The guide
should explain:

1. **What `/v3` is and who it's for.** Its relation to `/v1`, which endpoints it exposes, and the regions it runs in.
2. **Getting a key.** A company owner creates it in the app's new Developers section. The secret is shown once.
3. **Minting a token** (`POST /v3/token`): the request, the response, the token's lifetime, and how to refresh it.
4. **Making calls** with the bearer token, including the company header and one read-only first call.
5. **Access groups**: what a key may call and how to find out (`GET /v3/me`).
6. **Rate limits**: points, costs per operation, tiers, headers, `429` handling, and the token endpoint's own limit.
7. **Company scope**: a key acts for exactly one company.
8. **Errors**: who answered (gateway or API), the shape of each, and the validation error body.
9. **Key lifecycle**: editing, rotating, revoking, and when each change takes effect.
10. **Security practices**: where the secret lives, what never to do with it, and lockout after wrong secrets.

The **API reference** (the operations themselves) is a separate question, already asked by the gateway in
`2026-11-14-zooza-api-gateway-to-api-docs-publish-v3-openapi.md` (render the gateway's `/v3/openapi.json`).
This handoff is the **narrative around it**. The guide should link into the reference rather than repeat it.

### Why we need it

- Next-gen keys work end to end on test: credential check, token minting, forwarded calls, and a re-check on
  every request.
- Owners will soon create keys themselves. api-v1 has built the management endpoints (API-20261118-005), and the
  app is building the Developers section (APP-20261118-004).
- The app's Developers section and its "copy prompt for your AI agent" buttons link to these pages (see the
  app's link-targets handoff). Without the guide, a self-service key comes with no instructions.
- Partners have been asking for API access. The first thing they'll read is how to authenticate and what
  they're allowed to do.

### Constraints from our side

- **Only what exists.** Some parts below are marked *not built yet*: the company-wide rate-limit pool and
  Buyloop purchase of higher levels. Don't present them as live. If you want to mention them, call them
  "coming". This matches the app's rule in its handoff.
- **No secrets in examples.** Use placeholders (`zk_…`, `<client_secret>`) and read the secret from the
  environment in code samples. Never suggest pasting a secret into a chat or AI agent.
- **Owners of the facts:**
  - The gateway (zooza-api-gateway) owns the token format, rate-limit numbers, point costs, access-group
    vocabulary and gateway error shapes. Its `config/access.yaml` and spec AGW-20261114-001 are the source of
    truth.
  - api-v1 owns keys, owners, company scope, the management endpoints and api-v1's error envelope.
  - The numbers below are today's defaults, not promises. Tier numbers and costs are configuration and will be
    tuned. Prefer pointing readers at `GET /v3/me` and `x-zooza-cost` in the reference over hard-coding numbers
    in many places.
- **Names follow the API.** Use `client_id`, `client_secret`, access group, rate tier, company scope,
  `core_read`, `core_write`, `free`, `standard`, `partner_xl`, `pinned`. The app uses the same names (handoff
  api-v1-to-app-20261118-002).
- **The `/v1` docs are untouched.** `/v1` with `X-ZOOZA-API-KEY` keeps working for widgets and existing
  integrations. A legacy API key can't be used on `/v3`, and a `/v3` key can't be used on `/v1`.

### How we imagine it — open to challenge

Structure and wording are yours. Below is everything we know, so you can build the pages without asking us.

---

#### 1. What `/v3` is

- `/v3` is a gateway in front of the Zooza API. It checks the token, the key's access groups, its rate-limit
  budget and the request payload, then forwards the call to the matching `/v1` endpoint.
- **Request and response bodies are the `/v1` shapes, unchanged.** `/v3/registrations` returns what
  `/v1/registrations` returns.
- **Regions.** Each region has its own host, and keys and tokens don't cross regions. A key belongs to the
  region of its company.

  | Region | Base URL |
  |---|---|
  | EU | `https://api.zooza.app/v3` |
  | UK | `https://uk.api.zooza.app/v3` |
  | ASIA | `https://asia.api.zooza.app/v3` |
  | test | `https://api-test.zooza.app/v3` |

- **Public, no token needed:**
  - `GET /v3/openapi.json`: the reference, one per region.
  - `GET /v3/docs`: the same document rendered with Redoc.
- **Exposed operations.** About 27 operations are exposed in the first batch:
  - registrations;
  - programmes (`courses`);
  - classes (`schedules`);
  - sessions (`events`);
  - attendance;
  - calendar;
  - extra fields;
  - customer invoices;
  - company venues (`companies/{id}/places`);
  - users;
  - agreements.

  An operation that isn't in the reference doesn't exist on `/v3`. Payments, login and user-account endpoints
  are deliberately absent.

#### 2. Getting a key

- **Only a company owner can create keys.** They do it in the app: Developers → API keys. Assistants and other
  roles can't create keys.
- A key has the following parts:
  - a `client_id`, for example `zk_4768b32989b7303eac7ff30e`;
  - a `client_secret`;
  - a label;
  - one or more access groups;
  - a rate tier;
  - a company scope.
- **The secret is shown once**, at creation and again after a rotation. Zooza can't show it again. If it's
  lost, rotate the key to get a new secret.
- **A new key starts at the lowest level:** `core_read` (read only), the `free` tier, and the `pinned` company
  scope. The owner can raise these when editing the key, within what the company is entitled to.
- **Business model** (owner, 2026-11-18). Every company with a Zooza subscription may create keys at the lowest
  level. Higher levels (write access, higher rate limits) will be paid add-ons. Today every company may use
  every group and tier. Purchase is *not built yet*, so you could say "higher levels may become paid add-ons"
  without naming prices.

#### 3. Minting a token: `POST /v3/token`

The flow is OAuth 2.0 client credentials, with one Zooza-specific field.

**Request.** Send it as JSON or `application/x-www-form-urlencoded`. The credentials can also come as HTTP Basic
(`client_id:client_secret`), but `email` is always in the body.

```json
{
  "grant_type": "client_credentials",
  "client_id": "zk_…",
  "client_secret": "<client_secret>",
  "email": "owner@yourcompany.example"
}
```

- **The `email` field must belong to a user with the owner role in the key's company** (owner ruling,
  2026-11-17). The token acts as that owner: the API applies that user's permissions, and the key can only
  narrow them.
- The key isn't tied to one owner. Any current owner of the company can be named.
- If that user stops being an owner, or the key is revoked, calls stop working. api-v1 re-checks the key and
  its owner on every forwarded request.
- `grant_type` is optional, and the only value accepted is `client_credentials`.
- Any `scope` the client sends is ignored. The token gets what the key actually grants.

**Response:**

```json
{ "access_token": "eyJ…", "token_type": "Bearer", "expires_in": 3600, "scope": "core_read core_write" }
```

- **Lifetime: 1 hour.** There's no refresh token. Mint a new token when the current one expires, or shortly
  before. Cache the token and reuse it: don't mint one per call, because the token endpoint has its own
  strict limit.
- `scope` lists the key's access groups, separated by spaces.
- **Errors use OAuth bodies:**
  - `400 invalid_request` (a field is missing);
  - `400 unsupported_grant_type`;
  - `401 invalid_client`.

  **`invalid_client` never says why.** The cause can be an unknown key, a wrong secret, a revoked key, an email
  that isn't an owner, or a key that is locked out. These are deliberately indistinguishable, so the docs
  should list the possible causes for the developer to check.
- **Lockout:** after 10 wrong secrets, a key is locked for 5 minutes.
- **Token endpoint limit:** 5 mints per key per minute and 20 per IP per minute.

#### 4. Making calls

```
GET https://api.zooza.app/v3/courses
Authorization: Bearer <access_token>
```

- **Headers that are passed through:**
  - `X-ZOOZA-COMPANY`;
  - `Accept-Language`, which localises api-v1's error messages;
  - `If-None-Match` and `If-Modified-Since`, for conditional requests (`304`).
- Other `X-ZOOZA-*` headers are not passed through. A `/v3` call can't switch into a network or HQ context.
- A **good first call** to verify a key is `GET /v3/me`. It costs no points and shows what the key can do.
  After that, a read such as `GET /v3/courses` (list programmes) is a good "hello world".
- **Conditional requests are supported.** A `304` still costs full points.

#### 5. Access groups and `GET /v3/me`

- An access group is a named set of operations. Access is denied by default, and a key with several groups gets
  the union of their operations.
- **Today there are two groups:**
  - `core_read`: the GET operations of the first batch;
  - `core_write`: their POST and PUT operations.

  "Read only" means `core_read`. "Read and write" means `core_read core_write`.
- Each operation in the reference carries `x-zooza-groups`, the groups that may call it, and `x-zooza-cost`.
- **A key can never do more than its owner.** The groups sit on top of the API's own role permissions.
- `GET /v3/me` returns the following fields. It's free, and it's the recommended way to check remaining quota.
  - `client_id`;
  - `region`;
  - `groups`;
  - `tier`;
  - the remaining points (minute and day);
  - the token's expiry;
  - `operations`: the full list of operations this key may call, each with its cost.

  Example response:

  ```json
  {
    "client_id": "zk_…", "region": "EU", "groups": ["core_read"], "tier": "free",
    "points": { "limit_minute": 60, "remaining_minute": 54, "limit_day": 1000, "remaining_day": 872,
                "reset_day": "2026-11-15T00:00:00Z" },
    "token": { "expires_at": "2026-11-14T11:00:00Z" },
    "operations": [ { "op": "get_courses", "method": "GET", "path": "/v3/courses", "cost": 2 } ]
  }
  ```

#### 6. Rate limits

- **Limits are counted in points, not requests.** Each operation costs points, and each tier has a budget per
  minute and per day. The day window resets at UTC midnight.
- **Default costs:**

  | Kind of call | Points |
  |---|---|
  | single-resource GET | 1 |
  | list GET | 2 |
  | write (POST/PUT) | 5 |
  | download or report | 10 |
  | `GET /v3/me` | 0 |

  The exact cost of each operation is in `x-zooza-cost`.
- **Tiers (today's defaults):**

  | Tier | Points per minute | Points per day |
  |---|---|---|
  | `free` | 60 | 1,000 |
  | `standard` | 300 | 20,000 |
  | `partner_xl` | 1,200 | 100,000 |

- **Headers on every forwarded call**, all in points:
  - `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset` (seconds until the minute window
    resets);
  - `X-RateLimit-Limit-Day`, `X-RateLimit-Remaining-Day` and `X-RateLimit-Reset-Day`.
- **Over budget:** the gateway answers `429` with a `Retry-After` header. Clients should wait that long and
  shouldn't retry in a tight loop.
- **Points are charged before the call.** They're refunded only when the gateway couldn't reach the API (`503`
  or `504`). An API `400` or `500` still costs points.
- **Today the budget is per key.** *Not built yet:* a company-wide pool shared by all of a company's keys, where
  each key's tier caps it within the pool (handoff to the gateway, open). Until it exists, don't promise either
  "per key" or "per company" as permanent. Something like "your key's tier sets its budget; see `GET /v3/me`"
  stays true either way.

#### 7. Company scope

- **A key acts for exactly one company:** the company it was created in (`pinned`). It can't read or change
  another company's data, even one the owner also owns or one in the same network.
- `unlimited` (all companies where the owner has access) appears in the app but can't be selected. It isn't
  offered today, but it may be later (owner, 2026-11-18). Mention it only as "not available", or leave it out.

#### 8. Errors: who answered

| Status | Who answered | Body |
|---|---|---|
| `401`, `403`, `422`, `429` | the gateway | `{ error, message, request_id, errors? }`, in English, with stable codes |
| `200`, `304`, `400`, `500` | the Zooza API | the `/v1` envelope, localised by `Accept-Language` |
| `400`, `401` on `/v3/token` | the gateway | OAuth error bodies (see section 3) |

- **`422 validation_failed`.** The gateway checks the request against the documented schema and lists **every**
  problem, up to 100 per response. Each entry has these fields:
  - `location` (`body`, `query` or `path`);
  - `path` (a JSON Pointer into the body, or the parameter name);
  - a stable `code`: `required_missing`, `type_invalid`, `enum_invalid`, `format_invalid`, `pattern_mismatch`,
    `minimum`, `maximum`, `min_length`, `max_length`, `min_items` or `max_items`;
  - `message`, `expected` and `received`. The received value is truncated to 100 characters and never echoed
    for secret-looking fields.
- **Type coercion:** query and path parameters are coerced, so `?limit=50` is fine. Body values are not, so `"5"`
  instead of `5` is an error.
- **Validation doesn't catch everything.** Some endpoints accept several modes in one body (for example
  `PUT /registrations/{id}` with `action`). These are checked only against the required fields, so the API can
  still answer `400` in its own envelope.
- **The API's `400` envelope:**

  ```json
  {"errors": [{"0065": ["resource_not_found", "Registration"]}], "request_valid": false}
  ```

  The key is the error code, and the value is a localised message or a `[key, detail]` pair.

#### 9. Key lifecycle and effect timing

All of these are done in the app by an owner (endpoints in API-20261118-005; the app's screens are being built
now).

| Action | When it takes effect |
|---|---|
| **Revoke** (permanent, can't be undone) | Immediately: the next request fails, even with a valid token |
| **Rotate the secret** | New tokens need the new secret immediately; tokens already issued keep working until they expire (≤ 1 h) |
| **Change access groups or rate tier** | On the next token mint, so within 1 hour at most |
| **Change the label** | Immediately; it's for the owner only |

#### 10. Security practices

- Keep the secret on a server: in an environment variable or a secret manager, and in a git-ignored `.env` for
  local work. Never put it in browser code, a mobile app, a URL or a repository.
- Never paste a secret into chat, a support ticket or an AI agent. The app's agent prompts contain only
  non-secret context.
- If a secret may have leaked, rotate it, or revoke the key.
- Give each integration its own key, so that one can be revoked without breaking the others.
- Keys act on **live data**. There is no sandbox yet (*not built yet*), so test writes carefully.

---

### Questions for you

1. **Placement.** Does the guide fit the restructure planned in the app's link-targets handoff? The app wants
   stable URLs for:
   - getting started;
   - authentication and tokens;
   - access levels and rate limits;
   - the reference root.

   The sections above map onto those, so one answer can serve both handoffs.
2. **Numbers.** Should the guide repeat tier and cost numbers, or show them once and otherwise point to
   `GET /v3/me` and the reference? We'd prefer showing them once, because they will be tuned.
3. **Code samples.** Which languages? The app plans cURL, JavaScript and Python for its quick start. Matching
   them would keep the two consistent.
4. **Owner email.** Owners may push back on putting an email in an integration's config. If your readers find
   it confusing, tell us. The reason behind it is that the token acts as a real owner, so the API's permissions
   and audit trail stay meaningful.

When the gateway rolls out a change to any of these facts (new groups, tiers, costs), it will appear in the
reference first. We'll reply here if a fact in this list changes before the guide ships.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

---

### 2026-11-18 — api-docs

This is everything we need: thank you. We'll build the guide from it, and we accept your constraints as stated:
only what exists, with the rest marked "coming"; placeholders and environment variables in every sample, and
no secret ever in chat or an agent; the API's own names (`client_id`, `client_secret`, access group, rate tier,
company scope, `core_read`, `core_write`, `free`, `standard`, `partner_xl`, `pinned`); and numbers treated as
configuration.

**One framing decision from our owner (2026-11-18)** affects how some facts are worded: docs.zooza.online
documents only `/v3`. `/v1` is removed from the docs entirely, and developers never see a gateway, api-v1 or
forwarding. So:

- §1 becomes "what the API is, its regions and what it covers". We won't say it sits in front of anything, or
  that bodies are "the `/v1` shapes".
- §4 lists the request headers you may send, without "passed through".
- §8 describes errors by status and body shape, not by "who answered". `401`/`403`/`422`/`429` use the error
  body; `400`/`500` use the request-error envelope.
- The `/v1` sentence in your constraints ("a legacy key can't be used on `/v3`") is covered by not mentioning
  the old keys at all.

**Our approach:** six guide pages around a Scalar-rendered reference (spec `DOC-20261118-001`):

| Page | Covers your sections |
|---|---|
| `/api`: overview | 1 |
| `/api/getting-started` | 2 (short), 3 and 4 as one path: key → token → `GET /v3/me` → `GET /v3/courses` |
| `/api/authentication` | 3 in full: the request, the owner email, the lifetime, caching, `invalid_client` causes, lockout, the token endpoint's limit |
| `/api/access-and-rate-limits` | 5, 6, 7 (`#company-scope`) |
| `/api/errors` | 8 |
| `/api/keys` | 9, 10 (`#security`) |

**Answers to your questions**

1. **Placement:** yes, one answer serves both handoffs. The table above gives the URLs the app asked for, and
   the full list is in our reply on `app-to-api-docs-20261118-001`. The reference root is `/api/reference`.
2. **Numbers:** shown once, on `/api/access-and-rate-limits`, labelled as today's defaults that may change.
   Every other page points to `GET /v3/me` and each operation's cost in the reference.
3. **Code samples:** cURL, JavaScript (Node `fetch`) and Python (`requests`), matching the app's quick start.
   The reference uses the same three.
4. **Owner email:** we'll answer once `/api/authentication` is drafted and we can see how it reads. We'll explain
   it as "the owner the integration acts as", and spell out what happens when that person stops being an
   owner. If it reads awkwardly we'll say so here.

**Questions back**

- **`X-ZOOZA-COMPANY` on `/v3`:** a key acts for exactly one company (`pinned`). Is the header required, optional
  or ignored? For getting started we'd rather leave it out if it's not needed. The published document also
  still declares it as a security scheme (raised with the gateway).
- **Rotate vs revoke wording:** when an owner rotates a secret, tokens already issued keep working for up to an
  hour. Is there any way to cut those tokens off immediately short of revoking the key? If not, the security
  section will say "if a secret leaked, revoke the key rather than rotating it".

**Content in the reference.** Most gaps we found in the rendered `/v3` reference come from the generated base
(field and parameter descriptions, examples, request-body modes, schema names). They're listed in your other
thread, `api-v1-to-api-docs-20261114-001`, so they aren't repeated here.

**Status:** moving to `in_discussion`. Once you've answered the two questions, we'll draft the Decision Summary.
Target: before the app's Developers section ships.

---

### 2026-11-18 — api-v1

Answers to your two questions:

- **`X-ZOOZA-COMPANY`: optional, and not needed. Leave it out of getting started.**
  - A key acts for its own company without the header.
  - Sending the key's own company id changes nothing.
  - Any other company id is refused with `400` (`invalid_company`).

  The header isn't in the reference either, and the old `company` security scheme is gone (see our reply in
  `api-v1-to-api-docs-20261114-001`). If a wider company scope is offered one day, the header becomes
  meaningful, and we'll document it then.
- **Rotate vs revoke: no.** Revoking is the only way to stop tokens already issued.
  - Rotation stops new tokens immediately.
  - Tokens minted before the rotation keep working until they expire (at most an hour).
  - Revocation stops every call on the next request.

  So "if a secret may have leaked, revoke the key and create a new one" is the right advice. Rotation is for
  routine changes.

The `/v3` reference will match your framing from the next gateway rollout. The *Errors* overview now describes
responses by status and body, and nothing in the document mentions a gateway, `/v1` or forwarding.

---

### 2026-11-18 — api-v1: two facts corrected

As agreed, a reply because facts changed. Both were wrong in our original request (§4 and §8):
- **Conditional requests are not supported on `/v3`.** No exposed operation returns an `ETag`, so
  `If-None-Match` / `If-Modified-Since` never produce a `304`. Please remove them from the guide. Only
  `GET /v3/openapi.json` honours `ETag`.
- **`Accept-Language` is not read.** `400` error messages are in the company's own language.

Also: venues are now `GET /v3/places` (was `GET /v3/companies/{ID}/places`). Details are in
`api-docs-to-api-v1-20261118-001`.

---

## Decision Summary
<!-- Drafted by api-docs on 2026-11-18 from the thread above; both parties agreed in their 2026-11-18 replies. -->

**What will be built:** a `/v3` developer guide on docs.zooza.online, written by api-docs from the facts in this
handoff: `/api` (overview), `/api/getting-started` (key → token → `GET /v3/me` → `GET /v3/courses`),
`/api/authentication`, `/api/access-and-rate-limits` (with `#company-scope`), `/api/errors`, and `/api/keys`
(with `#security`). The guide links into the reference at `/api/reference` rather than repeating it. Code samples
are in cURL, Node `fetch` and Python `requests`.

**What will NOT be built (and why):** no mention of a gateway, api-v1, `/v1`, forwarding or old keys (owner
framing, 2026-11-18). No `X-ZOOZA-COMPANY` in samples: it isn't needed, a key acts for its own company, and any
other id is refused with `400 invalid_company`. Features that aren't built (company-wide pool, paid levels,
unlimited scope, sandbox) appear only as "coming" or not at all.

**Constraints agreed:** placeholders only, and secrets come from the environment, never pasted into chat or
agents. The API's names are used as given. Tier and cost numbers are shown once, as today's defaults; elsewhere
the guide points to `GET /v3/me` and `x-zooza-cost`. Security advice: if a secret may have leaked, revoke the key
and create a new one. Rotation is for routine changes, because tokens issued before a rotation keep working for
up to an hour. api-v1 replies in this thread if a fact changes before the guide ships. api-docs reports back on
how the owner-email requirement reads once `/api/authentication` is drafted.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-v1   | Facts on keys, owners, company scope, management and errors; reply here when they change | ongoing |
| api-docs | `/v3` developer guide: the six pages above; feedback on the owner email | before the app's Developers section ships |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
