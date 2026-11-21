---
handoff_id: zooza-api-gateway-to-api-docs-20261120-001
from: zooza-api-gateway
to: api-docs
status: agreed
created: 2026-11-20
updated: 2026-11-21
related_specs: [AGW-20261114-001]
related_handoffs: [zooza-api-gateway-to-api-docs-20261114-001, api-v1-to-zooza-api-gateway-20261113-001]
supersedes: [zooza-api-gateway-to-api-docs-20261114-001]
---

## Request

### What we need

**The `/v3` OpenAPI document should be generated in `api-docs`, not in the gateway.** We are asking you to own
the generator: take api-v1's generated subset, merge it with a patch file (prose, examples) and an access file
(which group may call an operation, what it costs), and produce one deterministic `zooza_api_v3.json`. The
gateway vendors that file and runs from it.

```
api-v1 (subset)  ──┐
patch.json       ──┼──►  api-docs generator  ──►  zooza_api_v3.json  ──►  gateway /v3
access.json      ──┘      (deterministic)                                 (vendored, served)
```

This reverses what we asked for in `zooza-api-gateway-to-api-docs-20261114-001`, where we proposed keeping the
merge on our side and asked you only to render our URL. That handoff is superseded by this one; the questions
in it are answered below rather than still open.

### Why we changed our mind

One artifact, one truth. The generated document is simultaneously the published documentation **and** the
gateway's routing table, authorization table and rate-limit table. An operation that is not in it is not
routable; an operation in it is documented exactly as it behaves. There is no second file to drift.

With the merge in the gateway, the words a partner reads live in one repo (`config/patches/*.yaml` here) and
the thing that renders them lives in another. Every prose fix becomes a gateway pull request and a gateway
rollout — which is the wrong gate for a typo, and the wrong team's review queue. Moving the merge to you puts
the document where documentation is edited, and leaves the gateway doing the one thing it is good for:
enforcing what the document says.

What we keep is the structural guarantee we wanted from the start. It does not weaken by moving: the gateway
has no routes other than what the generated document contains.

### What the generator must produce

This section is the part we would like agreed precisely, because our boot checks depend on it. If you want it
as a normative file in your repo once we agree, we will write it.

**Access, one vendor extension per operation.** Both values live in one object, so a patch merges them as a
unit and they cannot be set half-way:

```jsonc
"/registrations": {
  "get": {
    "operationId": "get_registrations",
    "x-zooza-access": {
      "groups": ["core_read"],   // key needs at least ONE of these (OR)
      "cost": 2                  // points charged per call
    }
  }
}
```

**And, once per document, what is not per-operation:**

```jsonc
"x-zooza-access-defaults": { "cost": 1 },

"x-zooza-tiers": {
  "free":       { "points_per_minute": 60,   "points_per_day": 1000 },
  "standard":   { "points_per_minute": 300,  "points_per_day": 20000 },
  "partner_xl": { "points_per_minute": 1200, "points_per_day": 100000 }
},

"x-zooza-groups": {
  "core_read":  { "title": "Read core data",  "description": "Registrations, programmes, classes, ..." },
  "core_write": { "title": "Write core data", "description": "..." }
},

"x-zooza-token-endpoint": {
  "per_client": { "points_per_minute": 5 },
  "per_ip":     { "points_per_minute": 20 }
}
```

`access.json` in `api-docs` keeps the shape our `config/access.yaml` has today — `tiers`, `defaults`,
`token_endpoint`, `endpoints` keyed by `operationId` — and the generator spreads it into the extensions above.
We will hand you that file; converting YAML to JSON is the whole of the migration. Extending `/v3` with an
endpoint then means editing `access.json`, nothing else.

Because `x-` extensions are invisible in most renderers, we would like the generator to append one line to each
operation's `description`, built from the same values: *"Access group: `core_read` · Cost: 2 points."*
Generated, never hand-written, so it cannot disagree with `x-zooza-access`.

**Two gates, one rule.** api-v1's subset says what is technically possible; `access.json` says what `/v3`
actually exposes:

| Case | Generator behaviour we are asking for |
|---|---|
| In subset, missing from `access.json` | Not emitted into `/v3`. Logged by name — an endpoint nobody turned on. |
| In `access.json`, missing from subset | **Hard failure.** A typo, or api-v1 renamed the operation. |
| In both | Emitted with `x-zooza-access`. |

**The document must also carry what api-v1's has no reason to contain:** `POST /v3/token`, `GET /v3/me`, the
`401` / `403` / `422` / `429` responses, the `Retry-After` and `X-RateLimit-*` headers, and the schema of our
validation error body. We have these as operation definitions in `src/gatewayOps.ts` and will hand them over in
whatever form suits the generator.

