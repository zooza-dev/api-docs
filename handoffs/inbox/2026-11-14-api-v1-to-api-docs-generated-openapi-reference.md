---
handoff_id: api-v1-to-api-docs-20261114-001
from: api-v1
to: api-docs
status: agreed
created: 2026-11-14
updated: 2026-11-18
related_specs: [API-20261113-002]
---

## Request

### What we need

The published API reference at https://docs.zooza.online/api/reference/ should be built from the OpenAPI document
that **api-v1 now generates from its own code**, instead of the hand-maintained `static/zooza_api_v1.yaml`. After this
work:

1. The reference shows exactly the generated document: the same endpoints, request bodies, responses and descriptions.
2. A new version from api-v1 can reach the published reference without anyone re-typing or hand-editing it.
3. `static/zooza_api_v1.yaml` is retired, so nobody edits a copy that would drift from the code again.

### Why we need it

The YAML was last changed on 2026-02-19 and had drifted far from the API: lists documented as plain arrays that are
really paginated objects, roughly 300 response fields missing, wrong types (`company_id` as a string), wrong field
and enum names (`/extra-fields` instead of `/extra_fields`, `order_type: order` instead of `product`), a request body
(`POST /events`) in a shape the API ignores, and 75 Redocly lint errors.

api-v1 replaced it with a generator (spec API-20261113-002):

- the route list and required permissions come from the API's route table;
- response schemas come from the code's field declarations;
- descriptions live in per-endpoint descriptors next to the code;
- tests fail when a documented route disappears, when the committed file is stale, or when a real API response
  stops matching the document.

The same document feeds the new `/v3` gateway (`zooza-api-gateway`), so the public reference and the gateway should
describe the same thing.

### Constraints from our side

- **Source of truth:** `docs/openapi/zooza_api_v1.json` in the api-v1 repo (private, `zooza-dev/api-v1`). It is
  generated (`php bin/openapi.php`) and must never be edited by hand, in api-v1 or in a copy.
- **Format: JSON, OpenAPI 3.0.** We checked that your `docusaurus-plugin-openapi-docs` loads specs through Redocly's
  bundler, which reads JSON as well as YAML. It passes `redocly lint` with 0 errors; the 1 warning is a missing
  `info.license`.
- **Content changes the reference will show:**
  - **Documentation groups (tags):** Authentication, Agreements, Customer profile, Sessions, Extra fields, Attendance,
    Calendar, Registrations, Programmes, Classes, Payments, Invoices, Company, Users. The old YAML had none.
  - **Customer profile** is the `/user/...` endpoints (a `/me`-style API that needs a widget key). It is its own group
    on purpose; you may want to present it as a separate section.
  - **Removed:** `POST /mass_emails`, a legacy endpoint being decommissioned (owner, 2026-11-14).
  - **Added:** `PUT /events` (bulk session update).
  - **Changed:** `/extra-fields` is now `/extra_fields`.
  - **Generated `operationId`s** (e.g. `get_registrations_id`). Your generated page names may change because of
    them, so expect URL changes in `docs/api/reference/`.
- `api/integration/openapi.yaml` (the `/integration/v1` design) is **not** affected. It is a future v4 design and stays
  yours.
- api-v1 regenerates the file on every change to the descriptors or the API's field declarations, so updates will come
  more often than the old YAML did.

### How we imagine it — open to challenge

- api-docs takes a copy of `docs/openapi/zooza_api_v1.json` into `static/` (e.g. `static/zooza_api_v1.json`) and points
  `specPath` (`docusaurus.config.js`, currently `static/zooza_api_v1.yaml`) at it. `static/zooza_api_v1.yaml` is deleted.
- **Getting new versions across**, options we see:
  - **(a)** api-v1 opens the update in api-docs when it changes the document, e.g. a small PR or commit of the copied
    file to `test`.
  - **(b)** an api-docs workflow fetches the file from api-v1 at build time. This needs read access to the private
    api-v1 repo.
  - **(c)** api-v1 publishes the file at a stable URL that you fetch.

  We lean towards (a): simple, reviewable, and no cross-repo credentials. Your call.
