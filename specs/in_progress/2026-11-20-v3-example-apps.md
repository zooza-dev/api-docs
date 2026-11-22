---
spec_id: DOC-20261120-002
title: "/v3 example apps: real integrations as the source of guides and examples"
status: in_progress
created: 2026-11-20
updated: 2026-11-20
author: api-docs
owner: api-docs
last_verified: 2026-11-20
project_type: other
depends_on: [DOC-20261120-001]
related_handoffs:
  - 2026-11-20-api-docs-to-api-example-website-catalogue-first-slice.md
  - 2026-11-20-api-docs-to-api-example-backoffice-console-first-slice.md
  - 2026-11-20-api-docs-to-api-example-sync-registration-sync-first-slice.md
tags: [api, v3, examples, guides]
feature_branch: ""
changelog: ""
changelog_version: ""
changelog_date: ""
docs_version: ""
docs_communicated: ""
---

## Goal

**These are demo apps built to help us write the API tutorials and guides.** The `/v3` docs need examples that come from real use, not ones written next to the schema. We build a few small
apps against `/v3`, the way a partner would. While building them we take our guides, request and response examples
and code samples from their actual calls. Partners can then clone cleaned-up public versions and read working code.
Whatever an app needs but `/v3` lacks becomes a request to api-v1, backed by a real use case.

## Scope

**In: three apps, each in its own repo, shaped like a real integration.** Not a copy of the admin app: `/v3` is
server-to-server, one company per key, and the token acts as the owner. A multi-user admin would teach a pattern we
don't support.

1. **Website catalogue.** Programmes, classes, sessions and venues in your own design, fetched on the server and
   cached. It covers lists and paging, the different list shapes, regional time, and saving points by caching.
   Booking stays with the widgets.
2. **Back-office console.** A tool one company runs for itself, with one operator; logging in to it is the tool's
   own concern. It covers:
   - searching registrations and updating one;
   - setting up a term: programme → class → sessions;
   - attendance;
   - invoices and their download.

   Most write examples come from here.
3. **Sync job.** A script on a schedule that copies new registrations to CSV or a CRM. It covers pagination, the
   budget headers, `429` / `Retry-After` and reusing tokens. It is the most likely place to expose gaps (changes
   since a date, webhooks).

**In, also:**
- Recording calls, then turning chosen recordings into examples in `openapi/patch.json`.
- Checking examples against the document's schemas.
- A guide page per app.
- Export scripts for the public repos.

**Out:**
- Hosting or running the apps publicly.
- Booking flows (widgets cover them).
- Multi-user login.
- Anything not in `/v3`. Missing operations are requested from api-v1, never worked around.

## Approach

**Repos.** One private repo per app, under the shared project root with the SDD framework (specs, handoffs,
`CLAUDE.md`). Each gets a public, cleaned-up mirror. Private repos `zooza-dev/api-example-{website,backoffice,sync}`
(local folders of the same name, spec prefixes EXW, EXB, EXS), public mirrors
`zooza-dev/zooza-api-example-{website,backoffice,sync}` (MIT).

**Stack.**
- Next.js (App Router, TypeScript) for the website and the console. Server components and route handlers keep the
  secret on the server, which is the security lesson we want to show.
- Plain Node for the sync job.
- Types generated from `/v3/openapi.json`, which shows that generating a client from the document works.

**Development data.** The apps run against the local stack, using companies already on the developer's machine.
Writes are harmless there. Recordings come from local data.

**From call to example.**
1. The app's API client has a record mode that saves request and response pairs.
2. A script in api-docs turns the chosen recordings into examples in `patch.json`:
   - request and response examples;
   - `x-codeSamples` that point at the code;
   - local hosts, ids and tokens rewritten to public values;
   - names, emails and phone numbers replaced with placeholders, in case real-looking data slipped in.
3. The generator checks every example against its schema, so an example can't drift from the contract.
4. Guides link to code in the **public** repo at a release tag.

**Private → public.** Each private repo has an export script. It:
- copies only an allowlist (app code, README, `.env.example`, licence), never `specs/`, `handoffs/`, `CLAUDE.md`
  or `.claude/`;
- publishes a fresh release commit, never the private history;
- runs the `/v3` wording rules and a secret scan, and refuses to publish on any finding.

**Gaps.** An operation an app needs but `/v3` doesn't have goes to api-v1 as a handoff that names the app and the
use case. api-v1 decides whether it's eligible, and opening it is an `access.json` edit the API owner approves. The
subset grows from real need.

## Acceptance Criteria

- [x] Repo names, spec prefixes and licence for the public mirrors decided
- [ ] First slice (back-office registration search + set up a term) built against the local stack
- [ ] Recording → `patch.json` script and schema check for examples in api-docs; the first examples published in the
  reference
- [ ] Export script produces a public mirror with no SDD files, no private history, no findings (script and publish workflow in place and tested locally; first real publish on the first `v*` tag)
- [ ] One guide page that walks through the first slice and links to the public code at a tag
- [ ] Each gap found so far raised with api-v1 as a handoff

## Project Context

- Examples land in `openapi/patch.json` and go through the generator (DOC-20261120-001). Nothing is added to
  `static/zooza_api_v3.json` by hand.
- The guide pages live under `docs/api/` (or a new `docs/api/examples/`), following the same wording rules.

## Notes

- 2026-11-20: idea from a brainstorm with the owner. We dropped the admin-app clone because `/v3` has no multi-user
  login, and settled on three integration-shaped apps.
- Likely gaps, unverified until building shows them: client (customer) records, terms (billing periods),
  instructors, payments, changes since a date, webhooks.
- Open: does the local stack serve `/v3` (gateway plus api-v1) end to end, including the token, so the apps use
  exactly what partners use?
- Open: a public mirror is a maintenance promise. Keep each app to two or three screens and pin it to a document tag.
- 2026-11-20: set up. Six repos were created. Each private repo has:
  - a scaffold: Next.js 16 for the website and the console, Node and TypeScript for the sync job;
  - the shared API client (`src/zooza/client.ts`: token cache, `401` retry, `429` wait, record mode);
  - types generated from the `/v3` document;
  - CI (lint, type-check, build);
  - the publish workflow: on a `v*` tag it runs `export-public.mjs` and pushes to the public repo with a write deploy
    key, stored as the `PUBLIC_REPO_DEPLOY_KEY` secret;
  - the SDD folders and a `CLAUDE.md`.

  The public repos stay empty until the first tag. Handoffs for the first slices were sent (status `open`).
- 2026-11-20: the live `https://api.zooza.app/v3/openapi.json` still serves the gateway's older document (other
  schema names, no `Me`). The apps take their types from our generated document instead: the default is
  `https://docs.zooza.online/zooza_api_v3.json`, or set `ZOOZA_OPENAPI` to a local path until the docs are deployed.
- 2026-11-20: framing made explicit. Each repo's `CLAUDE.md` says the app exists to help us write tutorials and
  guides, and that the tutorial wins when it conflicts with the app. Each repo has a private `guides/` folder with a
  template for notes per flow (goal, steps with calls, code and commit, pitfalls, unclear docs, gaps), and the export
  refuses that folder. Code follows the tutorial's order, with one commit per step. A slice is done when the flow, its
  guide notes and the chosen recordings are ready. Each handoff gets an addendum saying so.
