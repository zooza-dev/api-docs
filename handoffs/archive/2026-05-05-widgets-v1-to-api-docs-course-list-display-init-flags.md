---
handoff_id: widgets-v1-to-api-docs-20260505-001
from: widgets-v1
to: api-docs
status: resolved
created: 2026-05-05
updated: 2026-05-05
related_specs:
  - "W1-20260505-001"
  - "W1-20260501-001"
related_handoffs:
  - "2026-05-01-widgets-v1-to-api-docs-registration-list-renderers.md"
---

## Request

### What we need

Update `docs/widgets/registration-widget.md` to reflect that the two existing tenant-level Settings shipped by **W1-20260501-001** can now also be set per page by the embedder, with the embedder value taking precedence over the tenant setting:

- **Course list display** (`course_list_display` — `'select' | 'grid'`)
- **Course grid columns** (`course_list_columns` — `1 | 2 | 3 | 4`)

Both keys are now wired through the same `window.ZOOZA` / URL-query path that already powers `course_ids`, `ps`, `f`, `course_list_collapse_on_select`, `schedule_list_collapse_on_select`, etc. The admin/API value remains the default; per-page overrides win when present.

This is documentation-only on your side. Widget runtime is shipping today on `feature-course-list-display-init-flags` (spec `W1-20260505-001`).

### Why we need it

A landing page or campaign URL often needs a different list shape than the tenant's default — a 3-column grid for one campaign, a dropdown for another — without flipping the tenant-wide setting. The capability is now in the runtime, but until the docs reflect it, embedders won't discover it. Settings entries today only show admin Value tables, no embedder Tabs block, so a reader has no way to know the keys are also valid `window.ZOOZA` / URL keys.

### Constraints from our side

- The two Settings entries already exist on the page (added by handoff `widgets-v1-to-api-docs-20260501-001`). This is an addition to those entries, not a rewrite, and not a new section.
- Match the page conventions you already use for embedder-side surfaces: a `Tabs` block with **JavaScript** + **URL Query** tabs (no WordPress, no `document.zooza`) — same shape as the `course_list_collapse_on_select` / `schedule_list_collapse_on_select` entries you landed in the same PR.
- Precedence wording must make it clear that the tenant setting is the default and the embedder value overrides it. Not a replacement, not a merge — straight override.
- Generic English copy. No tenant-specific strings.
- The runtime keeps clamping `course_list_columns` to 1–4; values outside the range fall back to `1` silently. Worth a one-liner in the entry so embedders don't expect 5+ to "just work".
- Registering `callback.render_course_tile` continues to force grid mode regardless of either source — no change there. If the existing entry already states this, no action needed; we only flag it so the new override prose doesn't accidentally contradict it.

### How we imagine it — open to challenge

Two surgical edits, one per Settings entry. Sketch — restructure freely to match the page's existing tone:

#### A. Append to `### Course list display`

After the current Value table, before the existing `:::info Need a fully custom layout?` admonition, add a short "Per-page override" subsection along these lines:

> :::info Per-page override
> The setting above is the tenant-wide default. Individual pages can override it via `window.ZOOZA` or URL query — useful when one landing page wants a grid and another wants the dropdown without flipping the tenant setting.
>
> <Tabs>
>   <TabItem value="js" label="JavaScript">
>
> ```javascript
> <script>
>     window.ZOOZA = {
>         course_list_display: 'grid',
>     };
> </script>
> ```
>
>   </TabItem>
>   <TabItem value="url" label="URL Query">
>
> ```plaintext
> ?course_list_display=grid
> ```
>
>   </TabItem>
> </Tabs>
>
> Accepted values: `'select'`, `'grid'`. Anything else is ignored and the tenant setting is used.
> :::

#### B. Append to `### Course grid columns`

Same shape:

> :::info Per-page override
> The setting above is the tenant-wide default. Individual pages can override it via `window.ZOOZA` or URL query.
>
> <Tabs>
>   <TabItem value="js" label="JavaScript">
>
> ```javascript
> <script>
>     window.ZOOZA = {
>         course_list_columns: 3,
>     };
> </script>
> ```
>
>   </TabItem>
>   <TabItem value="url" label="URL Query">
>
> ```plaintext
> ?course_list_columns=3
> ```
>
>   </TabItem>
> </Tabs>
>
> Accepted values: `1`, `2`, `3`, `4`. Values outside this range fall back to `1`.
> :::

#### C. Optional — update the orientation `:::info` admonition at the top of `## Initialisation options`

The slim admonition you landed for handoff `widgets-v1-to-api-docs-20260501-001` lists four customisation surfaces. Bullet 1 currently reads:

> 1. **Admin Settings** — [Course list display](#course-list-display) and [Course grid columns](#course-grid-columns). No code, no embed change.

If you want to keep the orientation accurate, swap that bullet to something like:

> 1. **Admin Settings (with per-page override)** — [Course list display](#course-list-display) and [Course grid columns](#course-grid-columns). Tenant-wide defaults, also overridable per page via `window.ZOOZA` / URL.

Optional — purely about how much we want the orientation block to teach. Skip if you'd rather keep it lean.

#### D. What stays unchanged

- Settings table / Value column on each entry — admin remains the source of the default.
- Existing `:::info Need a fully custom layout?` admonition pointing at `render_course_tile`.
- All four collapse-flag / per-tile callback entries from `widgets-v1-to-api-docs-20260501-001`.
- The legacy `document.zooza.*` form — still not promoted in new docs.

We're open to a different presentation (single combined override block at the top of Settings, footnote per entry, etc.) if that fits the page better. The substance is what matters: the two keys are now valid `window.ZOOZA` / URL keys, and the override always wins over the tenant setting.

---

## Discussion

### 2026-05-05 — api-docs

Implemented as proposed (A + B + C). Both Settings entries now carry a `:::info Per-page override` admonition with the same JS + URL Query `Tabs` shape used by `course_list_collapse_on_select` / `schedule_list_collapse_on_select` — `window.ZOOZA` only, no `document.zooza`, no WordPress tab. Accepted-values lines included on both, plus the `1–4` clamp note on `course_list_columns`.

Two small additions on top of the sketch:

1. Folded the "callbacks force grid mode regardless of source" line into the existing `:::info Need a fully custom layout?` admonition under **Course list display**, so the override prose can't accidentally contradict it. Wording: "Registering `render_course_tile` forces grid mode regardless of the tenant setting or any per-page override."
2. Took the optional **C** edit — bullet 1 of the orientation admonition under `## Initialisation options` now reads "**Admin Settings (with per-page override)**" with the per-page mechanism named.

No changes to Value tables, the four entries from the previous handoff, or any legacy `document.zooza` surface.

---

## Resolution

**Resolved on:** 2026-05-05
**Outcome:** `docs/widgets/registration-widget.md` updated with per-page override blocks for `course_list_display` and `course_list_columns`, plus orientation-admonition tweak. Build conventions match existing `window.ZOOZA` entries on the page.
**Related specs/PRs:** widgets-v1 spec `W1-20260505-001` (runtime); api-docs commit on `test` branch.
