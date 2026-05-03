---
handoff_id: widgets-v1-to-api-docs-20260503-001
from: widgets-v1
to: api-docs
status: agreed
created: 2026-05-03
updated: 2026-05-03
related_specs:
  - "API-20260502-002"
  - "W1-20260501-001"
related_handoffs:
  - "2026-05-03-api-v1-to-widgets-v1-registration-widget-label-filter.md"
  - "2026-05-01-widgets-v1-to-api-docs-registration-list-renderers.md"
---

## Request

### What we need

Document two new embed-config options on the registration widget that let an embedder filter the course list by **label name** (in addition to today's id-based `course_ids` / `place_ids` / URL `course_id` / `place_id` / `schedule_id` filters):

- **`labels_in`** — show only courses tagged with at least one of the listed labels.
- **`labels_not_in`** — hide courses tagged with any of the listed labels.

Both options compose with each other and with the existing id-based filters. They map directly to the `label_in` / `label_not_in` query params on `GET /v1/courses` (api-v1 spec **API-20260502-002**), which the widget passes through verbatim.

### Why we need it

Tenants asked for label-based filtering as the natural complement to the new tile-grid course list (W1-20260501-001). Without it, embedders on tenants with hundreds of courses are stuck enumerating IDs by hand.

This is the surface embedders will copy-paste from the docs the day the feature ships. Until it appears in the page, the option effectively doesn't exist for users.

### Constraints from our side

- The page section conventions in `docs/widgets/registration-widget.md` should be respected — these are additions to the existing **Initialisation options** layout, not a rewrite.
- All code examples must be generic English. Do not copy strings from any tenant's branding.
- The widget enforces nothing about labels itself — the api-v1 server is authoritative on visibility (private labels never match for widget callers, silently). The docs should reflect the user-visible behaviour without overstating it.
- The legacy id-based `?labels=<id>|<id>` filter is **untouched** and not part of this feature. The two new options are name-based and additive. If existing docs reference the id-based form, leave them alone.
- These options coexist with everything documented in handoff `widgets-v1-to-api-docs-20260501-001` (course list display modes, custom renderers, collapse-on-select flags). They're a separate filtering concern, not a renderer or display option.

### How we imagine it — open to challenge

Two new entries under **`## Initialisation options`**, each shaped like the existing `course_ids` / `place_ids` entries (since these mirror that surface exactly).

**Behavioural facts the docs should convey:**

| Fact | Detail |
|---|---|
| Where it can be set | JavaScript: `window.ZOOZA.labels_in`, `window.ZOOZA.labels_not_in`. Legacy `document.zooza`: `filter_labels_in`, `filter_labels_not_in`. URL query: `?labels_in=…&labels_not_in=…`. Precedence: `window.ZOOZA` → `document.zooza` → URL → unset. |
| Value shape | Array of strings (`["red", "blue"]`) **or** pipe-delimited string (`"red\|blue"`). URL is always pipe-delimited. |
| Match rules | Names match exactly (case-sensitive) against the company's labels. `labels_in` returns courses tagged with **at least one** of the listed names; `labels_not_in` excludes courses tagged with **any** of the listed names; both compose. |
| Empty values | Empty array, empty string, or omitted → no filter applied. |
| Visibility | Private labels (admin-only) never match for embedders, silently. There is no client-visible distinction between "label doesn't exist" and "label exists but is private" — both produce zero matches. Mention this so embedders aren't surprised when results vanish after a label is unpublished. |
| Composition | Both options compose with each other (AND), and with the existing `course_ids`, `place_ids`, `schedule_id` filters (also AND). |

**Example surfaces** the docs page should show (rough sketch — restructure to match the page's existing example conventions):

```html
<!-- JavaScript config -->
<script>
  window.ZOOZA = {
    labels_in:     [ "summer", "kids" ],
    labels_not_in: [ "private", "archived" ],
  };
</script>
```

```
# URL query string
?labels_in=summer|kids&labels_not_in=private|archived
```

```js
// document.zooza (legacy form, still supported)
document.zooza = {
  filter_labels_in:     [ "summer", "kids" ],
  filter_labels_not_in: [ "private", "archived" ],
};
```

If the page's existing structure groups all course-list-related options together, fold these in next to `course_ids` / `place_ids`. If it lists init options in alphabetical order, slot them in alphabetically. Whatever matches the page conventions.

---

## Discussion

<!-- replies appended here, format: ### {YYYY-MM-DD} — {project} -->

### 2026-05-03 — api-docs

Mostly aligned, with three corrections before we move to `agreed`:

1. **Drop `document.zooza` from the new docs surface.** It's legacy — supported by the runtime but we deliberately do not promote it for new options. Document only `window.ZOOZA` (JS) and the URL query form. The page intro already calls `document.zooza` out as legacy, and `course_list_collapse_on_select` / `schedule_list_collapse_on_select` from the sibling handoff (`widgets-v1-to-api-docs-20260501-001`) follow the same `window.ZOOZA` + URL Query pattern — `labels_in` / `labels_not_in` should match. Please drop the `filter_labels_in` / `filter_labels_not_in` block and the `document.zooza` row from the precedence note. Precedence simplifies to: `window.ZOOZA` → URL → unset.

2. **Spell out that values are label names, not keys or ids.** Embedders should expect to type the label string exactly as it appears in the admin UI — including spaces and special characters. So `"Summer 2026"`, `"Kids — beginners"`, `"This with space"` are all fine. They are not coding keys. Concretely, the docs should say:
   - Values are **label names**, exactly as shown in admin (case-sensitive, spaces and punctuation preserved).
   - You **cannot** pass label ids to `labels_in` / `labels_not_in` — those parameters are name-only. The legacy id-based `?labels=<id>|<id>` filter is a separate, untouched mechanism (and we won't be touching it here).
   - Accepted shapes: array of strings (`["Summer 2026", "Kids"]`) **or** pipe-concatenated string (`"Summer 2026|Kids"`). URL form is always pipe-concatenated.

3. **Cross-link with the renderer/display-mode work.** This option sits next to the surface from handoff `widgets-v1-to-api-docs-20260501-001` (course list display, grid columns, `course_list_collapse_on_select`, `schedule_list_collapse_on_select`, `render_course_tile`, `render_schedule_tile`). I'll slot `labels_in` / `labels_not_in` into `## Initialisation options` near `course_ids` / `place_ids` (filtering concern, not display) and add a one-line note that label filtering composes with the new display modes — embedders combining label filters with the tile grid should know they work together with no extra setup.

Proposed concrete shape for the two entries (sketch — final wording during writing):

````md
### `labels_in`

_Type: Array of strings, or pipe-delimited string_

Show only courses tagged with at least one of the listed labels. Values are **label names** as shown in the admin UI — case-sensitive, including spaces and punctuation (e.g. `"Summer 2026"`, `"Kids — beginners"`). Label ids are not accepted here; the legacy id-based `?labels=` filter is a separate mechanism and is unaffected by this option.

Composes with `labels_not_in` (AND), and with `course_ids` / `place_ids` / `schedule_id`. An empty array, empty string, or omitted value means no filter.

> Private (admin-only) labels never match for embedders. There is no client-visible difference between "label doesn't exist" and "label exists but is private" — both produce zero matches. If a label is unpublished after you've embedded the widget, the courses tagged with it will silently disappear from the list.

<Tabs>
  <TabItem value="js" label="JavaScript">

```javascript
<script>
    window.ZOOZA = {
        labels_in: [ "Summer 2026", "Kids — beginners" ],
    };
</script>
```

  </TabItem>
  <TabItem value="url" label="URL Query">

```plaintext
?labels_in=Summer 2026|Kids — beginners
```

  </TabItem>
</Tabs>
````

`labels_not_in` mirrors this exactly, swapping "show only" for "hide" and "at least one" for "any".

If that lands well, propose moving status to `agreed` with:
- **api-docs** owns the page edit in `docs/widgets/registration-widget.md` (two new init-option entries near `course_ids` / `place_ids`, no `document.zooza` block, label-name semantics called out, cross-link to the display-mode work).
- **widgets-v1** is responsible for keeping the runtime behaviour aligned with the documented precedence (`window.ZOOZA` → URL → unset) and label-name match semantics; if anything drifts during implementation, ping back on this handoff.

---

## Decision Summary

**What will be built:**
- Two new init-option entries in `docs/widgets/registration-widget.md` under `## Initialisation options`:
  - `### labels_in` — show only courses tagged with at least one listed label name.
  - `### labels_not_in` — hide courses tagged with any listed label name.
- Slotted near the existing course/place/schedule filters (after `### schedule_id`, before the renderer-handoff collapse flags). They are a filtering concern, not a display option.
- Tabs block: JavaScript (`window.ZOOZA`) + URL Query only. No WordPress tab.
- Documented behaviour:
  - Values are **label names** as shown in admin (case-sensitive, including spaces and punctuation).
  - Accepted shapes: array of strings, or pipe-delimited string. URL form is always pipe-delimited.
  - `labels_in` matches at least one; `labels_not_in` excludes any match. Both compose (AND), and compose with `course_ids` / `filter_places` / `schedule_id`.
  - Empty array / empty string / omitted = no filter.
  - Private labels silently never match (admin-only); zero matches for unknown vs. private labels are indistinguishable client-side.
- One-line cross-link noting that label filtering composes with the new tile-grid display modes shipped via handoff `widgets-v1-to-api-docs-20260501-001`.

**What will NOT be built (and why):**
- No `document.zooza` block / `filter_labels_in` / `filter_labels_not_in` legacy property names — `document.zooza` is legacy and not promoted for new options.
- No documentation changes to the legacy id-based `?labels=<id>|<id>` filter — separate mechanism, untouched.
- No WordPress shortcode tab — WP plugin doesn't expose these for this release.

**Constraints agreed:**
- Match existing page conventions (`_Type: ..._` italic header, generic English copy, `:::info` admonitions where useful).
- Existing structure preserved — additions only, no rewrite.
- Precedence simplifies to: `window.ZOOZA` → URL → unset.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---|---|---|
| api-docs | Page edits in `docs/widgets/registration-widget.md` per the placement and content above. Verify anchors on local dev server. Land in a single PR batched with renderer handoff `widgets-v1-to-api-docs-20260501-001`. | Branch `feature-courses-label-filter`. |
| widgets-v1 | Keep runtime aligned with documented precedence (`window.ZOOZA` → URL → unset) and label-name match semantics. Ping back on this handoff if anything drifts during implementation. | Ongoing. |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
