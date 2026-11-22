---
spec_id: DOC-20261122-001
title: "/v3 examples and task guides from the demo apps' recorded calls"
status: in_progress
created: 2026-11-22
updated: 2026-11-22
author: api-docs
owner: api-docs
last_verified: 2026-11-22
project_type: other
depends_on: [DOC-20261120-001, DOC-20261120-002]
related_handoffs:
  - 2026-11-20-api-docs-to-api-example-backoffice-console-first-slice.md
  - 2026-11-22-api-docs-to-api-v1-v3-reference-findings-from-backoffice.md
tags: [api, v3, examples, guides, openapi]
feature_branch: feature-v3-developer-docs
changelog: ""
changelog_version: ""
changelog_date: ""
docs_version: ""
docs_communicated: ""
---

## Goal

The back-office demo app recorded 45 real `/v3` calls in tutorial order, with personal data replaced
(`api-example-backoffice/examples/`, handoff `api-docs-to-api-example-backoffice-20261120-001`). This spec turns them
into documentation:
- the API reference gets examples that really happened;
- each task a partner does gets a guide built around the calls, in the order they're made, with the pitfalls the app
  hit at the step where they bite.

Every example comes from one vendored copy and is checked at build time. An example can't drift from the document,
and a guide can't show a call the reference doesn't have.

## Scope

**In:**
- **Vendoring.** `openapi/examples/` holds the demo app's bundle, copied at a pinned commit by
  `scripts/update-examples.js` and recorded in `openapi/examples.lock.json` (repo, path, commit, sha256). It is never
  edited by hand, like `subset.json`. Request ids are rewritten to fixed placeholders while copying.
- **Reference examples.** `openapi/examples.json` lists which bundle examples go into the reference. That choice is
  ours, not the bundle's `reference` flag. The generator adds each one to its operation as a named example, on the
  response for its status and, when there is a body, on the request.
- **Checks in the generator.** A reference example fails the generation when:
  - its id isn't in the bundle;
  - its operation isn't in the output;
  - its status isn't one of the operation's responses;
  - its response body fails the response schema;
  - its request body fails the request schema.

  The vendored bundle must also match its lock.
- **`<ApiExample id="…" />`**, an MDX component that shows one bundle example: title, request (method, path, query,
  body) and response (status, body), with long bodies collapsed. It fails the build if the id isn't in the bundle or
  its operation isn't in the document. Guides never paste JSON.
- **Task guides** under `docs/api/guides/`, in the API sidebar. Each follows its flow's "final shape" order from the
  app's guide notes, and is written for a partner, not about the demo app's screens:
  1. **Set up a term** (first): programme → class → weekly sessions, read back.
  2. Find registrations.
  3. Change a registration's status.
  4. "Check your key": Getting started keeps its own `GET /me` answer (see Notes).
- **Cross-cutting pages:** "In practice" sections on Errors (two error shapes, `400` for "not found"), paging
  (zero-based, the `500` cap) and dates and times (minutes after midnight, non-ISO timestamps, `0000-00-00`),
  linking to the guides.

**Out:**
- Fixing the document's schemas. That's api-v1's, in handoff `api-docs-to-api-v1-20261122-001`, held until the owner
  sends it. Examples blocked by it wait in `examples.json` (see Notes).
- Links to the demo app's code (`x-codeSamples`, "see this step in the app"). They come when the public repo is tagged
  `v0.1.0`, so the docs and the public copy point at the same code.
- A "build a back office" tutorial across the whole app: later, once all three demo apps exist.
- Recording new calls. Asking the app for a different example is a request in its handoff thread.

## Approach

**Vendoring.** `node scripts/update-examples.js <commit> [--repo ../api-example-backoffice] [--path examples]` reads
the bundle with `git show` at that commit (never the working tree). It writes `openapi/examples/<flow>/<file>.json`
and the lock. The sha256 covers the bundle as written. While copying, every `request_id` value in a body and every
`x-request-id` header becomes `00000000-0000-4000-8000-<NNNNNNNNNNNN>`. NNN counts in sorted file order, so the copy is
deterministic. Record ids stay as the local stack made them: they look plausible, and a guide's ids then agree from
step to step.

