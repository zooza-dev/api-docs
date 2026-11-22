---
spec_id: DOC-20261120-001
title: "/v3 document generator: api-v1 subset + gateway operations + patch + access → zooza_api_v3.json"
status: in_progress
created: 2026-11-20
updated: 2026-11-20
author: api-docs
owner: api-docs
last_verified: 2026-11-20
project_type: other
depends_on: [DOC-20261118-001]
related_handoffs:
  - 2026-11-20-zooza-api-gateway-to-api-docs-v3-document-generation.md
tags: [api, openapi, v3, generator, access]
feature_branch: feature-v3-developer-docs
changelog: exclude
changelog_version: ""
changelog_date: ""
docs_version: ""
docs_communicated: ""
---

## Goal

The `/v3` OpenAPI document is the published reference and also the gateway's routing, authorization and rate-limit
table. api-docs now generates it (handoff `zooza-api-gateway-to-api-docs-20261120-001`, agreed). The generator merges
four inputs into one `zooza_api_v3.json`, and the same inputs always give the same bytes:
- api-v1's subset;
- the gateway's own operations;
- our prose patch;
- the access policy.

Prose fixes are edits in this repo. Opening an operation to partners is an edit to `access.json`, reviewed by the API
owner. Partners and the gateway read one file, so nothing can drift.

## Scope

**In:**
- Inputs in `openapi/`:
  - `subset.json`, vendored from api-v1 and pinned by commit in `subset.lock.json`;
  - `gateway.json`: the gateway's operations, responses, headers and schemas, as an OpenAPI overlay;
  - `patch.json`: prose, examples and tags, as an RFC 7386 merge patch;
  - `access.json`: tiers, defaults, token-endpoint limits, the group catalogue, and the endpoints keyed by
    `operationId`.
- `scripts/generate-api-doc.js`. It writes `static/zooza_api_v3.json`, and with `--check` it fails if the committed
  file differs from a fresh generation.
- `scripts/update-subset.js`, which vendors api-v1's subset at a given commit from a local api-v1 checkout and
  updates the lock.
- `scripts/tag-api-doc.js`, which cuts `v3-doc-YYYY.MM.DD-N` from a clean, up-to-date `main` after `--check` passes.
  It never pushes on its own.
- Generate-time checks:
  - the gateway's boot checks;
  - api-v1's `OpenApiV3DocumentTest` rules: audience wording, no empty tags, no unresolved `$ref`, no orphan
    components;
  - operations that `access.json` names but the subset lacks.
- Our consumers switch from `x-zooza-cost` / `x-zooza-groups` to `x-zooza-access`:
  - `OperationCosts`;
  - `build-llms-full.js`;
  - `check-tool-catalogue.js`;
  - `agent-setup.md`;
  - `tools.yaml`;
  - the Access page.
- The Access page's tier table is generated from `x-zooza-tiers`.
- `CODEOWNERS` on `access.json` and the generator, plus a pull-request workflow running `--check`.
- The daily sync from `/v3/openapi.json` is retired: the script, the workflow and `npm run api:sync`. It was never
  merged, so nothing in production changes.

**Out:**
- The bare subset itself: api-v1 publishes it, and until then the input is today's merged document (see the
  transition below).
- Moving api-v1's prose (`V3\Text`), examples and tag pruning into `patch.json`. That happens when the bare subset
  arrives, and the output must not change.
- The gateway vendoring the file and its boot checks (gateway).
- Branch protection on GitHub, which the owner sets in repository settings.

## Approach

**Merge order**, each step on the result of the last:
1. `subset.json`;
2. `gateway.json`, as an RFC 7386 merge patch;
3. `patch.json`, as an RFC 7386 merge patch;
4. `access.json`.

Arrays are replaced whole and `null` deletes. Key order is the order of insertion, so the result is deterministic.

