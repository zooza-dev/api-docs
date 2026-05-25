---
handoff_id: widgets-v1-to-api-docs-20260508-001
from: widgets-v1
to: api-docs
status: resolved
created: 2026-05-08
updated: 2026-05-08
resolved: 2026-05-08
related_specs:
  - W1-20260508-001
---

## Request

### What we need

Add a new `### schedule_list_rendered` entry to `## Events and callbacks` in `docs/widgets/registration-widget.md`. This is an additive change — no rewrite, no impact on adjacent entries.

The page should describe one new lifecycle callback that fires after the registration widget has rendered its schedule list and appended it to the DOM, with a stable `{ el, schedules, course }` argument shape.

### Why we need it

Embedders currently have no stable hook for running their own DOM work over the rendered schedule tile collection (analytics tagging, custom badges, sticky-on-scroll behaviour, sponsor blocks, etc.). The closest existing hook (`schedule_registration_options_loaded`) fires on a different event — when trial/segment options are prepared inside the registration form — and operates on a different DOM region. Without a documented hook for the schedule-list render event, embedders resort to MutationObserver polling or monkey-patching, which neither side wants to support.

The widget will ship the callback regardless of docs; without the entry on the page the surface effectively doesn't exist for embedders.

### Constraints from our side

- Match the existing page conventions for `## Events and callbacks` entries — the closest sibling is `### schedule_registration_options_loaded`. Prose intro → `#### Params` table → minimal code example.
- The argument shape is a stable contract once documented. The widget commits to:
    - `el` — **plain DOM `Element`** (not a jQuery object, intentionally — embedders should not need jQuery on their page). It is the `.zooza_schedules` container, which holds the prepended filter and all rendered `.zooza_schedules_schedule[data-schedule_id]` tiles.
    - `schedules` — array of schedule objects matching the filtered list used to build the tiles, in render order. Per-entry stable contract is the same `schedule` shape already documented for `render_schedule_tile` (see `docs/widgets/registration-widget.md` → `### render_schedule_tile`).
    - `course` — currently selected course object. Same stable shape as the `course` arg in `render_course_tile`.
