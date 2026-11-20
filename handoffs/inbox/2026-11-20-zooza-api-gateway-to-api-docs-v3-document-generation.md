---
handoff_id: zooza-api-gateway-to-api-docs-20261120-001
from: zooza-api-gateway
to: api-docs
status: in_discussion
created: 2026-11-20
updated: 2026-11-20
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


---

## Decision Summary
<!-- Filled in when status moves to "agreed" -->

**What will be built:**
**What will NOT be built (and why):**
**Constraints agreed:**
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| zooza-api-gateway | ... | ... |
| api-docs | ... | ... |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