**Region-neutral.** Please do not emit one document per region. The gateway rewrites `servers` to its own
`ISSUER_URL` when serving, so one generated file covers EU, UK, ASIA and test instead of four near-identical
ones. This is a change from what we told you on 2026-11-14.

### What we do on our side

**The document is vendored at build time, never fetched at runtime.** This is not a performance preference.
`access.json` is an authorization policy: it decides who may call what. Pulled live, an edit in `api-docs`
would change production authorization with no deploy and no review. Vendored, the diff in the gateway repo is
the visible record of what was opened to whom, and it ships on a rollout — which also keeps the `ETag` on
`GET /v3/openapi.json` stable for anyone caching it.

Practically: a change to `access.json` or the prose reaches partners when you regenerate; it reaches
**enforcement** when we vendor the new file and roll out. We will say how we pick that up (tag, release
artifact, commit pin) once you say how the generated file is published.

Boot checks, enforced before a pod serves traffic — a violation fails the boot, it does not fall back to a
default:

- every operation has `x-zooza-access` with a non-empty `groups`
- every group named by an operation exists in `x-zooza-groups`
- every `cost` is a positive integer
- `x-zooza-tiers` is present and non-empty

So a generated document that is wrong in these ways does not reach production; it stops the rollout. Worth
knowing because it means the generator's own validation and ours should agree, and we would rather you catch
it at generate time than we catch it at boot.

We also delete `config/access.yaml` and `config/patches/*.yaml` from this repo when the generated document
arrives. Until then they stay and the current merge keeps running — nothing in `/v3` changes while this is
being decided.

### Not in scope here

api-v1's side of it. The generator needs a stable subset with `operationId`s that `access.json` can name, and
that is a commitment nobody has made yet. We are deliberately not opening it until you and we agree on what the
generator needs from that subset, so that api-v1 gets one request rather than three.

### Questions for you

1. **Do you want the generator?** If not, say so plainly and we will keep the merge here and go back to asking
   you only to render — the 2026-11-14 arrangement.
2. **Where does the generated file get published,** and how should the gateway pin a version of it? A tagged
   release artifact is easiest for us to vendor reproducibly; a branch is not.
3. **Who writes the prose** into `patch.json` — your team, or us sending you text? Same question as last time,
   still unanswered, and now it matters more because the file lives with you.
4. **Is `x-zooza-access` as one object per operation workable in your merge order,** or does your patch layer
   want the two values separate? We care about them moving as a unit; the spelling is yours.
5. **Does the hard failure in the second row of the table above sit badly with anything in your build?** It is
   the check that makes a renamed api-v1 operation loud instead of silently dropping an endpoint from `/v3`.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->


### 2026-11-20 — api-v1 (API owner): the owner backs this; what api-v1's subset will be

The owner backs moving the generator to api-docs (2026-11-20, owner). They drew the same pipeline: api-v1's
subset, plus `patch.json` (prose and call examples) and `access.json` (exposure, groups, cost, tiers), merged
deterministically in api-docs, with the result bundled into the gateway. This reverses the 2026-11-18
arrangement in `api-v1-to-api-docs-20261114-001`, where api-v1 built and owned the whole `/v3` document. The owner
asked us to relay this to you, so this entry is api-v1's half of the contract. You don't need to open a separate
request to us.

**What api-v1 will publish: the subset.**

- **Every `/v1` operation that is eligible for `/v3`,** meaning safe to expose to a partner key. This is
  broader than what `/v3` exposes today, so extending `/v3` is an `access.json` edit only, as the gateway asks.
  Eligibility is api-v1's call, per operation. Customer- and widget-facing calls, and `set_attendances`, stay out,
  as already ruled.
- **Stable `operationId`s.** We won't rename or remove an eligible operation without a handoff to you first, so the
  generator's hard failure (in `access.json`, missing from the subset) only ever fires on a typo.
- **Already clean of internals.** api-v1 knows which names are internal, so it does that cleaning before
  publishing, not your generator:
  - schema names in the API's vocabulary, not PHP class names (today's `Builder::RENAMED`);
  - deprecated fields and enum values left out (`HIDDEN`, `HIDDEN_VALUES`);
  - no `x-zooza-permission` and no `x-zooza-resource`.
- **The request-error envelope (`RequestError`, the `400` body) and `x-zooza-error-codes`:** every code with
  its name, area, description and English message. Error codes are api-v1's. You already render the reference
  from them (`api-v1-to-api-docs-20261119-001`).

**What moves to you,** from api-v1's current `OpenApi\V3\Builder`:

- the overview prose (`V3\Text`);
- the per-schema call examples (`class/OpenApi/V3/examples/`);
- the `servers` list;
- the tag pruning;
- the gateway's operations, responses and headers (`401` / `403` / `422` / `429` / `503` / `504`, `Retry-After`,
  `X-RateLimit-*`);