**Access step:**
- A **gateway operation** is a path and method defined in `gateway.json`. It gets no `x-zooza-access`, because the
  gateway serves it itself: `POST /token` and `GET /me` are free and need no group.
- Every other operation:
  - **In `access.endpoints`:** it gets `x-zooza-access {groups, cost}`, where `cost` falls back to
    `defaults.cost`. The old `x-zooza-cost` and `x-zooza-groups` are removed, and the description gains a final
    line: "Access group: `core_read` · Cost: 2 points." (or "Access groups: `a` or `b`", or "1 point").
  - **Not in `access.endpoints`:** it is removed and named in the log.
- **An `access.endpoints` key that isn't in the merged subset is a hard failure.**
- Document level: `x-zooza-access-defaults`, `x-zooza-tiers`, `x-zooza-groups` (each group's title and
  description) and `x-zooza-token-endpoint`. `x-zooza-error-codes` stays as api-v1 publishes it.
- After exclusions, tags with no operations are dropped, and so are components that no operation reaches. Both are
  logged.

**Checks.** On any failure the output isn't written.
- Gateway boot checks, for non-gateway operations:
  - non-empty `groups`;
  - every group exists in `x-zooza-groups`;
  - `cost` is a positive integer;
  - `x-zooza-tiers` is non-empty.
- `access.json` shape: only `groups` and `cost` per endpoint.
- `patch.json` must not set `x-zooza-access`, `x-zooza-cost` or `x-zooza-groups`, because access lives only in
  `access.json`.
- Unique `operationId`s, and every operation's tag is in `tags`.
- Every local `$ref` resolves.
- The audience wording rules shared with `check-api-wording.js`, plus "unlimited".

**Output.** `JSON.stringify(doc, null, 4)` plus a newline, the format api-v1 publishes today, so diffs stay
readable. `static/zooza_api_v3.json` is the generated file: never hand-edited, always regenerated.

**Publishing.** The generated file is committed. Tags `v3-doc-YYYY.MM.DD-N` are cut from `main` only, and the gateway
vendors the file at a tag. For access changes the order is: tag, gateway rollout, docs deploy.

**Transition.** Until api-v1 publishes the bare subset:
- `subset.json` is api-v1's `docs/openapi/zooza_api_v3.json` (today's merged document), pinned by commit;
- `gateway.json` holds the gateway's operations and components exactly as they appear there, so the overlay is a
  no-op;
- `patch.json` is empty;
- `access.json` comes from api-v1's `docs/openapi/v3_gateway_fragment.json`, which matches the gateway's
  `config/access.yaml`.

The first output differs from today's document only in the agreed ways: `x-zooza-access` replacing `x-zooza-cost` /
`x-zooza-groups`, the description line, and the document-level extensions. When the bare subset arrives, we switch
the input and move the prose into `patch.json`, and the output must not change.

## Acceptance Criteria

- [x] `node scripts/generate-api-doc.js` writes `static/zooza_api_v3.json`. Running it twice gives identical bytes.
- [x] `node scripts/generate-api-doc.js --check` passes on the committed file and fails after any hand edit to it.
- [x] Against today's document, the only differences are the agreed ones:
  - [x] `x-zooza-access` on all 27 non-gateway operations;
  - [x] no `x-zooza-cost` / `x-zooza-groups`;
  - [x] the description line;
  - [x] the four document-level extensions.
- [x] Adding to `access.json` an `operationId` the subset lacks fails, names the id, and writes nothing.
- [x] Removing an endpoint from `access.json` drops the operation (and its now-unreachable tags and components),
  and logs it.
- [x] A group not in the catalogue, a cost of `0`, or `x-zooza-access` in `patch.json` each fail.
- [x] `update-subset.js <commit>` vendors the subset at that commit and records the commit and sha256. The generator
  fails if `subset.json` doesn't match the lock's sha256.
- [x] The Access page, `llms-full.txt`, the tool catalogue and `agent-setup.md` read `x-zooza-access`. The tier
  table comes from `x-zooza-tiers`.
