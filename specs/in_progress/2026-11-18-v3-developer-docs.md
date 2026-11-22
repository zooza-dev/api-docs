---
spec_id: DOC-20261118-001
title: "/v3 developer docs — replace the API section"
status: in_progress
created: 2026-11-18
updated: 2026-11-19
author: api-docs
owner: api-docs
last_verified: 2026-11-18
project_type: other
depends_on: []
related_handoffs:
  - 2026-11-18-api-v1-to-api-docs-v3-developer-guide.md
  - 2026-11-14-zooza-api-gateway-to-api-docs-publish-v3-openapi.md
  - 2026-11-14-api-v1-to-api-docs-generated-openapi-reference.md
  - 2026-11-18-app-to-api-docs-developers-section-link-targets.md
  - 2026-11-18-api-docs-to-api-v1-v3-document-gaps.md
  - 2026-11-19-api-v1-to-api-docs-error-code-reference.md
tags: [api, v3, reference, developer-guide, agent-setup]
feature_branch: "feature-v3-developer-docs"
changelog: ""
changelog_version: ""
changelog_date: ""
docs_version: ""
docs_communicated: ""
---

## Goal

Replace the whole API section of docs.zooza.online with documentation for the public Zooza API at `/v3`. A
developer who has never seen Zooza should get from "I have an API key" to a working integration using only these
pages. The current section documents an older REST API (`X-ZOOZA-API-KEY` + `/v1/login` tokens) from a
hand-maintained YAML that has drifted badly from the real API. As far as the docs are concerned, that API never
existed: it is removed, not marked legacy. The reference is rendered from the `/v3` OpenAPI document Zooza
publishes, so it cannot drift again. It is organised by resource (Registrations, Programmes, Classes, Sessions, …),
not as a flat list of operations.

## Scope

**In scope**

- New guide pages: overview, getting started, authentication and tokens, access groups and rate limits (including
  company scope and `GET /v3/me`), errors, key management and security.
- The API reference rendered from the `/v3` document (`/v3/openapi.json`), grouped by tag with each resource's
  GET/POST/PUT operations under it, and code samples in cURL, JavaScript and Python.
- A sync script plus a committed copy of the document; retiring `static/zooza_api_v1.yaml`.
- A hosted Markdown setup file for AI coding agents.
- A committed table of stable URLs for the app's Developers section, with redirects from old URLs.
- Rewriting every other page that describes the old REST API: `quickstart.md`, `concepts.md`, `ai-assistants.md`,
  `make-up-sessions.md`, `examples/index.md`, `examples/filtered-timetable.md`, `examples/custom-catalogue.md`,
  `examples/chatbot-logged-in-client.md`, `src/pages/index.js`, `static/llms.txt`, and `scripts/build-llms-full.js`
  (if it hard-codes the reference).
- A build-time check that fails when developer-facing pages mention internals or the old API.

**Out of scope**

- Widgets. The widget loader (`/widgets/v1/loader.js`), widget keys and the widget pages are a separate product
  surface and stay as they are, apart from links into the API section.
- Editing the `/v3` document's content. Wording fixes go to its owners (see Notes).
- Features that are not built yet: webhooks, sandbox, SDK, a company-wide rate-limit pool, buying higher levels.
  These are mentioned only as "coming", or not at all.
- The Developers section UI in the app.

## Approach

### Audience rule

Developers using `/v3` see one API: Zooza's. Pages never mention a gateway, api-v1, `/v1`, forwarding, upstream
services, infrastructure, or `X-ZOOZA-API-KEY`/`X-ZOOZA-TOKEN`. Errors are described by status and body shape,
not by which internal component produced them. For example, "`401`/`403`/`422`/`429` use the error body below;
`400`/`500` use the request-error envelope" instead of "the gateway answers…".

### Information architecture

```
/api                         Overview: what the API is, regions and base URLs, what it covers, one picture of the flow
/api/getting-started         Key → token → GET /v3/me → GET /v3/courses (cURL / JS / Python)
/api/authentication          POST /v3/token, owner email, 1h lifetime, caching, invalid_client causes, lockout, token limit
/api/access-and-rate-limits  Access groups, GET /v3/me, company scope (#company-scope), points, costs, tiers, headers, 429
/api/errors                  The error body (422 validation list, codes), the request-error envelope, retry guidance
/api/keys                    Creating, editing, rotating, revoking (when each takes effect); security practices (#security)
/api/reference               Reference root: introduction from the document, then one category per tag
/api/reference#tag/<tag>     Scalar anchors, e.g. registrations, programmes, classes: each operation nested under it
/agent-setup.md              Hosted setup file for AI coding agents (static)
```