- `bearerAuth`;
- the `Error` / `GatewayError` naming;
- the link from `400` to the error-code reference.

We'll hand the prose and examples over as files. `tests/OpenApiV3DocumentTest.php` holds the audience rule
(no gateway, `api-v1`, `/v1`, forwarding, old headers or "unlimited"; no empty tags; no unresolved references or
orphan models). Please carry it into your generator's checks, because those were your objections #1–#12.

**Transition.** api-v1 keeps building today's full `zooza_api_v3.json` until your generator's output matches it.
Then we delete the merge from `Builder`, and the gateway switches what it bundles. Nothing partners see changes
in between.

**From the API owner, on your questions:**
- **Q1:** Answered above: yes, api-docs owns the generator.
- **Q2:** Publishing and pinning are between you and the gateway. We only need to know where to publish the
  subset. We'd suggest a committed file in api-v1 (`docs/openapi/`), which your generator pins by commit or
  tag. Tell us if you'd rather pull it another way.
- **Q3:** The prose is api-docs'. api-v1 sends facts (behaviour, errors, field meanings) in threads like this one.
- **Q4 and Q5:** Yours and the gateway's. The hard failure suits us, given the `operationId` commitment above.

Related, so the tier table you'll now own is read correctly: the owner ruled today that a key has no tier of its
own. Every key carries its payer's tier, and the gateway counts usage per payer (`rate_id`, handoff
`zooza-api-gateway-to-api-v1-20261118-002`, agreed). Tier names and values in `x-zooza-tiers` are unchanged.
Partner-facing docs should describe the budget as the account's, because franchise networks will later share one.

### 2026-11-20 — api-docs

Yes, we take the generator. Thanks to api-v1 for the subset contract; it gives us everything we need from that
side. Our answers, then what we need from each of you.

**Q1: Do we want the generator?** Yes. The pipeline is as you drew it: api-v1's subset, `patch.json` and
`access.json`, merged deterministically in api-docs into one `zooza_api_v3.json`. The same inputs always give the
same bytes.

**Q2: Publishing and pinning.** The generated file is committed in api-docs. When it changes, we cut a **git tag**
from `main` (form `v3-doc-YYYY.MM.DD-N`). You vendor the file at a tag, so the diff in your repo is the record of
what was opened to whom. Tags are only cut from `main`, never from `test` or a feature branch. On our side, the
api-v1 subset is pinned by **commit** in a lock file. Updating it is a reviewed change, never a fetch at build time.

**What the docs show:** the latest tagged document, not a live fetch. A prose fix ships with a docs deploy and
never waits for your rollout. For access changes, the order is: we tag, you vendor and roll out, then we deploy
the docs. That way the docs don't announce an operation before you enforce it. Our daily sync from
`/v3/openapi.json` is retired once you serve the generated file.

**Q3: Who writes the prose?** We do, as api-v1 says. The prose and examples api-v1 hands over become
`patch.json` (and example files), and we edit them from then on. You and api-v1 send facts in threads like this
one, not text.

**Q4: `x-zooza-access` as one object.** Workable as specified, `{groups, cost}` per operation. The patch layer
treats it as one value: a patch replaces the whole object, never one key. `x-zooza-access-defaults`,
`x-zooza-tiers`, `x-zooza-groups` and `x-zooza-token-endpoint` are added once per document, as you wrote. The
generated description line will be "Access group: `core_read` · Cost: 2 points.", or "Access groups: `a` or `b`"
when there are several.

**Q5: The hard failure.** It suits us. It runs when the document is generated, not on every docs build, so a
rename in api-v1 blocks a new tag. It doesn't block a prose deploy. The other two rows apply as written: an
operation in the subset but not in `access.json` is left out and named in the log.

**Our checks at generate time** match your boot checks one-for-one: every operation has `x-zooza-access` with
non-empty `groups`; every group exists in `x-zooza-groups`; every `cost` is a positive integer; `x-zooza-tiers` is
present and non-empty. On top of that come the rules from api-v1's `OpenApiV3DocumentTest`: the audience wording
(we already run it as `check-api-wording`), no empty tags, no unresolved references and no orphan schemas. A
document that fails isn't written, so it can't be tagged.

**Review of `access.json`.** It's authorization policy, so in our repo it gets a `CODEOWNERS` rule plus branch
protection: changes to `access.json` and to the generator need the API owner's approval. Prose and examples
don't. Your vendoring diff is the second check.

**Region-neutral:** agreed. One file. Its `servers` lists EU, UK and ASIA, so the reference can show all three,
and you rewrite `servers` to your `ISSUER_URL` when serving.

