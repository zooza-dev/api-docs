---
handoff_id: widgets-v1-to-api-docs-20260503-002
from: widgets-v1
to: api-docs
status: agreed
created: 2026-05-03
updated: 2026-05-03
related_specs:
  - "API-20260502-001"
  - "W1-20260501-001"
related_handoffs:
  - "2026-05-03-api-v1-to-widgets-v1-registration-widget-metadata-filter.md"
  - "2026-05-03-widgets-v1-to-api-docs-registration-widget-label-filter.md"
  - "2026-05-01-widgets-v1-to-api-docs-registration-list-renderers.md"
---

## Request

### What we need

Document two new embed-config options on the registration widget that let an embedder filter the course list by **typed metadata key/value pairs**, alongside today's id-based filters (`course_ids` / `place_ids` / URL `course_id` / `place_id` / `schedule_id`) and the recently-shipped name-based label filters (`labels_in` / `labels_not_in`):

- **`metadata_in`** — show only courses whose metadata matches at least one of N values for one or more keys.
- **`metadata_not_in`** — hide courses whose metadata matches any of N values for one or more keys.

Both options compose with each other and with every existing filter (additive AND). They map to the bracket-array query params `meta_in[<key>]` / `meta_not_in[<key>]` on `GET /v1/courses` (api-v1 spec **API-20260502-001**), which the widget emits one entry per metadata key.

### Why we need it

Once api-v1 spec **API-20260502-001** ships, tenants get a typed key/value store on courses (e.g. `color=red`, `age_band=6-8`, `featured=true`). Embedders need to be able to carve the rendered course list by any metadata dimension a tenant exposes — same product motivation as `labels_in` / `labels_not_in`. Until this surface is documented, the option effectively doesn't exist for tenants writing embed code.

The api side automatically delivers a `metadata` array on each course in the `GET /v1/courses` payload (visible-only entries; private keys are filtered server-side). Read-side rendering of metadata on tiles is intentionally out of scope for this handoff — see the **What's NOT in scope** section below.

### Constraints from our side

- The page section conventions in `docs/widgets/registration-widget.md` should be respected — these are additions to the existing **Initialisation options** layout, not a rewrite.
- All code examples must be generic English. Do not copy strings from any tenant's branding.
- The widget enforces nothing about metadata itself — the api-v1 server is authoritative on visibility (private keys never match for widget callers, silently). The docs should reflect the user-visible behaviour without overstating it.
- The widget passes keys and values through **verbatim**, no normalisation / no lowercasing / no URL-encoding. Same wire convention as every other widget filter today.
- Sits next to the surface from handoff `widgets-v1-to-api-docs-20260503-001` (label filtering) and `widgets-v1-to-api-docs-20260501-001` (display modes / per-tile renderers). Filtering concern, not a display option.

### How we imagine it — open to challenge

Two new entries under **`## Initialisation options`**, each shaped like the existing `labels_in` / `labels_not_in` and `course_ids` / `place_ids` entries — these are the closest neighbours.

**Behavioural facts the docs should convey:**

| Fact | Detail |
|---|---|
| Where it can be set | JavaScript: `window.ZOOZA.metadata_in`, `window.ZOOZA.metadata_not_in`. URL query: `?metadata_in[<key>]=v1\|v2&metadata_not_in[<key>]=v1\|v2`. Precedence: `window.ZOOZA` → URL → unset. **First non-empty source wins; sources are not merged.** |
| Value shape (JS) | Object keyed by metadata key; per-key value is either an array of strings (`{ color: ["red", "blue"] }`) **or** a pipe-delimited string (`{ color: "red\|blue" }`). |
| Value shape (URL) | One bracketed query param per metadata key, value is pipe-delimited (`?metadata_in[color]=red\|blue&metadata_in[size]=l`). PHP-style bracket syntax. |
| Match rules | Keys and values match exactly against the company's metadata catalogue (case-sensitive, including whitespace and punctuation). `metadata_in` returns courses whose `<key>` is one of the listed values (per key); `metadata_not_in` excludes courses whose `<key>` is one of the listed values (per key). Multiple keys compose as AND across keys. |
| Empty values | Empty per-key array, empty per-key string, or omitted → that key is dropped from the wire (no filter on that key). Empty top-level config → no metadata params sent. |
| Visibility | Private (admin-only) metadata keys never match for embedders, silently. There is no client-visible distinction between "key doesn't exist" and "key exists but is private" — both produce zero matches for that key. Mention this so embedders aren't surprised when results vanish after a key is unpublished. |
| Composition | Both options compose with each other (AND across keys), and with every existing filter (`course_ids`, `place_ids`, `schedule_id`, `labels_in`, `labels_not_in`, `ref`) — also AND. |
| Special characters | Pass-through verbatim. The widget does not URL-encode keys or values. Tenants should avoid putting `&`, `=`, `#`, or `+` inside a metadata key or value if that key is going to be reachable via the URL form — same risk surface as labels and ids. JS form is unaffected. |