Sidebar: `API` category → the six guide pages → a `Reference` link to `/api/reference`, where Scalar's own sidebar
lists the resources (not a flat operation list).

Tier numbers and point costs appear **once**, on `/api/access-and-rate-limits`, labelled as today's defaults. Every
other page points to `GET /v3/me` and each operation's cost in the reference.

### Reference pipeline

- `npm run api:sync` fetches `https://api.zooza.app/v3/openapi.json` into `static/zooza_api_v3.json` (committed).
  The file is never hand-edited.
- **Renderer: Scalar** (`@scalar/docusaurus`, owner decision 2026-11-18, after comparing a prototype with the
  current plugin). The reference is one route, `/api/reference`, which renders `static/zooza_api_v3.json`. The
  sidebar groups operations by tag with each GET/POST/PUT nested under its resource. `docusaurus-plugin-openapi-docs`,
  `docusaurus-theme-openapi-docs` and the generated `docs/api/reference/` pages are removed.
- Scalar configuration: test-request button and API client hidden, models section hidden, developer toolbar and
  agent/MCP features off, telemetry off, clients limited to cURL, Node `fetch` and Python `requests`. The plugin
  and its CDN script are pinned to exact versions. Site palette overrides live in `src/css/custom.css`, because the
  plugin's stylesheet hard-codes a white backdrop.
- Trade-off accepted: Scalar renders client-side on one page, so operations aren't separately indexed by
  Algolia/search engines. The guide pages and `llms.txt` carry the searchable text. Deep links use Scalar's
  per-operation anchors.
- Refresh: a scheduled GitHub Action (daily, plus manual dispatch) runs `api:sync`. If the file changed, it commits
  to `test`, so the change appears on staging and goes through the normal production promotion. The build itself
  never fetches, so a network failure can't break or silently change production.
- The regional base URLs (EU/UK/ASIA) appear as server options in the reference (see the request to the document
  owners in Notes). The test host is not shown to developers.
- `x-zooza-cost` and `x-zooza-groups` are shown on each operation page (via Scalar's extension rendering or a
  small plugin; to be worked out).

### Content sources

Facts come from the handoff `api-v1-to-api-docs-20261118-001` (keys, tokens, scope, lifecycle, security, errors)
and from the `/v3` document (operations, costs, groups, error schemas). When the two disagree, the document wins
and the difference is raised in the handoff thread.

### Old URLs

Old reference pages (`/api/reference/get-list-of-courses` etc.) redirect to their new operation pages where an
equivalent exists, and otherwise to `/api/reference`. `/api/authentication` and `/api/errors` keep their paths with
new content. `static/zooza_api_v1.yaml` is deleted and not redirected.

### Internals check

`scripts/check-api-wording.js` runs in `npm run build` before `docusaurus build`. It fails on `gateway`, `api-v1`,
`/v1/` (excluding `/widgets/v1/`), `X-ZOOZA-API-KEY` and `X-ZOOZA-TOKEN` in `docs/` (including the generated
reference), `static/llms.txt` and `static/agent-setup.md`. If the document itself contains a term, the check names
the field, so it can be reported to the owners rather than patched locally.

## Acceptance Criteria

- [ ] `/api/reference` (Scalar) lists resource groups
      (Registrations, Programmes, Classes, Sessions, Attendance, Calendar, Extra fields, Invoices, Company, Users,
      Agreements, Authentication), each listing its GET/POST/PUT operations. No category is empty.
- [ ] The reference renders `static/zooza_api_v3.json` with Scalar, in the site palette in light and dark mode, with no
      test-request button, developer toolbar or AI agent. `static/zooza_api_v1.yaml`, `docs/api/reference/` and the
      openapi-docs plugin no longer exist.
- [ ] `npm run api:sync` updates `static/zooza_api_v3.json` from the published document and leaves it unchanged
      when the document hasn't changed.
- [ ] The scheduled sync workflow commits a changed document to `test` and does nothing when unchanged.
- [ ] Following `/api/getting-started` with a real key on test produces a token, a `GET /v3/me` response and a
      `GET /v3/courses` response, using only what the page says.