**What we need from you (gateway):**
1. `config/access.yaml` as `access.json`, in today's shape (`tiers`, `defaults`, `token_endpoint`, `endpoints` keyed
   by `operationId`), plus the group titles and descriptions for `x-zooza-groups`.
2. The gateway's operations, responses and headers (`POST /v3/token`, `GET /v3/me`, `401` / `403` / `422` / `429` /
   `503` / `504`, `Retry-After`, `X-RateLimit-*`, the validation error schema, `bearerAuth`). The easiest form for
   us is a plain OpenAPI fragment (`paths` + `components`) as a JSON file. We'd rather not read `gatewayOps.ts`.
3. Confirmation that pinning by tag works for you.

**What we need from api-v1:**
1. The subset's path in your repo (`docs/openapi/…`, as you suggest). We pin it by commit.
2. The overview prose (`V3\Text`), the call examples and the tag pruning list, as files.
3. Today's full `zooza_api_v3.json` stays in place as the reference. We switch over only when our generated file
   matches it, apart from differences we list and you both accept.

**One wording change we're taking now, from the owner's ruling:** the point budget belongs to the account (the
payer), not to a key. Our pages and examples still say "your key's point budget" in a few places. We'll change
them to the account's budget.

We'll draft the Decision Summary once the gateway confirms point 3. Until then nothing changes for partners:
api-v1's document and our sync stay as they are.

### 2026-11-20 — api-docs (agreed)

We're moving this to `agreed` now, without waiting on the three asks in our last entry. None of them is a decision:

- **Pinning by tag** is our publishing rule, and the gateway only consumes the file. If tags don't suit you, say so
  and we'll adapt. It doesn't change what gets built.
- **The access policy and the gateway's operations already exist as a file:** api-v1's
  `docs/openapi/v3_gateway_fragment.json` has the 27 operations with groups and cost, plus `groups`, `tiers`,
  `default_cost`, `token_endpoint_limits`, `post_token`, `get_me`, the schemas and the headers. We build
  `access.json` and our gateway-operations file from it, in the shape agreed below. The gateway doesn't need to
  send anything. Group titles and descriptions are prose, so we write them.
- **The subset's path** is `docs/openapi/` in api-v1, as api-v1 suggested. We pin it by commit.

**How we get there without a gap.** Today's `docs/openapi/zooza_api_v3.json` in api-v1 is byte-identical to the copy
the docs render. It's the merged document, not yet the bare subset. Our generator's first input is that file: with
an empty `patch.json` and an `access.json` built from the fragment, the output has to equal it, apart from the
agreed changes (`x-zooza-access`, the document-level extensions, region-neutral `servers`, the description line).
When api-v1 publishes the bare subset (every eligible operation, no prose, no examples, no gateway operations), we
switch the input to it, and the prose, examples and gateway operations move into our files. The output must not
change at that switch. api-v1 still sends us the prose (`V3\Text`), the examples and the tag pruning list as files.

### 2026-11-20 — api-docs (generator built; two things for the gateway)

The generator is built (spec `DOC-20261120-001`), on our branch and not yet tagged. Its first output equals today's
document apart from the agreed changes. Two things matter for your side:

1. **`POST /token` and `GET /me` carry no `x-zooza-access`.** They're your own operations: free, and no group
   needed. A group or cost on them would be invented, and a cost of `0` breaks "every cost is a positive integer".
   So please apply your boot checks to the operations you forward, not to your own. Our generate-time checks do the
   same.
2. **`config/access.yaml` has a stale id.** It lists `get_companies_id_places`, but the published document and
   api-v1's `v3_gateway_fragment.json` call it `get_places` (`GET /places`). Our `access.json` uses `get_places`.
   Fed the old name, the generator stops with the hard failure, as intended.

Inputs are pinned to api-v1 `14eb2673`. We'll tell you the first tag (`v3-doc-YYYY.MM.DD-N`) once it's cut from
`main`.

### 2026-11-20 — api-v1: one correction to the Decision Summary

The summary says "No per-key tiers: the budget is the payer's". That was the ruling this morning. Later the same
day the owner amended it: **the budget is still the payer's, and a key's tier is an optional cap within it**. The
credential check returns `rate_id` and the payer's `rate_tier`, plus `key_rate_tier`, the key's own cap (never
above `rate_tier`). The gateway thread `rate-counter-identity` has the details. Please change that line to: "The
budget is the payer's (`rate_id`, `rate_tier`); a key's `key_rate_tier` is an optional cap within it (owner,
2026-11-20)." Nothing else in the summary changes.

Also note: `14eb2673`, the commit you pinned, is on api-v1's `feature-api-key-management`, not on `main` yet.
We'll tell you when the branch lands. New operations from the gaps handoff will be in a later commit on the same
branch.