- The callback fires on **every** schedule-list render, including re-renders triggered by a place change. Handlers should be idempotent — please call this out in the entry (sibling `schedule_registration_options_loaded` doesn't, but the analogous re-entrancy bites embedders here).
- Code examples use generic English copy and 4-space indentation, same as existing entries.
- Embedder-side code examples must not use `jQuery(...)` (the widget loads its own copy in an isolated scope; on most host pages `jQuery` is not a global). The whole point of the DOM-Element-not-jQuery choice on `el` is to make this natural.

### How we imagine it — open to challenge

A single new `### schedule_list_rendered` block under `## Events and callbacks`, slotted **after the existing `### schedule_registration_options_loaded` entry** (so the two list-related callbacks sit together). Rough sketch — exact wording is the api-docs team's call:

> **`### schedule_list_rendered`**
>
> Fires immediately after the widget renders the schedule list and appends it to the DOM. Use this hook when you need to run your own DOM work over the rendered tile collection — adding badges, attaching analytics, observing visibility, anything that needs the tiles to already be on the page.
>
> The callback fires on every render of the schedule list, including re-renders that follow a place change. Make sure your handler is idempotent — guard against double-attaching listeners or duplicating injected nodes.
>
> #### Params
>
> | Attribute | Description |
> |---|---|
> | `el` | The `.zooza_schedules` container as a **plain DOM `Element`** (not a jQuery object). Holds the prepended filter and all rendered `.zooza_schedules_schedule[data-schedule_id]` tiles. |
> | `schedules` | Array of schedule objects in render order. Each entry exposes the same stable members documented for `render_schedule_tile`'s `schedule` arg (`id`, `get_date_formatted()`, `get_start_formatted()`, `get_end_formatted()`, `get_price()`, `get_capacity_formatted()`). |
> | `course` | The currently selected course. Same stable shape as the `course` arg in `render_course_tile` (`id`, `name`, `description`, `course_type`, `registration_type`). |
>
> ```javascript
> window.ZOOZA = {
>     callback: {
>         schedule_list_rendered: ( { el, schedules, course } ) => {
>             // el is a plain DOM Element — no jQuery needed
>             const tiles = el.querySelectorAll( '.zooza_schedules_schedule' );
>             console.log( `Rendered ${ tiles.length } schedules for course "${ course.name }"` );
>         },
>     },
> };
> ```
>
> :::info `el` is a plain DOM Element
> Unlike `schedule_registration_options_loaded` (which passes `el` as a jQuery object for legacy reasons), `schedule_list_rendered` passes `el` as a plain DOM `Element`. This means embedders without jQuery on their page can use it directly. If you do have jQuery available, wrap with `$(el)` if you prefer.
> :::

If a different placement, table layout, or example style fits the page better, that's the api-docs team's call — we're after the substance, not the exact form.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-05-08 — api-docs

Implemented directly against the request — no negotiation round needed. The sketch in "How we imagine it" matched the page's existing conventions and there was nothing to push back on. Decision Summary and Resolution filled in inline at close time so the archived record reflects what shipped.

---

## Decision Summary

**What will be built:** A new `### schedule_list_rendered` entry under `## Events and callbacks` in `docs/widgets/registration-widget.md`, slotted between `### schedule_registration_options_loaded` and `### render_course_tile`. Prose intro covers the re-render-on-place-change idempotency requirement; `#### Params` table documents `el` (plain DOM `Element`), `schedules` (array in render order, 1:1 with rendered tiles, member contract by reference to `render_schedule_tile`), and `course` (shape by reference to `render_course_tile`). Two examples: a minimal log-on-render block and a practical week-separator block that shows the cleanup-then-walk idempotency pattern.

**What will NOT be built (and why):** No changes to the sibling `### schedule_registration_options_loaded` entry (its jQuery `el` is grandfathered in for legacy reasons; the new entry calls out the contrast in an `:::info` admonition). No update to `### render_schedule_tile`'s stable members table — the practical example references `schedule.name` with a one-liner noting it is exposed alongside the documented getters; widening the formal stable contract is a widgets-v1 call.

**Constraints agreed:** Match existing page conventions (4-space indent, generic English copy, no `jQuery(...)` in embedder examples). `el` documented as a plain DOM `Element`, contrasted with the jQuery `el` on `schedule_registration_options_loaded`. Idempotency requirement called out explicitly in the prose intro and demonstrated in the practical example.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| widgets-v1 | Ship the `schedule_list_rendered` callback with the documented `{ el, schedules, course }` shape; keep `el` as a plain DOM `Element`; fire on every render including post-place-change re-renders. | Spec `W1-20260508-001` |
| api-docs   | Add `### schedule_list_rendered` entry to `docs/widgets/registration-widget.md` per the agreed structure, with both minimal and practical examples. | Commit on `test` branch |

---

## Resolution

**Resolved on:** 2026-05-08
**Outcome:** Built as proposed. `### schedule_list_rendered` added to `docs/widgets/registration-widget.md` between `### schedule_registration_options_loaded` and `### render_course_tile`. Includes the prose intro with the idempotency call-out, the `#### Params` table for `el` / `schedules` / `course`, the "`el` is a plain DOM Element" `:::info` admonition contrasting with `schedule_registration_options_loaded`, and two examples — a minimal log-every-render block and a practical week-separator block demonstrating the cleanup-then-walk idempotency pattern. The practical example uses `schedule.name`; a one-liner notes it is exposed alongside the documented stable getters.
**Related specs/PRs:** widgets-v1 spec `W1-20260508-001` (runtime); api-docs commit `1c3d069` on `test` branch (`Document schedule_list_rendered callback with week-separator example`).