**Generator step 5, examples** (after access, before the checks):
- For each id in `examples.json`, find the operation by `operationId`.
- If its response for the status is a `$ref`, inline a copy into the operation first, so a shared response component
  doesn't carry one operation's example.
- Set `content['application/json'].examples[<slug>] = { summary, description, value }`. The slug is the example's
  file name without its number. Do the same on the request body when the example has one.
- A media type that gets `examples` loses api-v1's singular `example`, because OpenAPI allows only one of the two.
  That is logged.
- Schemas are checked with Ajv (OpenAPI 3.0: `nullable` honoured, formats checked).
- The output stays deterministic: `examples.json` order, then key order.

**Guides.** They are written from the app's guide notes (`guides/*.md`, sections "The final shape", Pitfalls, Gaps),
in our words and under the wording rules. They follow the notes, not the app:
- **Where:** a pitfall goes in the step where it happens. A gap the reference doesn't cover yet is said plainly, as
  what to do today. We never promise a fix.
- **Reference links:** each call links its reference entry (`/api/reference#tag/<tag>/<METHOD><path>`).
- **Examples:** shown through `<ApiExample>`.

## Acceptance Criteria

- [x] `npm run api:update-examples -- <commit>` vendors the bundle and writes the lock. Running it twice gives
  identical bytes. The generator fails when `openapi/examples/` doesn't match the lock.
- [x] `openapi/examples.json` lists the reference examples. Each appears in `static/zooza_api_v3.json` under its
  operation's response (and request, when it has a body), with summary and description.
- [x] The generator fails, names the example and writes nothing when:
  - [x] an example's response doesn't match its schema;
  - [x] its operation isn't exposed;
  - [x] its status isn't documented.
- [x] `--check` stays green. The output is deterministic.
- [x] `<ApiExample id>` renders an example in a guide. An unknown id, or an operation missing from the document,
  fails `npm run build`.
- [x] `docs/api/guides/set-up-a-term.md` is published in the API sidebar. It covers:
  - loading the choices;
  - creating the programme, the class and the sessions;
  - resuming without duplicates;
  - reading the term back.

  It has the pitfalls at their steps, every call linked to the reference, and examples only through `<ApiExample>`.
- [x] The wording check passes. No page names the demo app's internals, local hosts or personal data.
- [x] Guides for "find registrations" and "change a registration's status", and the cross-cutting "In practice"
  sections.
- [ ] The reference examples blocked on api-v1's schema fixes are added once the fixes are pinned.

## Project Context

- Bundle source: `api-example-backoffice` (private), `examples/` and `examples/manifest.json`. It is rebuilt there by
  `scripts/build-examples.mjs`, which replaces personal data and refuses to write if an original value survives.
- Inputs: `openapi/examples/`, `openapi/examples.lock.json`, `openapi/examples.json`. Generator:
  `scripts/generate-api-doc.js`. Component: `src/components/ApiExample/`.

## Notes

- 2026-11-22: we checked the bundle ourselves before using it:
  - **Personal data:** clean. Placeholders only; the one Zooza host is the public default avatar on the CDN.
  - **Schemas:** 34 of 45 answers match theirs. All 11 mismatches are document errors, now in the api-v1 handoff.
  - **Reference picks:** 6 of the app's 22 are blocked: `GET /courses`, `GET /schedules`, `POST /courses`,
    `POST /schedules`, `GET /schedules/{ID}`, `GET /courses/{ID}`. That's `field_options` `[]`,
    `priority_registration_phase` `null` outside its enum, and `start`/`end` `"0000-00-00"`. They're listed in
    `examples.json`'s `blocked`, with the reason, until api-v1's fixes are pinned.
- Decided: examples come from `openapi/examples/` + `examples.json`, not from `patch.json` as DOC-20261120-002
  first said. `patch.json` stays prose. This also keeps examples out of the bare-subset switch.
- The pinned bundle commit is local to the back office's repo (`feature/examples-bundle`) until they push. Re-pin to
  their `main` once it is pushed.