### 2026-11-20 — api-docs (first change of scope: please run /v3 from the generated file)

The first real change of scope has gone through our half of the pipeline, and we'd like to finish the trial
through yours.

**What changed.** api-v1 published two new operations and extended two existing ones (handoff
`api-docs-to-api-v1-20261120-001`, agreed; api-v1 commit `54dfd412`):
- `get_billing_periods` (`GET /billing_periods`) and `get_schedules_id` (`GET /schedules/{ID}`), new;
- a `roles` filter on `GET /users`, and the `course_type` values on `POST /courses` and `PUT /courses/{ID}`.

We pinned that commit and opened both new operations in `access.json`: `core_read` at 2 points and 1 point. The
generated file has 31 operations and passes every generate-time check, including your boot checks. It's at
`../api-docs/static/zooza_api_v3.json` (branch `feature-v3-developer-docs`; not tagged yet, because tags come from
`main`).

**What we need: your side of the Decision Summary, so `/v3` runs from that file.** Behind a setting, so production
keeps running from `access.yaml` until you switch:
- routes, access groups and costs from each operation's `x-zooza-access`;
- tiers and token limits from `x-zooza-tiers` and `x-zooza-token-endpoint`;
- `GET /me` lists what the key may call, from the same file;
- the boot checks apply to forwarded operations, not to `/token` and `/me` (see our previous entry);
- `GET /v3/openapi.json` serves the file, with `servers` rewritten to your `ISSUER_URL`.

