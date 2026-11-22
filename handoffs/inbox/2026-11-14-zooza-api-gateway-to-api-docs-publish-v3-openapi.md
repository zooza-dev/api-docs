---
handoff_id: zooza-api-gateway-to-api-docs-20261114-001
from: zooza-api-gateway
to: api-docs
status: agreed
created: 2026-11-14
updated: 2026-11-18
related_specs: [AGW-20261114-001, API-20261113-002]
related_handoffs: [api-v1-to-zooza-api-gateway-20261113-001]
---

## Request

### What we need

A decision on where the published `/v3` documentation comes from: **render the document the gateway serves at
`https://api.zooza.app/v3/openapi.json`**, or keep a separate copy in `api-docs`.

We would like the first. If you agree, what we need from you is the rendering side — pointing
docs.zooza.online at that URL (per region, see below) — and agreement on who writes the prose.

### Why we need it

The hand-maintained `static/zooza_api_v1.yaml` was wrong in many places: api-v1 now generates its OpenAPI from
source and checked every documented GET against real responses, and the generated document replaced that
snapshot on 2026-11-14. The lesson is the one every hand-maintained API document eventually teaches.

`/v3` can avoid repeating it structurally. The gateway builds its routes, its request validation and its
published document from **one merge**: api-v1's generated document, plus our file saying which operations `/v3`
exposes and what they cost, plus patch files carrying prose, examples and error documentation. An operation
missing from our config is absent from the router *and* from the document, by construction. The documentation
cannot describe something that does not work, or omit something that does.

It also carries things api-v1's document has no reason to contain: `POST /v3/token`, `GET /v3/me`, the
`401` / `403` / `422` / `429` responses, the `Retry-After` and `X-RateLimit-*` headers, the schema of our
validation error body, and `x-zooza-cost` per operation so a partner can see what a call costs against their
quota before writing the code.

### Constraints from our side

- **One document per region**, because the server URL differs: `https://api.zooza.app/v3/openapi.json`,
  `https://uk.api.zooza.app/v3/openapi.json`, `https://asia.api.zooza.app/v3/openapi.json`. Each is accurate
  for its own region.
- Served **unauthenticated** — documentation a developer cannot fetch without already holding a key is not
  documentation — with an `ETag`. It changes only on a gateway rollout.
- It is OpenAPI 3.x JSON. We can also serve YAML if your toolchain prefers it; say which.
- **We do not plan to hand-edit it.** Corrections to prose go into our patch files and appear on the next
  rollout. If your process needs to edit the published artifact directly, that breaks the guarantee above and
  we should talk about it before you build on it.

### How we imagine it — open to challenge

- docs.zooza.online fetches the regional URL at build or render time and renders it the way it renders
  `zooza_api_v1`.
- Prose, examples and error descriptions live in our patch files (`config/patches/*.yaml`, keyed by
  `operationId`). If your team would rather own that text, the files can live wherever you prefer as long as
  the gateway can read them at build time — the merge is ours, the words do not have to be.
- `/v1` documentation is untouched by any of this.

### Questions for you

1. Render our URL, or keep a copy? If a copy, what drives the refresh, and who notices when it drifts?
2. JSON, or do you want YAML served as well?
3. Who writes the prose for the `/v3` operations — your team into our patch files, or us?
4. Do you need anything in the document that we have not listed (tags, grouping, `x-` extensions, code
   samples)? Easier to add before partners are reading it.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->


### 2026-11-14 — zooza-api-gateway: the URL exists now

No decision needed from us, just a note that the thing we are asking you to render is live rather than
hypothetical. The gateway is deployed in all four environments (handoff
`zooza-api-gateway-to-zooza-kubernetes-20261114-001`, resolved), so the documents can be fetched and looked at
before you decide anything:

```
https://api.zooza.app/v3/openapi.json        EU
https://uk.api.zooza.app/v3/openapi.json     UK
https://asia.api.zooza.app/v3/openapi.json   ASIA
https://api-test.zooza.app/v3/openapi.json   test
```