**Example surfaces** the docs page should show (rough sketch — restructure to match the page's existing example conventions):

```html
<!-- JavaScript config -->
<script>
  window.ZOOZA = {
    metadata_in:     { color: [ "red", "blue" ], age_band: "6-8" },
    metadata_not_in: { archived: [ "true" ] },
  };
</script>
```

```
# URL query string
?metadata_in[color]=red|blue&metadata_in[age_band]=6-8&metadata_not_in[archived]=true
```

If the page's existing structure groups all course-list-related options together, fold these in next to `labels_in` / `labels_not_in` (closest neighbour). Filtering concern, not a display option.

### What's NOT in scope

- **Read-side rendering of metadata on tiles.** The `metadata` array now arrives on every course in the `GET /v1/courses` payload, but its visual surface (badges, pills, etc.) is not part of this handoff. Embedders who want to read it from a custom `render_course_tile` callback may do so off the underlying course object, but it is **not** part of the stable callback param contract documented in `widgets-v1-to-api-docs-20260501-001` (which lists `id`, `name`, `description`, `course_type`, `registration_type`). If embedder demand surfaces, we'll open a separate handoff to promote `metadata` into the stable contract.
- **The legacy `?labels=<id>|<id>` filter** — separate, untouched mechanism. Don't rewrite it.
- **`document.zooza` legacy property names.** Per the alignment we reached on `widgets-v1-to-api-docs-20260503-001`, `document.zooza` is supported by the runtime but not promoted in new docs. The widget reads `document.zooza.filter_metadata_in` / `filter_metadata_not_in` for parity with other legacy options, but the docs page should only show `window.ZOOZA` (JS) and the URL form. Legacy form lives on, undocumented.
- **WordPress shortcode tab.** WP plugin doesn't expose metadata filters this release; can be added later via a fresh handoff if/when the WP team ships it.

---

## Discussion

<!-- replies appended here, format: ### {YYYY-MM-DD} — {project} -->

### 2026-05-03 — api-docs

Three conventions land cleanly (no `document.zooza`, no WP tab, slot near `labels_in` / `labels_not_in`) — accepted as-proposed. One firm push-back, two clarifications, and a note about renderer-contract spillover before we can move to `agreed`.

**1. Push-back: `metadata` MUST be in the stable `render_course_tile` `course` param contract.** This is a product-owner call from our side, not a docs preference. The same product motivation that drives `metadata_in` / `metadata_not_in` (carving the visible course list by metadata dimension) also drives surfacing those values *visually* in tiles — badges for `featured`, age-band labels, color swatches, anything. If embedders cannot rely on `course.metadata` from the per-tile callback, the metadata feature is half-shipped from a tenant POV: filterable but not displayable without unstable tricks. Concretely: please promote `metadata` to the Q4 stable list from handoff `widgets-v1-to-api-docs-20260501-001` (currently: `id`, `name`, `description`, `course_type`, `registration_type`).

This has spillover into that handoff's already-agreed Decision Summary, which currently lists `metadata` in **What will NOT be built**. When you confirm the promotion here, we'll handle the delta inside *this* handoff (single source of truth for the metadata feature) and amend the renderer docs to add the `metadata` row in the same PR. No need to retroactively edit the renderer handoff's Decision Summary — flag the supersession in this handoff's Decision Summary instead.

**2. Clarification — shape of `metadata` on the course object.** For us to document the stable accessor, please specify the exact shape:
   - Array of objects? (`[{ key, value }, …]`)
   - Plain map? (`{ color: "red", age_band: "6-8" }`)
   - Multi-value handled how? (per-key array, or one entry per `(key, value)` pair?)
   - Is `value` always a string, or typed (string / number / bool)?

We'll mirror your choice exactly in the docs — but the stable contract needs to name this, otherwise embedders will guess and we'll all regret it later.

**3. Clarification — URL encoding when the widget builds the api request.** The "verbatim pass-through" is clear for **URL-as-user-input** (someone typing `?metadata_in[color]=red|blue` into the address bar). The ambiguity is **URL-as-widget-output**: if a user sets `window.ZOOZA = { metadata_in: { color: "red&blue" } }` in JS, what does the widget send to `GET /v1/courses`? Confirming "the widget URL-encodes when constructing the api request from JS-form values" would let us add a one-liner so embedders know JS form is safe for special characters even if URL-as-input is fragile.

**4. Acceptances:**
   - No `document.zooza` in new docs ✓
   - No WP tab ✓
   - Slot under `## Initialisation options` between `labels_not_in` and `course_list_collapse_on_select` — filtering concern, mirrors `labels_in` / `labels_not_in` exactly ✓
   - Match rules / composition / private-keys-silent-zero-match behaviour — all align with how we just documented `labels_in` ✓
   - Cross-link to label filter and to the tile-grid display modes ✓

**5. Note — api-v1 backend status (`API-20260502-001`) is not a blocker for us.** Product owner is testing the api-side implementation in parallel. We can land the docs on the same branch as label-filter / renderer docs once the four points above resolve; we won't gate on the api spec flipping to `implemented`.

**Proposed responsibilities for moving to `agreed`** (pending answers to Q1, Q2, Q3):

| Project | Responsibility | Target |
|---|---|---|
| widgets-v1 | Confirm `metadata` promoted to stable `render_course_tile` `course` contract (Q1). Specify shape (Q2). Confirm widget URL-encodes when building the api request from JS-form values (Q3). | Reply on this handoff. |
| api-docs | Page edits in `docs/widgets/registration-widget.md`: two new init-option entries (`metadata_in` / `metadata_not_in`) near `labels_in` / `labels_not_in`, plus add a `metadata` row to the `render_course_tile` Params table once promoted. | Branch `feature-courses-label-filter` — same PR as label-filter / renderer docs. |
| widgets-v1 | Keep runtime aligned with the documented stable shape and URL-encoding semantics. Ping back on this handoff if anything drifts during implementation. | Ongoing. |

---

### 2026-05-03 — widgets-v1

All three points resolved. Moving to `agreed` with the Decision Summary below.

**Q1 — Yes, `metadata` is promoted to the stable `render_course_tile` `course` param contract.** Product owner agrees with your "filterable-but-not-displayable is half-shipped" framing. Spec `W1-20260501-001` is updated to add a `metadata` row to the stable course param table and to log the supersession in the Notes section (date-stamped 2026-05-03). Per your direction, we are **not** retroactively editing the renderer handoff's `agreed` Decision Summary — the supersession is recorded here (in this handoff and in the spec) as the single source of truth, and api-docs adds the `metadata` row to the `render_course_tile` Params table in the same docs PR.

**Q2 — `course.metadata` shape.** Confirmed against an actual `GET /v1/courses` response. Differs from the spec sketch in two ways worth flagging:

- **`value` is typed, not always a string.** The api casts before serialising. `value_type: 'int'` → JS `number` (e.g. `10`, not `"10"`). `value_type: 'string'` → JS `string`. Presumably `'bool'` → boolean and `'json'` → parsed object (we'll confirm if/when those surface). Embedders should branch on `value_type` if they need exhaustive handling.
- **Wire payload includes storage internals** (`id`, `company_id`, `metadata_key_id`, `object_type`, `object_id`, `created`, `updated`) that are not relevant to embedders.

**Stable subset for the contract** (anything outside this is internal/may change without notice):

| Field | Type | Notes |
|---|---|---|
| `key` | string | Metadata key name as authored in admin (case-sensitive). |
| `value` | string \| number \| boolean \| object | Typed per `value_type`. |
| `value_type` | `'string'` \| `'int'` \| `'bool'` \| `'json'` | So embedders can branch on type if needed. |

**Omit `public` from the stable contract** — it's always `true` for widget callers (private keys are server-filtered before serialising), so documenting it gives embedders a field they can't usefully read. If a tenant somehow flips a key from public → private after page load, the widget just stops receiving that entry; there is no `public: false` case to handle on the embedder side.

Multi-value: schema enforces a unique `(object_type, object_id, metadata_key_id)`, so each course has **at most one entry per key**. Embedders looking up `metadata.find(m => m.key === 'color')` will get a single result or `undefined`.

Empty array if the course has no public metadata.

**Q3 — Yes, the widget URL-encodes JS-form values when building the api request.** As of this handoff's implementation, `meta_in[<key>]` and `meta_not_in[<key>]` parameters now run both the bracketed key and the value through `encodeURIComponent` before joining the wire. So `window.ZOOZA = { metadata_in: { color: "red&blue" } }` lands on the wire as `?meta_in[color]=red%26blue`, which PHP decodes to `$_GET['meta_in']['color'] = 'red&blue'` correctly. Pipes round-trip cleanly (`|` → `%7C` → `|` after PHP decode → api splits). **JS form is safe for all special characters** — `&`, `=`, `+`, `#`, spaces, punctuation. **URL form is unchanged** — embedders writing the URL by hand still need to encode themselves (same constraint as today's `?ids=`, `?label_in=`).

This encoding is **scoped to the metadata params only** — the rest of the filter wire (`ids`, `place_id`, `schedule_id`, `ref`, `label_in`, `label_not_in`) is unchanged. Existing filters take ints or short tokens and don't need it; metadata is where free-text tenant-authored values live, so that's where the fix is.

**Branch + PR coordination acknowledged** — api-v1 backend status `API-20260502-001` is not gating you, and a single docs PR batched on `feature-courses-label-filter` (or the chosen final branch name) for label-filter + renderer + metadata-filter doc edits is fine. We'll mirror updates in here if anything drifts on our end.

---

## Decision Summary

**What will be built:**
- Two new init-option entries in `docs/widgets/registration-widget.md` under `## Initialisation options`, slotted between `labels_not_in` and `course_list_collapse_on_select`:
  - `### metadata_in` — show only courses whose metadata matches at least one listed value per key.
  - `### metadata_not_in` — hide courses whose metadata matches any listed value per key.
- Tabs block: JavaScript (`window.ZOOZA`) + URL Query only. No WordPress tab. No `document.zooza` block.
- Documented behaviour:
  - JS shape: object keyed by metadata key; per-key value is array of strings or pipe-delimited string.
  - URL shape: PHP-style bracket-array (`?metadata_in[color]=red|blue&metadata_in[size]=l`).
  - Wire shape (informational): emitted as `meta_in[<key>]=…` / `meta_not_in[<key>]=…` on `GET /v1/courses`.
  - Match rules: keys + values match exactly against admin catalogue (case-sensitive, including whitespace and punctuation). `metadata_in` returns courses where `<key>`'s value is one of the listed values; `metadata_not_in` excludes them.
  - Empty per-key value → that key omitted from the wire. Empty top-level config → no metadata params sent.
  - Private (admin-only) keys silently never match (zero matches for unknown vs. private keys are indistinguishable client-side).
  - Composes (AND) with each other and with every existing filter (`course_ids`, `place_ids`, `schedule_id`, `labels_in`, `labels_not_in`, `ref`).
  - Precedence: `window.ZOOZA` → URL → unset; first non-empty source wins (sources are not merged).
  - JS form is safe for special characters (widget URL-encodes); URL form is raw (embedders writing the URL by hand encode themselves, same as `?ids=` / `?label_in=`).
- Add a `metadata` row to the existing `render_course_tile` Params table for the `course` object — stable subset is `key`, `value`, `value_type`. Note that `value` is typed per `value_type`. Empty array if none. Adds the row in the same docs PR; **supersedes** the renderer handoff's "What will NOT be built" entry — this metadata-filter handoff is the single source of truth for the supersession (renderer handoff Decision Summary stays as-is per api-docs's request).
- One-line cross-link noting that metadata filtering composes with label filtering and the tile-grid display modes.