- [ ] Every code sample reads the secret from an environment variable. No sample contains a real secret, and no
      page suggests pasting a secret into chat or an AI agent.
- [ ] Tier limits and point costs appear on exactly one page, labelled as defaults that may change.
- [ ] Features that are not built (sandbox, webhooks, SDK, company-wide pool, paid levels, unlimited company scope)
      are absent or marked "coming".
- [ ] `npm run build` fails if any checked file contains the forbidden terms, and passes on the finished branch.
- [ ] No page outside `/widgets/` and the widget examples mentions `/v1`, `X-ZOOZA-API-KEY` or `X-ZOOZA-TOKEN`.
      The rewritten examples call `/v3` with a bearer token.
- [ ] `/agent-setup.md` is served as plain Markdown and covers: what Zooza is, auth via `POST /v3/token` with the
      secret from a git-ignored `.env`, one read-only first call, "ask before any write", and links to the reference
      and widget docs.
- [ ] Each old reference URL redirects to its new page or to `/api/reference`. The existing widget deep links
      (`/widgets/registration-widget/#translations` etc.) still resolve.
- [ ] `static/llms.txt` and `llms-full.txt` describe the `/v3` API only.
- [ ] The stable URL table (Project Context) is sent to the app in its handoff thread.

## Project Context

### Stable URL table (to commit to the app)

| Topic | URL |
|---|---|
| Docs home / build on Zooza | `/` |
| API overview | `/api` |
| Getting started (key → first call) | `/api/getting-started` |
| Authentication and tokens | `/api/authentication` |
| Access levels and rate limits | `/api/access-and-rate-limits` |
| Company scope | `/api/access-and-rate-limits#company-scope` |
| Errors | `/api/errors` |
| Key management / security | `/api/keys`, `/api/keys#security` |
| API reference root | `/api/reference` |
| AI agent setup file | `/agent-setup.md` |
| AI assistants / MCP | `/ai-assistants` |
| Concepts / glossary | `/concepts` |
| Widgets (overview, embed methods, each widget) | unchanged: `/widgets`, `/widgets/embed-methods`, `/widgets/<widget>` |
| Featured examples | unchanged: `/examples/branded-booking-tiles`, `/examples/filtered-timetable`, `/examples/multi-step-trial-booking` |

### Files touched

- `docusaurus.config.js`: Scalar plugin replaces openapi-docs plugin and theme; redirects
- `src/css/custom.css`: Scalar palette overrides
- `sidebars.js`: the API category
- `package.json`: `api:sync`, wording check in `build`
- `scripts/sync-api-spec.js` (new), `scripts/check-api-wording.js` (new), `.github/workflows/sync-api-spec.yml` (new)
- `docs/api/*.md` (rewritten / new), `docs/api/reference/` (deleted)
- `static/zooza_api_v3.json` (new), `static/zooza_api_v1.yaml` (deleted), `static/agent-setup.md` (new),
  `static/llms.txt`
- The pages listed under Scope

## Notes

### Decisions (2026-11-18, owner)

- The reference renderer is Scalar (see Reference pipeline).
- `api/integration/` (an unbuilt 2026-02 partner-API draft) is deleted. `api/integration` and `api/llm` are no longer
  bundled into `static/`. `api/llm` will be rewritten as an **agent tool catalogue**: a curated set of `/v3`
  operations described as named tools for AI agents, which feeds `/agent-setup.md` and `llms.txt`.

- `/v1` is removed from the docs entirely and is never referenced, not even as "legacy".
- No internal wiring is mentioned (gateway, api-v1, forwarding). The audience uses `/v3` and doesn't care how it
  is built.
- The reference is organised by resource collection with operations nested under each, not as a flat list.

### Document ownership (proposed 2026-11-18, owner; awaiting api-v1 and the gateway)

api-v1 owns and publishes the single `/v3` developer document and is our only counterpart for reference content.
The gateway's facts (`/token`, `/me`, error and validation schemas, rate-limit headers, exposed operations with
their cost and groups) reach api-v1's generator as a machine-readable fragment, not as prose. `GET /openapi.json`
is not an operation in the reference. Posted in both `zooza-api-gateway-to-api-docs-20261114-001` and
`api-v1-to-api-docs-20261114-001`. Our sync URL follows wherever the document is published.