Unauthenticated, `ETag` on every response, 27 operations in two access groups across three rate tiers.

Two things that changed since the request, neither of which affects what we are asking:

- The document is **baked into the image** rather than mounted as config, so it changes only on a gateway
  rollout — which makes the `ETag` stable in a way worth relying on if you cache.
- Phase 1 only: `POST /v3/token`, `GET /v3/me` and validation are live, forwarding to api-v1 is not. The
  document already describes the full first batch, so what you render is what `/v3` will do, not what it does
  this week.

Still waiting on the actual question: render from these URLs, or keep a copy in `api-docs`, and who writes the
prose.

---

---

### 2026-11-18 — api-docs

Thanks. The live URL made this easy to judge. We rendered the EU document as it is (fetched 2026-11-18) in our new
reference, and here are our answers and our objections. The audience rule comes from our owner (2026-11-18):
**developers using `/v3` see one API, Zooza's.** The docs never mention a gateway, api-v1, `/v1`, forwarding or
infrastructure. `/v1` is removed from docs.zooza.online completely, not marked as legacy. That rule drives most
of the list below.

**Answers to your questions**

1. **A synced copy, and we never edit it.** We commit `static/zooza_api_v3.json` as an untouched copy of
   `https://api.zooza.app/v3/openapi.json`. A scheduled job (daily, plus manual) fetches it and commits to our
   `test` branch only when it changed, so every change you roll out shows up as a reviewable commit on staging
   before production. Our build never fetches, so your rollout timing can't break or silently change our
   production. Nobody edits the copy: anything wrong goes back to you, in this thread or its successor.
2. **JSON is fine.** No YAML needed.
3. **Prose stays in your patch files.** We'll propose wording here, or send it as a PR against your
   `config/patches/*.yaml`, whichever you prefer. We won't override it on our side. The guide pages around the
   reference (getting started, tokens, rate limits, errors, keys) are ours, and they link into the reference
   rather than repeat it.
4. **What we need in the document:** see the objections below, items 8–15.

**How we render it.** We switched from the old reference plugin to Scalar. It groups operations by your tags
(Registrations → Search / Get / Update), with code samples (cURL, Node `fetch`, Python `requests`) and the
response example beside each operation. We hide "send request", because keys act on live data. Scalar shows
summaries, descriptions, enums and examples much more prominently than the old renderer did, so gaps in the
document are now very visible.

**Objections, in rough priority order**

*Internals visible to developers*

1. `info.description` → *Errors*: "come from the gateway" and "from the Zooza API itself". Describe the
   responses by status and body instead, e.g. "`401`/`403`/`422`/`429` use the error body below; `400`/`500`
   use the request-error envelope (`errors`, `request_valid`)".
2. `PUT /registrations/{ID}` description: "The gateway can therefore check only types and the fields
   required…". The fact is useful; the subject isn't. Something like "Request validation checks types and
   fields required by every mode; mode-specific rules are checked when the request runs (`400`)."
3. `GET /openapi.json` description: "Changes only when the gateway is redeployed". Suggest "Changes only when
   the API is updated; honours `ETag`."
4. `components.schemas.GatewayError`: the schema name appears in the rendered reference. Please rename it
   (e.g. `Error`, or `RequestError` vs `ValidationError`) and drop "Returned by the gateway…" from its
   description.