**What will NOT be built (and why):**
- No `document.zooza` block / `filter_metadata_in` / `filter_metadata_not_in` legacy property names — `document.zooza` is legacy and not promoted for new options. Runtime continues to read them; docs do not mention them.
- No WordPress shortcode tab — WP plugin doesn't expose metadata filters this release.
- No documentation of storage internals on `course.metadata` (`id`, `company_id`, `metadata_key_id`, `object_type`, `object_id`, `created`, `updated`, `public`). Present on the wire today, not part of the stable callback param contract; embedders read them at their own risk.
- No retroactive edit to the renderer handoff Decision Summary (`widgets-v1-to-api-docs-20260501-001`). Supersession is flagged in this handoff and in `W1-20260501-001` Notes — single source of truth here.

**Constraints agreed:**
- Match existing page conventions (`_Type: ..._` italic init-option headers; Tabs block; `:::info` admonitions where useful; generic English copy; no `jQuery(...)` in callback examples).
- Stable callback param contract for `course.metadata` is `key`, `value`, `value_type` — no `public`, no storage internals.
- Existing structure preserved — additions only, no rewrite.
- Precedence simplifies to: `window.ZOOZA` → URL → unset.
- Pipe (`|`) is the per-key value delimiter on the URL form.
- Widget URL-encodes JS-form metadata keys and values; URL form is raw.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---|---|---|
| api-docs | Page edits in `docs/widgets/registration-widget.md`: (a) two new init-option entries `metadata_in` / `metadata_not_in` between `labels_not_in` and `course_list_collapse_on_select`, (b) add a `metadata` row to the `render_course_tile` Params table for the `course` object (`key`, `value`, `value_type`), (c) one-line cross-link to the label filter and tile-grid display modes. Verify anchors on local dev server. Land in the same PR batched with renderer + label-filter doc edits. | Branch `feature-courses-label-filter` (or chosen final name). |
| widgets-v1 | Keep runtime aligned with: (a) the `course.metadata` stable subset (`key`, `value`, `value_type`); (b) the JS-form URL-encoding semantics; (c) the documented precedence (`window.ZOOZA` → URL → unset). Ping back on this handoff if anything drifts during implementation. | Ongoing. |
| widgets-v1 | If `value_type` `'bool'` or `'json'` exhibit unexpected serialisation shape when tenants start authoring them, ping back so docs reflect the actual behaviour. | As needed. |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
