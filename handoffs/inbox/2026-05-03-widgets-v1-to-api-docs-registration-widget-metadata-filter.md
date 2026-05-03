---
handoff_id: widgets-v1-to-api-docs-20260503-002
from: widgets-v1
to: api-docs
status: open
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

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:**
**What will NOT be built (and why):**
**Constraints agreed:**
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---|---|---|
| api-docs | … | … |
| widgets-v1 | … | … |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
