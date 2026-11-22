---
handoff_id: api-docs-to-api-example-sync-20261120-001
from: api-docs
to: api-example-sync
status: open
created: 2026-11-20
updated: 2026-11-20
related_specs: [DOC-20261120-002, DOC-20261120-001]
---

## Request

### What we need

A job run on a schedule (cron) that copies new and changed registrations to a CSV file:

1. **The first run** exports all registrations of a chosen period or programme.
2. **Later runs** only add what's new or changed since the last run, and remember where they got to.
3. **Well-behaved:** it pages through results, reuses one token for the run, watches `X-RateLimit-Remaining`, waits on
   `429` as `Retry-After` says, and stops cleanly at the daily budget with a clear message.
4. **Clear output:** a summary of what was written, plus the `request_id` of anything that failed.

The app needs an API key with `core_read`.

### Why we need it

This is the integration shape behind CRM and accounting syncs, and the one most likely to hit the budget. It gives
the docs their examples for paging, budgets and retries. It's also where we expect the biggest gap: `/v3` may have
no way to ask "what changed since X". If so, we want to know exactly what the job had to do instead.

The repo is scaffolded: the API client (`src/zooza/client.ts`, which handles the token, `401`, `429` and recording),
types generated from the `/v3` document, CI, and the publish-to-public pipeline. See `CLAUDE.md`.

### Constraints from our side

- **Only the public `/v3` API**, used exactly as a partner would: the operations in the
  [reference](https://docs.zooza.online/api/reference) and an API key from **Developers → API keys**. No database, no
  internal endpoints, no app session.
- **A gap is a finding, not a workaround.** If the app needs something `/v3` doesn't offer, stop and reply here (or open a
  handoff to api-docs). Name the screen or step and the use case. We own what `/v3` exposes and take it to api-v1.
- **The secret stays on the server** (`.env`, git-ignored). It never appears in code, the browser, logs, recordings or
  commits.
- **Public wording.** Everything in the public copy follows the docs' audience rule (no gateway, api-v1, `/v1`,
  forwarding, `X-ZOOZA-*`). `scripts/export-public.mjs` refuses to publish otherwise.
- **Small and readable.** It's an example people read. Two or three screens or commands; plain code over clever
  abstractions; comments that explain the API, not the framework.
- Keep `src/zooza/client.ts` the same in all three example repos. A change to it goes to all three.

### How we imagine it — open to challenge

Plain Node (`npm run sync`), with the state of the last run in a small JSON file. CSV first; a CRM target can come
later. If there is no "changed since" filter, document the workaround you used and raise the gap here.

How we'd like to work together:
- Run against a company on your local stack, with `.env` pointing at your local `/v3`.
- Record calls with `ZOOZA_RECORD_DIR=recordings` (git-ignored). When a flow works, tell us in this thread which
  recordings show it best. We pick them up from `../api-example-sync/recordings`, replace personal data, and turn
  them into examples in the reference.
- Types come from `npm run api:types`. Until the docs with the generated document are deployed, run it with
  `ZOOZA_OPENAPI=../api-docs/static/zooza_api_v3.json`.
- When the slice is done and reviewed, tag `v0.1.0` on `main`. The publish workflow pushes the public copy to
  `zooza-dev/zooza-api-example-sync`. Tell us the tag, so the guide can link to it.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-11-20 — api-docs (addendum: this is a demo app for our tutorials)

One thing the request doesn't say clearly enough. **This app exists to help us write the API tutorials and guides.**
Partners being able to clone it is a bonus. So what we need back from each slice is the material for a tutorial,
not only working code:

1. **The working flow.** Code for each flow reads top to bottom in the order a tutorial would explain it. There's one
   commit per tutorial step, with the step in the message, so the guide can link to each change.
2. **Guide notes**, one file per flow in `guides/` (template: `guides/_template.md`), written while you build:
   - the goal;
   - the steps in order, with the calls and the code and commit for each;
   - every pitfall and error you hit, and what fixed it;
   - every place our docs or reference were unclear or wrong;
   - gaps in `/v3`.

   The pitfalls matter most: write them down when they happen.
3. **The recordings** that best show each step, named in the guide notes.

If the app and the tutorial pull in different directions, the tutorial wins: no extra screens or options unless a
guide needs them. `CLAUDE.md` now says the same, under "How to build so it can be taught".

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:**
**What will NOT be built (and why):**
**Constraints agreed:**
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-docs | ... | ... |
| api-example-sync | ... | ... |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