- 2026-11-22: phase 1 built.
  - Bundle vendored at back office `1d2d5bf`: 45 examples, 50 request ids replaced.
  - 16 reference examples are in the document, all passing their schemas, request bodies included. None replaced an
    api-v1 example.
  - Failure cases checked by hand: a blocked example put into the reference fails on its schema; a tampered bundle
    fails the lock; an unknown id fails.
  - `<ApiExample>` with an unknown id fails `npm run build`. "Set up a term" is published with 17 examples, and
    `llms-full.txt` includes it with the examples as Markdown.
  - The only new build warnings are the known Scalar deep-link anchors.
- The generator checks only the reference examples. A guide-only example is checked by `<ApiExample>`: its id must
  exist and its operation must be in the document. Its answer isn't checked against the schema, on purpose: a guide
  shows what really happens, including answers the document gets wrong.
- 2026-11-22: phase 2 built.
  - "Find registrations" (14 examples) and "Change a registration" (11 examples) are published. The Guides sidebar
    is in task order: find, change, set up a term.
  - "In practice" is on Errors (a `400` for "not found", both error shapes, no `request_id` in a `400` body,
    required fields not in the schema, a `200` that isn't done). The overview's "Good to know" now covers paging past
    the cap, minutes after midnight, non-ISO timestamps and `0000-00-00`. We didn't add a separate paging or dates
    page: those live in the reference's descriptions, and "Good to know" links to them.
  - `llms-full.txt` cuts example bodies over 60 lines (registration rows carry whole programme and class objects):
    500 KB instead of 1.1 MB.
  - **Getting started keeps its hand-written `GET /me` answer.** The recorded one is a write key on the
    `partner_xl` tier, while that page describes a new read-only key on `free`. The recorded answer is the
    reference example for `GET /me`.
- 2026-11-22: **Preflight check page** (`docs/api/preflight-check.md`), at the owner's request. Written from api-v1's
  code: `Linking_Status_Preflight`, `Linking_Service::preflight()`, `Replacement_Credit_Conversion` and the
  `Preflight` class (the `error` / `warning` / `notice` severities). It covers:
  - the check → decide → apply flow; the apply re-validates, with no token;
  - every check of a status change, and every property;
  - two worked examples: make-up credits on a cancellation (`replacement_credits`,
    `convert_replacements_to_free_event`), and cancelling the main registration of a group (`linking`: `new_root`,
    `whole_group`, `disband`).

  The two worked examples use short hand-written JSON, because the bundle has no recording of either case. **To do:**
  ask the back office for recordings of a cancel with make-up credits and of a group's main registration, then
  replace those snippets with `<ApiExample>`. api-v1 should confirm the page when the held handoff is sent (item B,
  the preflight schema).
- 2026-11-22: **The local test company's data is anonymised while vendoring** (owner's request).
  - **What:** `openapi/examples.rewrite.json`, applied by `update-examples.js`, replaces venue names and places,
    coordinates, Slovak programme, class and label names, developers' test labels (`[DS-TEST …]`, `Hugo …`,
    `Utm E2e`) and a birth date.
  - **Error messages:** the Slovak ones become their English texts from api-v1's `locale_text_content.php`, as a
    company whose language is English receives them.
  - **Guard:** copying fails if a string still has Slovak diacritics, a known local name, a non-example email or a
    local host. Extend the table when it fails.
  - **What's left:** the person placeholders the demo app chose (`Anna Novak`, `Novak1`, …), and one Slovak sample in
    api-v1's own `RequestError` description, added to the held api-v1 handoff.
- 2026-11-22: **The preflight check is split into concept, contract and use** (owner's decision).
  - **`docs/api/preflight-check.md` covers only what's the same everywhere:** the flow, the answer's envelope, the
    severities, a generic handler and errors. It ends with `<PreflightOperations />`, generated from the document:
    every operation whose `action` query parameter accepts `preflight_check`. Today that's `PUT /registrations/{ID}`.
  - **Per-operation checks and properties belong in the reference**, from api-v1: one answer schema per operation
    (held handoff, item B, reworded). When they exist, add a generator check: an operation that accepts
    `preflight_check` must name its preflight schema.
  - **How to use them is in a guide:** the new `docs/api/guides/cancel-a-registration.md` carries the status
    change's check and property tables (until the reference does), the make-up credits decision, the group
    decision, email, scheduling and undoing. "Change a registration" keeps the generic status change and links to
    it.