- If you add hand-written pages around the reference (guides, authentication), they should link into the reference
  rather than restate field lists, so they can't drift either.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

---

### 2026-11-18 — api-docs

Thanks for the detailed request, and for doing the work that makes it possible. We agree with the outcome. We're
proposing a different route to it, because our owner decided something since you wrote this.

**What changed (owner, 2026-11-18):** docs.zooza.online documents **only `/v3`**. `/v1` is removed from the docs
entirely: no legacy section, no mention. Developers never see a gateway, api-v1 or forwarding. Your constraints
still hold: your JSON is the source of truth, nobody edits it by hand, `api/integration` was ours (we've now
deleted that draft), and updates will be frequent.

**Our proposed approach**

- We **don't take a copy of `docs/openapi/zooza_api_v1.json`**, and we don't need option (a), (b) or (c). The
  published reference renders the gateway's `/v3/openapi.json`, which is built from your document. Your
  generated descriptions, schemas and tags reach the reference through it, unedited. The sync is agreed in the
  gateway's handoff `zooza-api-gateway-to-api-docs-20261114-001`: a committed copy, refreshed daily to our `test`
  branch.
- `static/zooza_api_v1.yaml` is deleted, along with all pages generated from it. Old reference URLs redirect to
  the new reference.
- So your three outcomes are met through `/v3`: (1) the reference shows the generated document, as merged for
  `/v3`; (2) new versions arrive with no re-typing, once the gateway rolls them out; (3) the hand-maintained YAML
  is gone.
- The renamed operations and generated `operationId`s are fine for us: Scalar (our new renderer) builds anchors
  from them.

**What we need from you: content.** We rendered the live `/v3` document, and most of what reads badly comes from
the generated base, so it's yours rather than the gateway's. The full list is in the gateway thread (items
13–18); in short:

1. **Descriptions:** 934 of 1,322 schema properties and 57 operation parameters have none. The list-operation
   filters matter most (`advanced_search`, `schedule_id`, `billing_period_id` and the rest on
   `GET /registrations`). Path IDs only say "Resource ID".
2. **Examples:** one property in the whole document has an `example`. Generated placeholders make a
   registration look like `"id": 1, "company_id": 1, …` with dozens of `__calc__…` fields set to `1`/`null`. One
   realistic example per main resource (registration, programme, class, session, invoice) would help most.
3. **Request-body modes:** `POST /schedules` mixes video-mode fields, "Used by: `video (intercepts create)`", into
   the create-a-class body. Please leave out modes that aren't the operation's own, or describe each in plain
   words.
4. **Empty success bodies:** `POST /schedules` → `200` is `{type: object}` ("The created class."). Please
   reference the class schema.
5. **Schema names:** `APP_Registration`, `Resource_Course` and `Prop_Resource_ID` appear as type labels. Please
   use names that match the tags (`Registration`, `Programme`, `Class`).
6. **Role wording:** "Owners, receptionists, assistants and main instructors can read…" describes app roles. A
   `/v3` token always acts as an owner, so this needs to be filtered out or reworded for `/v3`. That may belong
   in the gateway's patches; please agree it between you.
7. **"Materialisations"** in the field-naming text: please use plain words, e.g. "copied from a related record or
   calculated".

These can land gradually: every gateway rollout reaches our staging through the sync.

**Status:** moving to `in_discussion`. If you're fine with not sending us a copy, we'll draft a Decision Summary
recording that the `/v3` reference replaces this request, and resolve this handoff once the new reference is live.
Our side is tracked in spec `DOC-20261118-001`.

---

### 2026-11-18 — api-docs: proposal on who owns the published document

**Proposal from the owner (2026-11-18): api-v1 owns and publishes the `/v3` developer document.** This is posted
in both threads, `zooza-api-gateway-to-api-docs-20261114-001` and `api-v1-to-api-docs-20261114-001`, with the same
wording.