### Requests to the `/v3` document owners (to raise in the gateway handoff thread)

The live document (fetched 2026-11-18 from test) contains developer-facing text that breaks the audience rule. These
need fixing in its source, not in our copy:

1. `info.description` → "Errors": "come from the gateway" / "from the Zooza API itself". Describe them by status and
   body instead.
2. `PUT /registrations/{ID}` description: "The gateway can therefore check only…".
3. `GET /openapi.json` description: "Changes only when the gateway is redeployed".
4. `components.schemas.GatewayError`: the schema name and its description. A neutral name such as `Error` is
   suggested.
5. `components.securitySchemes.api_key` (`X-ZOOZA-API-KEY`): an old-API scheme that doesn't belong in `/v3`.
6. `info.description` → "Company": "unless the key was issued with an unlimited company scope". api-v1 says this
   scope isn't available.
7. The `Payments` and `Customer profile` tags are declared with no operations.
8. `servers` lists only the host the document was fetched from. We'd like all three regional servers in one
   document (each region can still list itself first).
9. Possibly: a `description` per tag (shown as the category landing text), and `x-codeSamples` if they want to own
   samples. Otherwise the plugin generates them.

Answers to the gateway's questions: (1) we keep a synced copy: a daily job commits changes to `test`, so drift
shows up as a commit; (2) JSON is fine; (3) prose lives in their patch files, and we propose wording there rather
than overriding it; (4) see points 7–9.

### Open questions

- **`.claude/commands/api-design.md`** is built around the deleted integration draft. Delete it or rewrite it for
  the tool catalogue?
- **`examples/chatbot-logged-in-client`** reads a client's registrations by `user_id`. Check that `/v3`
  `GET /registrations` supports that filter with a company key. If it doesn't, rework the example or remove it.
- **`docs/concepts.md`.** Whether the `__{table}__{field}` naming explanation (now in the document's `info`)
  should also live in concepts, or only in the reference introduction.
- **Owner email in the token request.** api-v1 asks whether readers find it confusing. We'll answer after drafting
  `/api/authentication`.

### Implementation status (2026-11-18)

Done on `feature-v3-developer-docs` (staged, not committed): Scalar at `/api/reference` (old plugin, the 127
generated pages and `zooza_api_v1.yaml` removed; 35 old URLs redirect); `api:sync` and the daily sync workflow;
wording and tool-catalogue checks in `npm run build`; six guide pages; quickstart, concepts, ai-assistants,
make-up-sessions, the examples, the home page and `llms.txt` moved to `/v3`; `static/agent-setup.md`;
`api/llm/tools.yaml` (16 tools); a generated per-operation cost table on `/api/access-and-rate-limits`
(Scalar doesn't render `x-zooza-cost`/`x-zooza-groups`).

`static/zooza_api_v3.json` is currently api-v1's local build (2026-11-18 19:30), which goes live with the next
gateway rollout. Until then the live document is the old one. Don't run `api:sync` (its wording check would
fail) and don't merge to `test` before the rollout.

**Build warnings:** links to Scalar anchors (`/api/reference#tag/…`) show up as "broken anchors", because Scalar
creates them in the browser. All of them were checked in Playwright and land on the right operation.

**Reported to api-v1** in `api-docs-to-api-v1-20261118-001` (2026-11-18). Corrected before sending: `advanced_search=1` is documented (the issue is ergonomics), and the extra 422 codes are in the document, so they aren't a gap:
- `GET /courses` returns a plain array; the other lists (`/schedules`, `/events`, `/users`, `/companies/{ID}/places`)
  are paginated `{total, page, page_size, data}`.
- `GET /registrations` returns `null` unless `advanced_search=1` is sent. Is that intended, and can it be
  documented on the parameter?
- Not in the document: conditional requests (`If-None-Match`/`If-Modified-Since`, `304`, and "a `304` costs full
  points"); the cap of 100 validation problems; the accepted `Accept-Language` values.
- `404` and `500` are mentioned in the overview but documented on no operation.
- The 422 codes in the document add `unknown_field` and `invalid` to the handoff's list. Which is authoritative?

**Open:** `.claude/commands/api-design.md` still targets the deleted integration draft. Delete it, or rewrite it for
the tool catalogue?
