---
handoff_id: widgets-v1-to-api-docs-20260828-001
from: widgets-v1
to: api-docs
status: agreed
created: 2026-08-28
updated: 2026-10-14
related_specs:
  - W1-20260828-001
---

## Request

### What we need

Add two new entries to `## Events and callbacks` in
`docs/widgets/registration-widget.md`, documenting two callbacks the
registration widget now ships:

- `### render_segment_tile` — sibling of the existing
  [`render_schedule_tile`](#render_schedule_tile) / `render_course_tile`.
- `### segment_list_rendered` — sibling of the existing
  [`schedule_list_rendered`](#schedule_list_rendered).

Both are additive — no rewrite, no impact on adjacent entries. They complete the
renderer API for the third tile type (segments / "Blocks"), which previously had
a per-tile render hook and a post-render list hook for courses and schedules but
none for segments.

After this, an embedder reading the page should be able to: (a) replace the
inside of a single segment tile, and (b) run their own DOM work over the whole
rendered segment list — with the same mental model the page already teaches for
courses and schedules.

### Why we need it

Segment tiles are shown in the `segments_only` registration mode (the
"Blocks" step). Until now embedders had no documented hook here, so anyone
customizing that step fell back to MutationObserver polling or scraping the DOM.
The first real consumer (a studio that groups blocks by category and adds a
package-based selection cap) is built entirely on these two callbacks, so the
surface is in active use; without the page entries it effectively doesn't exist
for other embedders.

The widget ships the callbacks regardless of docs — the ask is documentation
parity so the segment step is discoverable alongside its course/schedule peers.

### Constraints from our side

These are the stable contracts the widget commits to. Wording/placement is the
api-docs team's call, but the substance below should hold:

**`render_segment_tile`**

- **Argument is a single object `{ segment, course }`** — NOT positional
  `(segment, course)` like `render_schedule_tile`. This difference is
  deliberate and worth calling out on the page: segment objects carry no course
  back-reference, so the course is delivered inside the argument object and is
  always available. (For contrast, `render_schedule_tile`'s second positional
  `course` arg is not reliably delivered today, which the schedule entry already
  reflects.)
- `segment` — stable members: `id`, `name`, `price`, `capacity`,
  `registrations`, `capacity_left`, `earliest_available_date` (the last is a
  date string when a full block frees within the delayed-start window, else
  `null`).
- `course` — currently selected course; same stable shape as the `course` arg
  in `render_course_tile` (`id`, `name`, `description`, `course_type`,
  `registration_type`).
- The widget owns the `<div class="zooza_segments_segment" data-id="<id>">`
  wrapper, its data attributes, the select/deselect click delegation, and the
  `.selected` toggle. The callback returns only the inside.
- **Select CTA detail (differs from schedules):** the widget looks for an
  `a.zooza_button` inside the returned content. If none is present, it appends
  the default "Choose" button — but only for *selectable* blocks (those with
  `capacity_left > 0`, or a non-null `earliest_available_date`). Full blocks
  with no relief get no button, same as the default tile. (Note this is
  `a.zooza_button`, not the `.zooza_schedules_schedule_select` class used by the
  schedule renderer.)
- Return type: a `string`, DOM `Node`, or jQuery object — same as the other two
  renderers.

**`segment_list_rendered`**

- Argument shape `{ el, segments, course, schedule }`.
- `el` — the `.zooza_segments` container as a **plain DOM `Element`** (not a
  jQuery object), same convention as `schedule_list_rendered`. It holds all
  rendered `.zooza_segments_segment[data-id]` tiles.
- `segments` — array of the raw segment objects in render order; `segments[i]`
  lines up 1:1 with the i-th tile in `el`. Each entry has the same stable shape
  as `render_segment_tile`'s `segment`.
- `course` — currently selected course; same shape as
  `schedule_list_rendered`'s `course`.
- `schedule` — the selected schedule the blocks belong to. **This is an extra
  field `schedule_list_rendered` does not have** — segments always belong to one
  specific schedule and consumers generally need it. Stable members: same as
  `render_schedule_tile`'s `schedule` arg, plus `schedule.name`.
- Fires **once per segment-list render, including when no block has free
  capacity** (the all-full case still fires, so an embedder can react to it).
  Handlers should be idempotent — please call this out, same as the note on
  `schedule_list_rendered`.
- Code examples must not use `jQuery(...)` — `el` is a plain DOM Element
  precisely so embedders without jQuery on their page can use it directly.

General: match the existing `## Events and callbacks` conventions (prose intro →
`#### Params` table → minimal example), generic English copy, 4-space indentation.

### How we imagine it — open to challenge

- `### render_segment_tile` slotted right after `### render_schedule_tile`.
- `### segment_list_rendered` slotted right after `### schedule_list_rendered`
  (so each new entry sits beside its course/schedule peer).

Rough sketch for `render_segment_tile` — exact wording is the api-docs team's
call:

> **`### render_segment_tile`**
>
> Mirror of [`render_schedule_tile`](#render_schedule_tile) for the block list
> shown in the `segments_only` registration mode. Returns the HTML that goes
> inside a single `<div class="zooza_segments_segment" data-id="<id>">` tile. The
> widget owns the wrapper, the select/deselect click handling, and the
> `.selected` state.
>
> Unlike `render_schedule_tile`, the callback receives a **single object**
> `{ segment, course }` (not positional arguments) — segment objects have no
> course back-reference, so the course is delivered in the object.
>
> #### Params
>
> | Attribute | Description |
> |---|---|
> | `segment` | The block. Stable members: `id`, `name`, `price`, `capacity`, `registrations`, `capacity_left`, `earliest_available_date` (date string when a full block frees within the delayed-start window, else `null`). |
> | `course` | The currently selected course — same shape as the `course` arg in [`render_course_tile`](#render_course_tile). |
>
> If your returned content includes an `a.zooza_button`, the widget uses it as
> the select control; otherwise it appends the default Choose button for
> selectable blocks.
>
> ```javascript
> window.ZOOZA = {
>     callback: {
>         render_segment_tile: ( { segment, course } ) => `
>             <div class="my-block">
>                 <strong>${ segment.name }</strong>
>                 <span>${ segment.capacity_left } free</span>
>             </div>
>         `,
>     },
> };
> ```

And for `segment_list_rendered`, the same structure as `schedule_list_rendered`
with the added `schedule` param and the all-full/idempotency note.

If a different placement, table layout, or example style fits the page better,
that's the api-docs team's call — we're after the substance, not the exact form.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-10-14 — api-docs
Sorry for the delay. Implemented on branch `feature/widget-examples-wave2` as requested, with the following placement and additions:

- `### segment_list_rendered` goes right after `schedule_list_rendered`. It has the params table (`el` as a plain DOM Element, `segments`, `course`, `schedule` with `.name`), the "fires even when all blocks are full" note, the idempotency note, and a jQuery-free grouping example.
- `### render_segment_tile` goes right after `render_schedule_tile`. It calls out the single-object `{ segment, course }` argument, lists the stable `segment` members, and adds an info box on the `a.zooza_button` select control and when the default Choose button is appended.
- **Added beyond the request:** `### on_segment_selected`, documented from `main.js` (it fires after select *and* deselect, with params `{ button, wrapper }` as jQuery objects). A real embedder already depends on it for package-based caps. **Please confirm it's a stable contract.** If it isn't, we'll mark it as experimental.
- **Added beyond the request:** a caution on `render_schedule_tile` that its positional `course` argument isn't delivered reliably. Your note said the page already reflected this, but it didn't. It now points to `document.ZOOZA.model.selected_course()` / `schedule_list_rendered`.
- A fictional "block packages" integration example built on these callbacks will be added under `/examples/`.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" -->

**What will be built:** Docs entries for `segment_list_rendered`, `render_segment_tile` and `on_segment_selected`, plus a caution on `render_schedule_tile`'s `course` argument.
**What will NOT be built (and why):** No change to the widget. This is documentation parity only.
**Constraints agreed:** Stable members and argument shapes exactly as listed in the request. `el` is a plain DOM Element, and examples don't use jQuery (the `on_segment_selected` params are jQuery by nature, so that is noted).
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| widgets-v1 | Confirm `on_segment_selected` is stable | — |
| api-docs | Document the callbacks; deploy | 2026-10-14 |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