**Why.** Today the published `/v3/openapi.json` is assembled by the gateway. We diffed it against api-v1's
`docs/openapi/zooza_api_v1.json` (2026-11-18). The 27 shared operations, all 34 schemas, the tags and the
field-naming text are api-v1's, copied unchanged. The gateway adds:

- the `/token`, `/me` and `/openapi.json` operations;
- the `401`/`403`/`422`/`429` responses on every operation;
- `x-zooza-cost` and `x-zooza-groups`;
- `GatewayError` and `bearerAuth`;
- four overview sections;
- 3 patched descriptions;
- the choice of which 27 of api-v1's 34 operations are exposed.

That means two teams edit one document, and the docs team has to work out whose each problem is. The owner wants
one owner of the developer docs and one counterpart for us: **api-v1**.

**What we propose:**

1. **api-v1 generates and publishes the single `/v3` document.** It owns all developer-facing wording, including
   the overview and the descriptions of authentication, rate limits and errors. That wording follows the audience
   rule: one API, with no gateway, api-v1, `/v1` or forwarding mentioned.
2. **The gateway's facts come in as data, not prose.** The gateway implements tokens, `/me`, access groups,
   validation (`422`), rate limits and costs, so those facts must be generated from its code, or they'll drift
   the way the old YAML did. Our suggestion: the gateway keeps a small machine-readable fragment in its repo,
   holding
   - the `/token` and `/me` operations;
   - the error and validation schemas;
   - the rate-limit headers;
   - the exposed operations with their `x-zooza-cost` and `x-zooza-groups`, from `config/access.yaml`.

   api-v1's generator pulls the fragment in at build time. The guarantee "absent from the router means absent
   from the document" still holds, because the list of exposed operations still comes from the gateway's
   config. How the fragment moves between the repos (a committed copy, a package, or a fetch at build) is for
   the two of you to agree.
3. **The gateway's hand-written prose about itself goes away:** the overview sections in `src/openapi.ts` and
   the description patches in `config/patches/*.yaml`. Their facts arrive through the fragment, and api-v1
   writes the wording.
4. **`GET /openapi.json` is not documented as an operation.** It's a meta endpoint, not part of an integration.
   The guide mentions its URL once. This replaces our earlier objection #11 (moving it to a `Meta` tag). The
   endpoint can stay; it just isn't in the reference.
5. **Where it's served doesn't matter to us.** Our sync needs one stable public URL per region, with an `ETag`.
   `https://<region>.api.zooza.app/v3/openapi.json` is fine whoever builds the file.

**Effect on the objections already in these threads.** With this split, all of them land with api-v1, except the
ones that come from the gateway's fragment:

- the `/token` and `/me` summaries (#10);
- the `GatewayError` name (#4), which the gateway can rename in its fragment;
- `servers` per region (#9), if the gateway sets them.

The blocking set for release stays the same: #1–#7 (internal wording, the old `api_key`/`token`/`company`
security schemes, "unlimited company scope", `x-zooza-permission`), plus the empty `Payments` and
`Customer profile` tags.

**For api-v1:** this makes you the single owner of the `/v3` developer document and our only counterpart for
reference content. It changes our earlier reply in this thread in one way: we sync from wherever you publish the
`/v3` document, not from a gateway-built file. Please confirm you're willing to take this on, and agree with the
gateway (in their thread or a new handoff between you) how its fragment reaches your generator.

---

### 2026-11-18 — api-v1

**Yes, we'll take it on.** api-v1 now builds and owns the single `/v3` document, `docs/openapi/zooza_api_v3.json`.
It's built from our descriptors, the gateway's fragment (facts as data, no prose) and our own text for the
overview, authentication, rate limits and errors. The gateway serves it unchanged at
`https://<region>.api.zooza.app/v3/openapi.json`, and refuses to start if it and the router disagree. So you sync
from the same URLs as before. How the fragment travels is agreed in the gateway's thread: a committed copy.
`/v1`'s document is unchanged and is no longer your concern.

**Objections #1–#11 (and #12, see below) are fixed in the document as built:**

| # | What changed |
|---|---|
| 1 | *Errors* section by status and body: `401`/`403`/`404`/`422`/`429`/`503`/`504` use `Error`, `400` uses `RequestError`, `500` either, `POST /v3/token` OAuth bodies |
| 2 | The `PUT /registrations/{ID}` and `PUT /events/{ID}` notes now read "Request validation checks types and the fields every operation requires; the fields a particular `action` needs are checked when the request runs (`400`)" |
| 3, 11 | `GET /openapi.json` is not documented as an operation; the guide links its URL |
| 4 | `GatewayError` → `Error`; our request-error envelope (formerly `Error`) → `RequestError`. Neither description mentions who answers |
| 5 | Only `bearerAuth`. `api_key`, `token` and `company` are gone. `X-ZOOZA-COMPANY` isn't documented: it isn't needed (see the guide thread) |
| 6 | "unlimited company scope" removed |
| 7 | `x-zooza-permission` removed from `/v3` (it's an internal permission name) |
| 8 | Tags without a `/v3` operation (`Payments`, `Customer profile`) are omitted |
| 9 | `servers`: EU, UK and ASIA, serving region first; the test host only in the test copy |
| 10 | "Get an access token" / "Get key details and budget"; the long text moved to `description` |

A test (`tests/OpenApiV3DocumentTest.php`) fails if internals reappear. It checks for the words gateway,
`api-v1`, `/v1`, forward, the old headers and "unlimited", and also for empty tags, any security scheme other
than bearer, unresolved references and orphan models.

**Fixed along the way, which you'd have found:**
- `POST /token` didn't document `email` (it's required) or the form-encoded body. It does now, with the OAuth
  error schema.
- The rate-limit headers are documented on every success and on `429` (with `Retry-After`).
- `503` and `504` are documented, with "no points were charged".
- Schemas no `/v3` operation uses (payments, widgets, …) were listed as models. They're pruned now.

**Content (#12–#18)** is our next round, starting now: role wording, descriptions for properties and parameters
(list filters first), realistic examples for the main resources, the request-body modes of `POST /schedules`,
the empty `200` bodies, schema names, and the `__` field wording. Because it lands through the same build, you'll
see it in your daily sync as it arrives.

**Status:** it's built and tested on our side and goes live with the next gateway rollout. Please draft the
Decision Summary.

---

## Decision Summary
<!-- Drafted by api-docs on 2026-11-18 from the thread above; both parties agreed in their 2026-11-18 replies. -->

**What will be built:** api-v1 builds and owns the single `/v3` developer document
(`docs/openapi/zooza_api_v3.json`) from its descriptors, the gateway's fact fragment and its own overview text.
The gateway serves it at `https://<region>.api.zooza.app/v3/openapi.json`. api-docs renders a committed,
never-edited copy, synced daily to `test`. This meets the request's three outcomes through `/v3`: the reference
shows the generated document, new versions arrive without re-typing, and `static/zooza_api_v1.yaml` is retired.

**What will NOT be built (and why):** api-docs does not take a copy of `docs/openapi/zooza_api_v1.json` (options
a/b/c are not needed), because docs.zooza.online documents only `/v3` (owner, 2026-11-18). No `/v1` reference or
legacy section. No hand edits to the document on either side.

**Constraints agreed:** the document mentions no gateway, api-v1, `/v1`, forwarding, old headers or unavailable
scopes. api-v1's `tests/OpenApiV3DocumentTest.php` enforces this, along with no empty tags, bearer-only security,
resolved references and no orphan models. Objections #1–#11 are fixed in the document as built. Content work
(#12–#18: role wording, property and parameter descriptions, realistic examples, `POST /schedules` modes and
response, schema names, `__` field wording) follows in rounds and reaches api-docs through the sync. api-docs
reports further problems in a new handoff to api-v1, not by editing the copy.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-v1 | Own and build the `/v3` document; fix #1–#11 (done); content rounds #12–#18 | live with next gateway rollout; content ongoing |
| api-docs | Retire `static/zooza_api_v1.yaml` and its pages; render the `/v3` document with Scalar; sync daily to `test`; redirect old reference URLs | spec DOC-20261118-001 |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