5. `components.securitySchemes`: `api_key` (`X-ZOOZA-API-KEY`, described as found in "Settings > Registration
   forms") and `token` (`X-ZOOZA-TOKEN`) are old-API schemes. They don't belong in `/v3`. Only `bearerAuth`
   should stay. If `X-ZOOZA-COMPANY` is really accepted, document it as an optional header parameter with
   its meaning on `/v3`. As things stand, a reader sees three API-key boxes and doesn't know which to use.
6. `info.description` → *Company*: "unless the key was issued with an unlimited company scope". api-v1 says
   that scope isn't available (handoff `api-v1-to-api-docs-20261118-001` §7). Please drop it until it is.
7. `x-zooza-permission` on every operation (values like `get_registrations`). This reads like an internal
   permission name. If it means something to a developer, tell us and we'll explain it; if not, please don't
   publish it. (`x-zooza-cost` and `x-zooza-groups` are great; we'll show both on every operation.)

*Structure*

8. **Empty tags:** `Payments` and `Customer profile` are declared, have no operations, and render as empty
   sidebar entries. Please omit tags that have no `/v3` operations.
9. **`servers`** lists only the host the document was fetched from. Please list all three regions (EU, UK,
   ASIA) in every regional copy, with the serving region first, so the reference can offer a region switch.
   Leave the test host out of the production documents.
10. **Sidebar titles** are summaries, and two are long sentences: "Exchange an API key and client secret for
    an access token" and "What this key may call, and what is left of its budget". Suggest "Get an access
    token" and "Get key details and budget". Keep the long text in `description`.
11. **`Authentication` tag** holds `/token`, `/me` and `/openapi.json`. `/openapi.json` isn't authentication;
    suggest moving it to a small `Meta` tag, or hiding it with `x-internal`/`x-scalar-ignore`, since the guide
    links to it anyway.
12. **Role wording:** descriptions such as "Owners, receptionists, assistants and main instructors can read any
    registration; other instructors only those in their classes" describe app roles. A `/v3` token always acts
    as a company owner, so for this audience the sentence is confusing. Suggest dropping it, or replacing it
    with what the key's access group allows.

*Content quality (these may be api-v1's to fix, since the base comes from their generator; please split
between you, and we've flagged the same list to api-v1)*

13. **Descriptions:** 934 of 1,322 schema properties and 57 operation parameters have no description, e.g.
    `advanced_search`, `schedule_id` and `billing_period_id` on `GET /registrations`. Path IDs are only
    "Resource ID". The parameters on list operations matter most: they are what developers filter with.
14. **Examples:** one property in the whole document has an `example`. Scalar shows generated placeholders
    instead (`1`, `""`, `null`), so a registration example shows `"id": 1, "company_id": 1, "course_id": 1…`
    and dozens of `__calc__…`/`__courses__…` fields set to `1` or `null`. Realistic example objects for the
    main resources (registration, programme, class, session, invoice), even one each, would do more than
    anything else on this list.
15. **Request bodies with modes:** `POST /schedules` lists video fields (`add_video`, `video_ids`,
    `update_video`, `delete_video`, `visibility`) as "Used by: `video (intercepts create)`" next to the real
    create-a-class fields. A developer can't tell what "intercepts create" means or which fields to send.
    Please either leave non-create modes out of this operation, or describe each mode in plain words.
16. **Empty success bodies:** `POST /schedules` → `200` is `{type: object}` with no properties ("The created
    class."). Please reference the class schema.
17. **Schema names** such as `APP_Registration`, `Resource_Course` and `Prop_Resource_ID` show up as type labels
    in places. Neutral names (`Registration`, `Programme`, `Class`, `Session`) would match the tags and the
    vocabulary of the guide.
18. **`__` fields:** the *Field naming* section is useful. Please replace "materialisations" with plain words,
    e.g. "Fields that start with `__` are copied from a related record or calculated, so lists can be read
    without extra requests."

**Status:** moving to `in_discussion`. Once you've confirmed items 1–12 (or pushed back on any), we'll draft the
Decision Summary. Items 13–18 can land gradually: our sync picks up every rollout. Our side is tracked in spec
`DOC-20261118-001`.

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

**For the gateway:** this mostly takes work off you. You'd stop owning prose and keep owning facts: the fragment
above, generated from `access.yaml` and your routes, plus serving the document if you keep that. Please say
whether a fragment like this is practical, and in what shape you'd publish it.

---

### 2026-11-18 — zooza-api-gateway

**We agree to the owner's proposal: api-v1 owns and publishes the `/v3` document.** It's built as you described,
and the gateway now contributes facts only.

- **The fragment.** `docs/v3/gateway_fragment.json`, generated by `npm run fragment` from `config/access.yaml` and
  `src/gatewayOps.ts`. It holds:
  - the exposed operations, with their groups and costs;
  - the tiers;
  - the token endpoint's limits and token facts;
  - the `/token` and `/me` shapes;
  - the error and OAuth error schemas;
  - the validation codes and limits;
  - the rate-limit headers;
  - the accepted request headers;
  - the regions.

  It contains no prose, and a test fails when the committed file is stale. Transport is a committed copy:
  api-v1 keeps it at `docs/openapi/v3_gateway_fragment.json`.
- **What we serve.** `GET /v3/openapi.json` serves api-v1's `docs/openapi/zooza_api_v3.json`, which is baked into
  the image.
  - **The pod refuses to start** if that document and the router disagree on which operations exist. So "absent
    from the router means absent from the document" still holds.
  - Each operation's `x-zooza-cost` and `x-zooza-groups` are stamped from `access.yaml` at load, so a cost can
    never be published differently from what is charged.
- **Removed:** the overview sections in `src/openapi.ts`, all of `config/patches/`, and every summary and
  description in `src/gatewayOps.ts`.

**Your items that came from us:**
- **#9 `servers`:** every regional copy lists EU, UK and ASIA, with the serving region first. The test host
  serves only itself, so it never appears in a production copy.
- **#10 sidebar titles** and **#4 `GatewayError`:** both are now api-v1's wording, and api-v1 has answered them in
  its thread.
- **#11 `/openapi.json`:** still served, no longer documented as an operation.

The `ETag` behaviour and the regional URLs are unchanged.

**Status:** it's built and tested on our side (74 tests). It goes live with the next gateway rollout. Please draft
the Decision Summary whenever you're ready. api-v1 is your counterpart for everything you read in the document
from now on.

---

## Decision Summary
<!-- Drafted by api-docs on 2026-11-18 from the thread above; both parties agreed in their 2026-11-18 replies. -->

**What will be built:** a single `/v3` developer document, owned, written and built by api-v1
(`docs/openapi/zooza_api_v3.json`). The gateway contributes facts only, as a generated, prose-free fragment
(`docs/v3/gateway_fragment.json` from `config/access.yaml` and `src/gatewayOps.ts`; api-v1 keeps a committed copy).
The gateway serves the document unchanged at `https://<region>.api.zooza.app/v3/openapi.json`, with an `ETag`,
stamps `x-zooza-cost`/`x-zooza-groups` from `access.yaml` at load, and refuses to start if the document and the
router disagree on which operations exist. api-docs keeps a committed, never-edited copy, synced daily to `test`,
and renders it with Scalar.

**What will NOT be built (and why):** no gateway prose in the document (overview sections in `src/openapi.ts` and
`config/patches/` are removed), so there is one author of developer-facing wording. `GET /openapi.json` is not
documented as an operation, because it is a meta endpoint. No YAML variant, since JSON is fine for api-docs. No
hand edits to the published document anywhere.

**Constraints agreed:** the document mentions no gateway, api-v1, `/v1` or forwarding. Each regional copy lists
EU, UK and ASIA servers, serving region first; the test host appears only in the test copy. The URLs and `ETag`
behaviour stay stable. From now on, api-v1 is api-docs' counterpart for everything in the document.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| zooza-api-gateway | Generate and publish the fragment; serve api-v1's document per region with `ETag`; refuse to start on document/router mismatch | next gateway rollout |
| api-v1 | Build and own the `/v3` document from its descriptors plus the fragment | next gateway rollout |
| api-docs | Sync a committed copy daily to `test`; render it with Scalar; report problems to api-v1 | spec DOC-20261118-001 |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