- [x] `CODEOWNERS` covers `openapi/access.json` and the generator. A pull-request workflow runs `--check`.
- [x] `npm run build` passes. The daily sync script and workflow are gone. `CLAUDE.md` and `README.md` describe the
  generator.

## Project Context

- Inputs: `openapi/`. Generator and helpers: `scripts/generate-api-doc.js`, `scripts/update-subset.js`,
  `scripts/tag-api-doc.js`. Shared wording rules: `scripts/lib/api-wording.js`.
- `static/zooza_api_v3.json` stays the path Scalar, `ErrorCodes`, `OperationCosts` and `llms-full` read, and the path
  the gateway vendors.

## Notes

- 2026-11-20: today's document and api-v1's fragment agree on all 29 operations (groups, cost, path, method).
  `POST /token` and `GET /me` cost 0 and have no group, so they're gateway operations and exempt from the boot
  checks. We tell the gateway in the handoff thread, because their boot check says "every operation".
- 2026-11-20: the Access page still said "New keys start on `free`. An owner can choose another tier when editing
  the key". That contradicts the owner's ruling (the tier is the company's), so we removed it with this work.
- `CODEOWNERS` names `@martin-zooza` as the API owner's reviewer. Change it if someone else owns API access.
- 2026-11-20: the gateway's `config/access.yaml` still lists `get_companies_id_places`. The subset (and api-v1's
  fragment) call it `get_places`, so `access.json` uses `get_places`. The hard failure would have caught the old
  name. We told the gateway in the thread.
- 2026-11-20: built and verified. Inputs pinned to api-v1 `14eb2673` (on api-v1's `feature-api-key-management`,
  pushed). The output differs from today's document only in the agreed ways. Failure cases were checked by hand:
  an unknown `operationId`, a cost of `0`, an unknown group, access in `patch.json`, wording in `patch.json`, a
  hand edit with `--check`, and a tampered subset. Removing endpoints drops their tags and components.
  `npm run build` passes, apart from the known Scalar anchor false positives.
- **For the bare-subset switch** (open): the subset won't carry the gateway's `401` / `403` / `422` / `429` / `503` /
  `504` responses on each operation, which api-v1's `Builder` adds today. Either `patch.json` adds them per
  operation, or the generator adds the gateway's standard responses to every exposed operation. Decide when api-v1
  publishes the subset; the output must stay byte-identical across the switch.
- Not done here: the first tag. It needs this branch merged to `main` through `test`, and is cut with
  `npm run api:tag`. Branch protection that requires code-owner review is a repository setting for the owner.
- 2026-11-20: **first change of scope** (handoff `api-docs-to-api-v1-20261120-001`). api-v1 commit `54dfd412` adds
  `get_billing_periods` and `get_schedules_id`, a `roles` filter on `GET /users` and the `course_type` values.
  1. `--preview ../api-v1/docs/openapi/zooza_api_v3.json` showed both operations "left out (not in access.json)".
  2. With them added to `access.json` (`core_read`, 2 and 1 points), the preview said "would add" and every check
     passed.
  3. Against the old pin, the hard failure fired, as intended.
  4. We then re-pinned and regenerated: 31 operations, and the build passes.

  The gateway was asked to run `/v3` from the generated file and do the local trial. Until it does, `/v3` doesn't
  serve the new operations.
- 2026-11-20: added `--preview <subset>`: runs every step and check on a candidate subset without pinning it, and
  lists the operations it would add or remove. Use it when api-v1 announces a change, before `update-subset`.
- **Follow-up (open): patches can hide upstream changes.** `patch.json` replaces whole strings (e.g.
  `info.description`). If api-v1 later changes a text we patch, our version wins without a word. At this pin the
  overview was unchanged (checked by diff). Fix: record a hash of each patched value's base in the subset, and fail
  when the base changes, so we re-read it. That stops mattering once the prose has fully moved to us (bare subset).