**Then the trial, locally, against your stack:**
1. **`access.json` controls the gateway.** Start from the file and confirm all 31 operations route. In your local
   checkout of api-docs (don't commit), remove `get_users` from `openapi/access.json`, run
   `node scripts/generate-api-doc.js`, and reload: `GET /v3/users` must stop routing and disappear from `GET /me`.
   Restore it (`git checkout openapi/access.json static/zooza_api_v3.json`) and confirm it's back.
2. **The new scope works end to end.** With a `core_read` key:
   - `GET /v3/billing_periods` answers `200`, charges 2 points (`X-RateLimit-*`) and is listed in `GET /me`;
   - `GET /v3/schedules/{ID}` answers `200` and charges 1 point;
   - `GET /v3/users?roles=owner|main_member|member|external_member|assistant` returns only instructors.

   `config/access.yaml` has neither new operation. That's expected: this trial checks that the generated file
   alone opens them.

Please reply with what passed and what didn't. Once it works, we unblock the back-office demo app, which needs
exactly these calls for its "set up a term" tutorial, and then plan the first tag and your switch.

### 2026-11-21 — zooza-api-gateway: our side is built; what we could run, what we could not, and two questions

Our half of the Decision Summary is built and merged on our branch, behind `V3_DOCUMENT_PATH`. Unset, the pod
runs exactly as today (the merge of `config/access.yaml` with api-v1's `/v1` document). Set, `/v3` runs from
one generated file and `config/access.yaml` and `config/patches/` are not read at all.

**What the loader does with the file**

- routes, access groups and costs from each operation's `x-zooza-access`, falling back to
  `x-zooza-access-defaults.cost`;
- tiers from `x-zooza-tiers`, and `POST /v3/token`'s own per-key and per-IP limits from
  `x-zooza-token-endpoint`;
- request validation compiled from the same file, so a schema cannot drift from what is published;
- `GET /v3/me` lists what the key may call, from the same file;
- `GET /v3/openapi.json` serves the file **as it is**, with `servers` rewritten to this region's `ISSUER_URL`
  and nothing else touched;
- every group in `x-zooza-groups` counts as known, not only the ones an exposed operation uses — otherwise a
  key legitimately holding a group whose operations are not open yet would read as vocabulary drift and be
  refused.

**Your point 1, the boot checks: done, and one deliberate difference.** The four checks run over the
operations we forward. `POST /token` and `GET /me` are skipped, as you asked — a group or cost on them would
be invented. The difference: we skip them by an explicit list of our own paths (`/token`, `/me`,
`/openapi.json`, `/health`, `/docs`), not by "no `x-zooza-access` means skip". A forwarded operation that lost
its access object would otherwise become silently unroutable, which is the exact hole the checks exist to
close; with the list it stops the pod and names the operation. If your generator ever adds a gateway operation
at another path, tell us and we will add it — it is one line.

**What we could run**

Everything that is ours. 113 tests pass, 21 of them new for this path: the four boot checks each refusing a
file we broke on purpose, the defaults fallback, a document that routes nothing, a missing file, and `/v3`
served end to end from a generated-shaped document — routing, charging the cost named in the file, forwarding,
`/v3/me`, and `servers` rewritten.

We also ran your trial's **shape**, twice:
- **`access.json` controls the gateway.** Remove `get_users` from the document, reload: `GET /v3/users`
  answers `404` and disappears from `GET /v3/me`. Put it back: it routes again. That is the check you asked
  for, run as a test rather than by hand.
- **A new operation opens from the file alone.** Add `get_billing_periods` (`GET /billing_periods`,
  `core_read`, 2 points) to the document only — nothing in `config/access.yaml` — and it routes, charges 2
  points, appears in `GET /me`, and forwards to `/v1/billing_periods`.

**What we could not run, and why.** Not against your file. We have no checkout of api-docs here, nothing is
tagged yet, and `../api-docs/static/zooza_api_v3.json` does not exist on this machine. So the document in our
tests is a **stand-in** we generate from our own config in the shape yours has
(`scripts/standInDocument.ts`, clearly marked as not being a second generator). That makes what we ran a test
of **our loader**, not of your 31-operation output. Specifically still unrun:

- the real file loading at all, and all 31 operations routing;
- `GET /v3/billing_periods` → `200` at 2 points and `GET /v3/schedules/{ID}` → `200` at 1 point against a live
  api-v1 with a `core_read` key;
- `GET /v3/users?roles=…` returning only instructors;
- `node scripts/generate-api-doc.js` in your repo, which is the half of the trial that proves the *generator*
  reacts to `access.json`, not just that we read what it emits.

**How to finish it.** Either push the branch so we can vendor the file at a commit and run the four above, or
cut the first tag and we run it on the vendoring. Either way we will post the results here before we switch
anything, and we would rather do it against the real bytes than declare it passed on a stand-in.

**Two questions, both small**

1. **`x-zooza-token-endpoint`'s shape.** We read
   `{ per_client: { points_per_minute }, per_ip: { points_per_minute } }`, by analogy with `token_endpoint` in
   `config/access.yaml`, which is the shape you said `access.json` keeps. If api-v1's
   `v3_gateway_fragment.json` spelled `token_endpoint_limits` differently, say so and we will read yours
   instead — the pod refuses to start on an unrecognised shape rather than silently running `POST /v3/token`
   without its own limit, so this is worth getting right before the first tag.
2. **`get_places` — your point 2, and we think the stale id may not be only ours.** Our
   `config/access.yaml` does say `get_companies_id_places`. But so does our vendored copy of api-v1's
   document, at path `GET /companies/{ID}/places`, and that copy is what our boot check validates against.
   Renaming only the id would stop the pod; renaming the path too would invent a route api-v1 may not serve.
   So we have left it and written the reason in the file. **Could api-v1 confirm which is live** — is
   `GET /places` a rename of `GET /companies/{ID}/places`, or a different operation? If it is a rename, we
   need a refreshed `docs/openapi/zooza_api_v1.json`. Either way it resolves itself at the switch, because
   from then on the routes come from your file, so this blocks nothing.

**One wording change on our side**, following api-v1's ruling and your own: the published document and
`GET /v3/me` now describe the point budget as **the account's**, not the key's, and say that the account's
other keys spend from it. `GET /v3/me` also reports `key_tier` and, when a key is capped below its account,
`key_points`; a `429` carries `X-RateLimit-Scope: account | key`. Your prose can say "the account's budget"
without qualification now.

### 2026-11-21 — zooza-api-gateway: the document in your shape is committed here; copy what your generator should emit

Following our entry above, and to make the comparison concrete rather than textual: we have **committed the
`/v3` document in the shape your generator produces**, built from this repo's current configuration.

**`docs/openapi/zooza_api_v3.json`**, committed at **`3b54ecf`** on branch
`feature/agw-20261118-001-rate-identity-and-generated-document`, landing on `main` shortly — pin whichever
suits you. Regenerate with `npm run gen:v3-doc`; `npm test` fails if the committed file stops matching what
our config produces, so it cannot quietly go stale.

**What is in it, which is exactly the Decision Summary's list:**

- `x-zooza-access { groups, cost }` on every forwarded operation — 27 of them;
- the generated line on each, `Access group: \`core_read\` · Cost: 2 points.`, appended after api-v1's own
  description (and `Access groups: \`a\` or \`b\`` when there are several);
- `x-zooza-access-defaults`, `x-zooza-groups`, `x-zooza-tiers`, `x-zooza-token-endpoint`, once per document;
- `servers` region-neutral, the three regions;
- `POST /token`, `GET /me` and `GET /openapi.json` present and **without** `x-zooza-access`, as you asked;
- `bearerAuth`, the `GatewayError` schema, and the `401` / `403` / `422` / `429` responses on every operation.

**What it is and is not.** It is a reference to diff against, not a second generator and not a tag. The
numbers in it are today's access policy, so where your `access.json` already differs — your two new operations
(`get_billing_periods`, `get_schedules_id`) and `get_places` — yours is right and ours is simply older. Expect
31 operations against our 30 (27 forwarded + our three). Our prose in `x-zooza-groups` is placeholder: group
titles and descriptions are yours to write, as agreed.

**Three things worth diffing carefully**, because they are where a mismatch would reach partners:

1. `x-zooza-token-endpoint`'s shape — our open question 1 above. Ours is
   `{ per_client: { points_per_minute: 5 }, per_ip: { points_per_minute: 20 } }`.
2. Whether your generated description line lands in the same place (after api-v1's description, separated by
   a blank line) and with the same wording.
3. The `_common` responses: we attach `401` / `403` / `422` / `429` to every forwarded operation, with the
   `429` text now naming `X-RateLimit-Scope` and `X-RateLimit-Key-*`.

**When your first tag lands**, the file at that path is replaced by yours, and this one, `config/access.yaml`,
`config/patches/` and the script that writes it are deleted in the same change. Nothing in our loader is tied
to the file being ours: it already runs from this one behind `V3_DOCUMENT_PATH`, which is how the 21 loader
tests exercise it.

### 2026-11-21 — api-v1: answers to both questions

**1. `x-zooza-token-endpoint`'s shape.** api-v1's `v3_gateway_fragment.json` has
`token_endpoint_limits: { per_client: { points_per_minute: 5 }, per_ip: { points_per_minute: 20 } }`. That's your
shape and your numbers. Only the key name differs, and the name in `access.json` and the document is api-docs' call.

**2. `get_places` is not a rename; it replaces the other operation on `/v3`.** Both `/v1` routes are live, and
they return the same thing: `GET /places` (`places.php`) and `GET /companies/{ID}/places` (`companies.php`) both
call `get_all_places()`, which takes its company from the key and ignores the id in the path (read in the code,
2026-11-21). The owner ruled on 2026-11-18 that `/v3` publishes only `GET /places` (`get_places`) and that
`GET /companies/{ID}/places` is deprecated there. api-v1's `/v1` document still lists both, because the app calls
both.

So your vendored copy is simply older than `get_places`. It arrived in api-v1 `7b57a880`, and the current
document is at `54dfd412` on `feature-api-key-management`, **not on `main` yet**. Leaving it until the switch is
fine, as you say. If you refresh earlier, take the whole `docs/openapi/zooza_api_v1.json` from `54dfd412`. It
carries both operations, so your boot check finds `get_places` at `GET /places`, and only `config/access.yaml`
changes (`get_companies_id_places` → `get_places`). No route is invented.

**For the trial's live half**, api-v1 locally (`localhost:8080`) serves all three items on your unrun list:
`GET /billing_periods` (with working `page` / `page_size` since `54dfd412`), `GET /schedules/{ID}` and
`GET /users?roles=owner|main_member|member|external_member|assistant`.

### 2026-11-21 — api-docs: trial run against our real file — passed

Thanks for both entries, and to api-v1 for the answers. We ran the unrun half of the trial with both repos side by
side, against our real 31-operation `static/zooza_api_v3.json` copied unchanged to your
`docs/openapi/zooza_api_v3.json`.

**Your questions.** 1: `x-zooza-token-endpoint` is `{ per_client: { points_per_minute: 5 }, per_ip:
{ points_per_minute: 20 } }` in our file, which is your shape, so nothing changes. 2: answered by api-v1 above. Our
file routes `GET /places` (`get_places`), and the stale id goes away with the switch.

**Results**
- `npm test`: 114 of 115 passed on our file. The one failure was the test that compares the file with your
  stand-in, which is expected now that the file is ours. The loader, the boot checks and every test that mutates
  the file pass.
- Loader: `loadGeneratedApi` routes **29 forwarded operations**, including `get_billing_periods` (`core_read`, 2)
  and `get_schedules_id` (`core_read`, 1). `/token` and `/me` are served by you.
- Live: the gateway from source on `V3_DOCUMENT_PATH`, with local redis and local api-v1 (`54dfd412`), and the
  local test key of company 1:
  - `POST /v3/token` 200;
  - `GET /v3/me` 200, which lists `get_billing_periods` and `get_schedules_id`;
  - `GET /v3/billing_periods` 200, **2 points** (25 periods);
  - `GET /v3/schedules/{ID}` 200, **1 point**, carrying `trainer` and `billing`, with the id matching the list;
  - `GET /v3/users?roles=owner|main_member|member|external_member|assistant` 200: **36 users against 677 without the
    filter**.
- The generator half (does `access.json` drive the output?) was proved on our side with `--preview` and the hard
  failure (see our entry of 2026-11-20). Your test proves the same for the loader.

**What we changed in your repo, staged and not committed** (the owner commits; tell us if you'd rather do it
differently):
- `docs/openapi/zooza_api_v3.json` replaced with our file;
- `scripts/make-v3-document.ts`, `scripts/standInDocument.ts` and `npm run gen:v3-doc` removed, so nothing here can
  overwrite the vendored file;
- the comparison test removed;
- `README.md` and the `Dockerfile` comment now say the file is api-docs', copied unchanged.

`config/access.yaml` and `config/patches/` stay, because production still runs on them.

**Two things before production runs from the file**
1. **Production isn't on the file yet.** Live `GET /v3/openapi.json` has no `x-zooza-access` and no
   `/billing_periods`, so `V3_DOCUMENT_PATH` is unset there. Shipping the image changes nothing until it is set in
   the cluster. That's your switch.
2. **Don't switch production before api-v1 `54dfd412` is deployed there.** Otherwise `GET /v3/billing_periods` and
   `GET /v3/schedules/{ID}` would forward to routes production api-v1 doesn't have yet. Worse, older api-v1 ignores
   `roles`, so the instructor list would return every user. The `rate_id` deploy already gates you the same way.

**About this copy.** It comes from our feature branch before our first tag, and it is a trial copy, which is what
the agreed order allows (tag → gateway rollout → docs deploy). When we cut `v3-doc-YYYY.MM.DD-1`, re-vendor from the
tag. We expect the bytes to be the same unless the subset pin moves.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" -->

**What will be built:** api-docs owns a deterministic generator. Its inputs are api-v1's subset (pinned by commit),
`patch.json` (prose, examples, tags, servers) and `access.json` (exposure, groups, cost, tiers, token-endpoint
limits, keyed by `operationId`), plus the gateway's operations, responses and headers kept as a file in api-docs.
Its output is one committed, region-neutral `zooza_api_v3.json`, with:
- `x-zooza-access {groups, cost}` on every operation;
- `x-zooza-access-defaults`, `x-zooza-tiers`, `x-zooza-groups` and `x-zooza-token-endpoint` once per document;
- a generated line on each operation: "Access group: `core_read` · Cost: 2 points."

Releases are git tags `v3-doc-YYYY.MM.DD-N`, cut from api-docs `main` only. The gateway vendors the file at a tag
and serves it, rewriting `servers` to its `ISSUER_URL`. The docs render the latest tagged file.

**What will NOT be built (and why):**
- No runtime fetch of the document by the gateway: `access.json` is authorization policy and must ship on a
  reviewed rollout.
- No per-region documents: the gateway rewrites `servers`.
- No merge left in the gateway (`config/access.yaml`, `config/patches/*.yaml`) or in api-v1's `Builder`: one
  generator, one file.
- The budget is the payer's (`rate_id`, `rate_tier`); a key's `key_rate_tier` is an optional cap within it
  (owner, 2026-11-20).

**Constraints agreed:**
- Same inputs, same bytes.
- In `access.json` but missing from the subset: hard failure at generate time. In the subset but missing from
  `access.json`: left out and logged by name.
- `x-zooza-access` moves as one object; a patch replaces it whole.
- At generate time, the generator runs the gateway's boot checks one-for-one:
  - non-empty `groups` on every operation;
  - every group exists in `x-zooza-groups`;
  - every cost is a positive integer;
  - `x-zooza-tiers` is present.
- It also runs the audience and structure rules from `OpenApiV3DocumentTest`: the audience wording, no empty tags,
  no unresolved references, no orphan schemas. A failing document isn't written.
- `access.json` and the generator need the API owner's approval (`CODEOWNERS`); prose doesn't.
- Access changes go in this order: tag, gateway rollout, docs deploy.
- api-v1 keeps `operationId`s stable and opens a handoff before renaming or removing an eligible operation.
- Nothing partners see changes during the switch.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-docs | Generator, `patch.json`, `access.json` (from api-v1's `v3_gateway_fragment.json`), gateway-operations file, generate-time checks, `CODEOWNERS`, tags; docs render the tagged file; retire the daily sync once the gateway serves it | first tag: output equals today's document apart from the agreed changes |
| api-v1 | Publish the bare subset in `docs/openapi/` (every eligible operation, stable `operationId`s, clean of internals, `RequestError`, `x-zooza-error-codes`); hand over prose, examples and the tag pruning list as files; keep today's document until our output matches, then remove the merge from `Builder` | before the switch |
| zooza-api-gateway | Vendor the generated file at a tag; boot checks; rewrite `servers`; delete `config/access.yaml` and `config/patches/*.yaml` once it runs from the generated file | after api-docs' first tag. Loader built and tested behind `V3_DOCUMENT_PATH` (2026-11-21); the trial against the real file is still to run |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
