---
handoff_id: widgets-v1-to-api-docs-20260501-001
from: widgets-v1
to: api-docs
status: agreed
created: 2026-05-01
updated: 2026-05-03
related_specs:
  - W1-20260501-001
---

## Request

### What we need
Update `docs/widgets/registration-widget.md` to document two new tenant-level Settings, two new initialisation options, two new lifecycle callbacks, and the related behaviour changes shipped by widgets-v1 spec W1-20260501-001 (Course/Schedule List Display Modes & Custom Renderers).

The page is the canonical reference embedders read before integrating; it should reflect the new surface as soon as the widget ships.

### Why we need it
Embedders are asking for non-dropdown course rendering and for "keep all options visible after select" behaviour. The widget exposes the display mode as tenant settings (no embedder code), the keep-visible flags as init-time options (no admin work needed), and ships callbacks as the escape hatch for bespoke layouts. Without docs updates, the surface effectively doesn't exist for users.

### Constraints from our side
- Match the existing page conventions: `## Settings` entries with the `| Value | Description | Example Value |` table, `## Initialisation options` entries with `_Type: ..._` headers and a Tabs block (JavaScript / WordPress / URL Query) where appropriate, `## Events and callbacks` entries with a `#### Params` table and a code example.
- All code examples must be generic English. Do not copy strings from any tenant's branding or screenshots.
- Settings entries go under the existing `## Settings` heading; init options under `## Initialisation options`; callbacks under `## Events and callbacks`.
- Keep the existing structure intact — these are additions, not a rewrite.

### How we imagine it — open to challenge

The four content blocks below are written so they can drop almost verbatim into `docs/widgets/registration-widget.md`. Examples are deliberately rich — embedders read this page to copy-paste, and a one-line example doesn't carry them across the gap to a working integration. If the api-docs team prefers a different structure, the substance can be re-cut to fit.

#### A. New Settings entries (under `## Settings`)

Two entries, one per option, prose-then-table just like `### Availability` / `### Submit button`. Place them after `### Price display for payment schedules` to mirror how the admin UI panel is laid out.

> **`### Course list display`**
>
> By default, the widget renders the list of available courses as a `<select>` dropdown. If you have a small number of courses and want to make them more visually prominent, you can switch to a built-in tile grid. The grid is unstyled beyond a minimal layout — your site's CSS controls the look.
>
> | Value | Description | Example Value |
> |---|---|---|
> | Dropdown (Default) | Courses appear as a single `<select>`. Best when you have many courses or want the most compact form. | _Course A / Course B / …_ |
> | Grid | Courses appear as tiles in a configurable column grid. Each tile shows the course name, the first 5 lines of its description, and a Select button. | _2 × 2 grid of tiles_ |
>
> :::info Need a fully custom layout?
> If the built-in grid doesn't match your design, register the [`render_courses_list`](#render_courses_list) callback to take over rendering completely. The widget falls back to the value of this setting whenever the callback isn't registered.
> :::

> **`### Course grid columns`**
>
> Only applies when **Course list display** is set to **Grid**. Picks the number of columns the grid renders. Use 1 for a single-column list, 2–4 for a wider layout. The setting persists even when you switch the display back to Dropdown, so toggling between modes doesn't lose your column preference.
>
> | Value | Description | Example Value |
> |---|---|---|
> | 1 (Default) | Single column — equivalent to a vertical list. | _Stacked tiles_ |
> | 2 | Two columns. | _2 × N grid_ |
> | 3 | Three columns. | _3 × N grid_ |
> | 4 | Four columns. | _4 × N grid_ |

#### B. New Initialisation options entries (under `## Initialisation options`)

Two entries, both `_Type: Boolean_`, both with a Tabs block matching the existing `### \`filter_courses\`` / `### \`course_id\`` / `### \`ps\`` patterns.

> **`### \`course_list_collapse_on_select\``**
>
> _Type: Boolean_
>
> By default, when a customer picks a course from the grid, the other tiles are hidden so the form can focus on the next step. The selected tile gets a "back to all courses" affordance the customer can use to change their mind. Set this to `false` to keep every tile visible at all times — useful when you want customers to compare courses side by side as they progress.
>
> Only meaningful when **Course list display** is set to **Grid**. In Dropdown mode the setting has no effect.
>
> | Value | Description | Example Value |
> |---|---|---|
> | `true` (Default) | After a customer picks a course, other tiles are hidden until they pick "back to all courses". | _Focused single-tile view_ |
> | `false` | All tiles stay visible after a selection; the chosen tile is highlighted with a `selected` class. | _Side-by-side comparison_ |
>
> <Tabs>
>   <TabItem value="js" label="JavaScript">
>
> ```javascript
> <script>
>     window.ZOOZA = {
>         course_list_collapse_on_select: false,
>     };
> </script>
> ```
>
>   </TabItem>
>   <TabItem value="url" label="URL Query">
>
> ```plaintext
> ?course_list_collapse_on_select=false
> ```
>
>   </TabItem>
> </Tabs>

> **`### \`schedule_list_collapse_on_select\``**
>
> _Type: Boolean_
>
> By default, after the customer picks a class from the schedule list, the other classes are hidden and the chosen one stays on screen with a "change" link. Set this to `false` to keep all classes visible — useful when customers should be able to scan the full list as they fill in the form, or when the form sits beside a fixed schedule overview.
>
> | Value | Description | Example Value |
> |---|---|---|
> | `true` (Default) | After a class is picked, the other tiles collapse. The chosen tile shows a "change" link. | _Focused single-tile view_ |
> | `false` | All tiles remain visible after a selection. | _Full schedule stays on screen_ |
>
> <Tabs>
>   <TabItem value="js" label="JavaScript">
>
> ```javascript
> <script>
>     window.ZOOZA = {
>         schedule_list_collapse_on_select: false,
>     };
> </script>
> ```
>
>   </TabItem>
>   <TabItem value="url" label="URL Query">
>
> ```plaintext
> ?schedule_list_collapse_on_select=false
> ```
>
>   </TabItem>
> </Tabs>

#### C. New "Events and callbacks" entries (under `## Events and callbacks`)

Two entries, both following the existing `### \`schedule_registration_options_loaded\`` pattern (prose → `#### Params` table → code example). The new callbacks are **per-tile content callbacks** — embedders return the HTML that goes inside a single tile, never wire DOM event listeners, and do not need jQuery on their page. The widget owns the tile shell, click delegation, collapse-on-select, the change-affordance, and the hidden `<select>` source-of-truth.

> **`### \`render_course_tile\`**
>
> Returns the HTML that goes **inside** a single course tile. The widget owns everything else: the `<div class="zooza_courses_course" data-course_id="<id>">` wrapper, the grid layout, the "Select" CTA, the collapse-on-select, and the "back to all courses" affordance. Register this callback when you want a different look for the courses than the built-in default — your own headings, images, marketing copy, prices, badges, anything.
>
> Registering this callback forces the widget into grid mode even if [Course list display](#course-list-display) is set to `Dropdown` — the hidden `<select name="zooza_courses">` stays in DOM as the source of truth, but the visible UI is your tiles.
>
> #### Params
>
> | Attribute | Description |
> |---|---|
> | `course` | The course object the widget is currently building a tile for. Exposes (at minimum): `id`, `name`, `description`, `course_type`, `registration_type`. The callback runs once per filtered course in the order the widget displays them. |
>
> #### Return
>
> A `string`, DOM `Node`, or jQuery object representing the inside of the tile. Whatever you return is inserted into the widget-built tile wrapper. Anything else (e.g. `undefined`) is treated as "no content" and the tile gets only the auto-appended Select CTA.
>
> ##### Minimal example — name and description
>
> The smallest thing that works. The widget auto-appends a default Select CTA at the bottom of the tile because the returned content does not include a `.zooza_courses_course_select` element — so the customer can advance with no extra wiring.
>
> ```javascript
> window.ZOOZA = {
>     callback: {
>         render_course_tile: ( course ) => `
>             <h3>${ course.name }</h3>
>             <p>${ ( course.description || '' ).slice( 0, 160 ) }</p>
>         `,
>     },
> };
> ```
>
> ##### Custom CTA — embedder provides the Select element
>
> If you want the Select CTA inline (different copy, different position, different styling), include any element with `class="zooza_courses_course_select"` in the returned HTML. The widget detects it and skips its auto-append. You don't write a click handler — the widget's delegated click on `.zooza_courses_course_select` reads the course id from the tile wrapper and runs the standard flow.
>
> ```javascript
> window.ZOOZA = {
>     callback: {
>         render_course_tile: ( course ) => `
>             <header>
>                 <h3>${ course.name }</h3>
>                 <button type="button" class="zooza_courses_course_select">Reserve this course</button>
>             </header>
>             <p class="my-course-summary">${ ( course.description || '' ).slice( 0, 200 ) }</p>
>         `,
>     },
> };
> ```
>
> :::info Class-based interactivity, no event listeners required
> The widget delegates click on `.zooza_courses_course_select`. You add the class to any element you want — `<button>`, `<a>`, even a wrapping `<div>` — and the widget reads `data-course_id` from the closest tile wrapper, never from the click target. No event listeners on your side, no jQuery, no manual selection wiring.
> :::

> **`### \`render_schedule_tile\`**
>
> Mirror of `render_course_tile` for the schedule list. Returns the HTML that goes inside a single `<div class="zooza_schedules_schedule" data-schedule_id="<id>">` tile. The widget owns the wrapper, the grid layout, the Choose CTA, collapse-on-select, and the change affordance.
>
> #### Params
>
> | Attribute | Description |
> |---|---|
> | `schedule` | The schedule model for this tile. Exposes `id` plus the same display methods the default tile uses: `get_date_formatted()`, `get_start_formatted()`, `get_end_formatted()`, `get_price()`, `get_capacity_formatted()`, `get_capacity_warning()`, `get_description()`. |
> | `course` | The currently selected course model — useful when the schedule layout needs course-level context (name, description, custom labels). |
>
> #### Return
>
> A `string`, DOM `Node`, or jQuery object — same as `render_course_tile`. Whatever you return is inserted into the widget-built tile wrapper.
>
> ##### Minimal example — date and price
>
> ```javascript
> window.ZOOZA = {
>     callback: {
>         render_schedule_tile: ( schedule, course ) => `
>             <strong>${ schedule.get_date_formatted() }</strong>
>             <span>${ schedule.get_price() }</span>
>         `,
>     },
> };
> ```
>
> ##### Custom CTA — embedder provides the Choose element
>
> Same pattern as courses: include `class="zooza_schedules_schedule_select"` on any element to take over CTA copy, position, or styling. Optionally include `class="zooza_schedules_schedule_change"` if you want the "change selected class" affordance inline (the widget normally injects it on the selected tile in collapse mode).
>
> ```javascript
> window.ZOOZA = {
>     callback: {
>         render_schedule_tile: ( schedule, course ) => `
>             <div class="my-schedule-info">
>                 <strong>${ schedule.get_date_formatted() }</strong>
>                 <span>${ schedule.get_capacity_formatted() }</span>
>             </div>
>             <button type="button" class="zooza_schedules_schedule_select">Reserve this date</button>
>         `,
>     },
> };
> ```
>
> :::info The class hooks
> The widget delegates click on these classes — embedder content can include any element carrying them, the widget reads the relevant `data-` attribute from the closest tile wrapper.
>
> | Class | Action |
> |---|---|
> | `zooza_courses_course_select` | Pick this course |
> | `zooza_courses_course_change` | Back to all courses (collapse mode only) |
> | `zooza_schedules_schedule_select` | Pick this class |
> | `zooza_schedules_schedule_change` | Change selected class (collapse mode only) |
>
> If your tile content does not include the corresponding `*_select` class, the widget auto-appends a default CTA with that class so the customer can always advance.
> :::
>
> :::info Combining callbacks with display modes
> Registering a per-tile callback always wins over admin settings — `render_course_tile` forces grid mode even if **Course list display** is set to **Dropdown** for the tenant. This lets you opt into a custom render for one tenant without forcing every tenant on the same Zooza account to do the same.
> :::

#### D. Cross-cutting note for the page introduction or a new "Customising the lists" section

Optional — depends on whether the docs team prefers to keep all customisation discussion local to each option/callback, or to have a single place that contrasts the four surfaces. If the latter, a short section near the top of `## Initialisation options` (or just before `## Events and callbacks`) along these lines would help embedders pick the right tool:

> The widget gives you four ways to customise how courses and classes appear, from least-effort to most-flexible:
>
> 1. **[Course list display](#course-list-display) + [Course grid columns](#course-grid-columns)** — admin-side toggles for course rendering. No code, no embed change.
> 2. **[`course_list_collapse_on_select`](#course_list_collapse_on_select) and [`schedule_list_collapse_on_select`](#schedule_list_collapse_on_select)** — JavaScript or URL-query flags for keeping all tiles visible after a selection. No backend change.
> 3. **[`render_course_tile`](#render_course_tile) and [`render_schedule_tile`](#render_schedule_tile) callbacks** — return the inside of a tile. The widget keeps owning the shell, the click delegation, the collapse, and the change affordance — you just return HTML.
>
> Callbacks always win over admin settings — register `render_course_tile` and the courses are rendered as tiles even when the tenant has chosen the Dropdown display.

#### E. Style and tone notes

- All examples use generic English copy ("Choose this course", "Reserve this date") — no tenant-specific strings, no language other than English.
- Code examples use 4-space indentation and the same brace/semicolon style as existing examples on the page.
- Embedder-side callbacks should never use `jQuery(...)`. The widget loads its own copy of jQuery in an isolated scope; on most host pages `jQuery` is not a global, so `jQuery(...)` throws `TypeError: jQuery is not a function`. Per-tile callbacks return strings, DOM nodes, or template literals — none of which require jQuery on the embedder's side. Examples in this proposal stick to template-literal returns for clarity.
- Where the existing page uses `:::info` / `:::warning` admonitions, new content should too. Where it uses `_Type: ..._` italic headers, new init-option entries match.

We're open to a different way of slotting this content into the page if the api-docs team has a stronger structure in mind. The above is our current best guess.

---

## Discussion

<!-- replies appended here -->

### 2026-05-03 — api-docs

Aligned on the substance — the four content blocks drop in well against the page's existing structure. Six clarifications and one structural pushback before we move to `agreed`:

1. **`document.zooza` is correctly absent — confirming we'll keep it that way.** Your proposed Tabs blocks (`### course_list_collapse_on_select`, `### schedule_list_collapse_on_select`) show JavaScript + URL Query only. That matches our docs convention for new options: `window.ZOOZA` (JS) + URL Query, no `document.zooza` block. Sibling label-filter handoff `widgets-v1-to-api-docs-20260503-001` follows the same rule. Existing `### filter_courses` keeps its legacy `document.zooza` example untouched (it's a documented legacy form for an existing option, not a new one).

2. **WordPress tab — needed or not?** The existing `### filter_courses` entry has three tabs: JavaScript / WordPress / URL Query (the WordPress one shows `[zooza type="registration" filter_courses="YOUR_COURSE_ID"]`). Your section A intro says "Tabs block (JavaScript / WordPress / URL Query) where appropriate" but the actual sketches show only JS + URL. **Question:** does the WP plugin currently expose `course_list_collapse_on_select` / `schedule_list_collapse_on_select` as shortcode attributes, or are these JS/URL-only for this release? Same question for the per-tile callbacks (`render_course_tile` / `render_schedule_tile`) — those are JS-only by nature, no question there. If WP shortcode isn't wired, we'll document JS + URL only and add WordPress later.

3. **`render_courses_list` reference in the `### Course list display` admonition is undefined elsewhere in this handoff.** Your section A draft says: *"If the built-in grid doesn't match your design, register the [`render_courses_list`](#render_courses_list) callback to take over rendering completely."* But section C only defines `render_course_tile` and `render_schedule_tile` — there's no `render_courses_list` callback proposed, and the current page doesn't have one either. **Question:** is `render_courses_list` (a) a typo that should read `render_course_tile`, (b) a separate, list-level callback that's also part of W1-20260501-001 but missing from this handoff, or (c) deferred to a later spec? If (a) we'll just rename the link. If (b) please add a section C entry for it. If (c) we'll drop the admonition or rephrase to reference `render_course_tile` as the per-tile escape hatch.

4. **Callback param contract — please pin it down.** Section C says `course` exposes "(at minimum) `id`, `name`, `description`, `course_type`, `registration_type`" and `schedule` exposes "`id` plus the same display methods the default tile uses: `get_date_formatted()`, …". Embedders read this page once and copy-paste examples that hit production for years. **"At minimum" is too soft for a public contract.** Please say explicitly which fields/methods are stable contract (will not change without a deprecation cycle) vs. which are internal/experimental (may change between minor versions). For our docs, we'll only mention the stable ones. If the schedule model also exposes useful stable methods beyond what's listed, name them — embedders will inevitably want price, capacity, description, date formatting in their custom tiles, so it's worth being thorough.

5. **Class-hooks contract.** The four classes (`zooza_courses_course_select`, `zooza_courses_course_change`, `zooza_schedules_schedule_select`, `zooza_schedules_schedule_change`) are the public widget→embedder contract for click delegation and the change affordance. **Confirming we'll document these as stable** — your `:::info The class hooks` admonition makes that intent clear. We'll match the wording. (Internal classes like `.zooza_courses_grid_cols_1..4`, `.zooza_courses_custom_render`, `.zooza_courses_course_description` — mentioned in your spec's `## Project Context` — we'll **not** document on this page; they're CSS-only and tenants who want to override styles can read them off the rendered DOM. If you want them on the page anyway, flag it.)

6. **Anchor links across handoff sections.** Your draft uses `[Course list display](#course-list-display)`, `[course_list_collapse_on_select](#course_list_collapse_on_select)`, etc. Docusaurus slugifies headings to lowercase-hyphenated (`### Course list display` → `#course-list-display`, `### course_list_collapse_on_select` → `#course_list_collapse_on_select` because underscores are preserved). The anchors as-written will work. Just flagging for awareness — we'll verify on local dev server before the docs PR lands.

7. **Pushback on Block D — slim it down.** A standalone "Customising the lists" sub-section creates a 5th place to update if any of the four surfaces change later, and the contrast is already conveyed by inline cross-refs between options/callbacks. **Counter-proposal:** a single `:::info` admonition placed once near the top of `## Initialisation options` (or under `## Settings` intro), four-bullet content, no new heading. Sketch:

   ```md
   :::info Customising the course and schedule lists
   The widget gives you four ways to control how courses and classes appear:

   1. **Admin Settings** — [Course list display](#course-list-display) and [Course grid columns](#course-grid-columns). No code, no embed change.
   2. **`course_list_collapse_on_select` / `schedule_list_collapse_on_select`** — JS or URL-query flags for keeping all tiles visible after a selection.
   3. **`render_course_tile` / `render_schedule_tile` callbacks** — return the inside of a single tile; the widget keeps owning the shell, click delegation, and collapse behaviour.

   Callbacks always win over admin settings — registering `render_course_tile` forces grid mode even if **Course list display** is set to **Dropdown**.
   :::
   ```

   If you want a full sub-section instead, we can do that — but our preference is the slim admonition for maintainability.

**Page placement summary** (acknowledging your section A guidance and proposing concrete slots):

| Block | Page slot |
|---|---|
| A. Settings entries | `## Settings` → after `### Price display for payment schedules`, before `### Transfer the website visitor to the form`. |
| B. Init-option entries | `## Initialisation options` → grouped with course-related options, after `### schedule_id`, before `### ps`. Specifically: `course_list_collapse_on_select` first, then `schedule_list_collapse_on_select`. |
| C. Callback entries | `## Events and callbacks` → after the existing `### schedule_registration_options_loaded`, in the order `render_course_tile` then `render_schedule_tile`. |
| D. Cross-cutting orientation | Slim `:::info` admonition once at the top of `## Initialisation options` (per pushback above). |

**Style/tone (Block E) — all accepted.** 4-space indentation, generic English copy, no `jQuery(...)` in callback examples, `:::info` admonitions, `_Type: ..._` italic headers.

**Cross-link with label-filter handoff:** once both handoffs reach `agreed`, our preference is to land the renderer + label-filter doc edits in **a single PR on a `feature-courses-label-filter` (or similar) branch**. They touch the same page; splitting them creates merge churn for no reader benefit. Open to splitting if you'd rather see the renderer surface land first.

**Proposed responsibilities for moving to `agreed`** (pending answers to questions 2, 3, 4):

| Project | Responsibility | Target |
|---|---|---|
| widgets-v1 | Confirm WP shortcode scope (Q2). Resolve `render_courses_list` reference (Q3). Pin down stable callback param contract (Q4). | Reply on this handoff. |
| api-docs | Page edits in `docs/widgets/registration-widget.md`: Settings entries A, init-option entries B, callback entries C, slim orientation admonition D. Verify anchors on local dev server. | Single PR (likely batched with label-filter docs). |
| widgets-v1 | Keep runtime aligned with the documented stable param/class contract. Ping back if any of it drifts during implementation. | Ongoing. |

### 2026-05-03 — widgets-v1

Answers to your three blocking questions:

**Q2 — WordPress tab.** Not needed. The two collapse flags are JS + URL Query only for this release; WP shortcode is not wired. Per-tile callbacks are JS-only by nature. Document JS + URL Query only on the renderer + collapse-flag entries.

**Q3 — `render_courses_list` reference.** Stale — option (a). The spec was revised on 2026-05-01 (Notes line: *"Decided 2026-05-01 (revision): moved from list-level callbacks (`render_courses_list` / `render_schedules_list`) to per-tile content callbacks (`render_course_tile` / `render_schedule_tile`)"*). Reasoning: the list-level shape forced embedders to use jQuery (the widget loads its own copy in an isolated scope, so `jQuery(...)` in a callback body threw `TypeError`) and pushed event wiring + change-affordance markup onto them. The admonition in Settings A should read `render_course_tile`. We've also updated the spec's Goal section, which still listed the old names — that stale reference is fixed in spec rev `2026-05-03`.

**Q4 — Stable callback param contract.** Pinned down explicitly. Anything not listed below is **internal / experimental** — may change between minor versions without a deprecation cycle.

`render_course_tile( course )` — `course` exposes:

| Field | Type | Note |
|---|---|---|
| `id` | number | course id |
| `name` | string | display name |
| `description` | string | may be empty |
| `course_type` | string | matches the API enum (`course`, `event`, `online_event`, `photography`, …) |
| `registration_type` | string | `single`, `full2`, or `open` |

`render_schedule_tile( schedule, course )` — `schedule` exposes:

| Member | Returns | Note |
|---|---|---|
| `id` | number | schedule id |
| `get_date_formatted()` | string | locale-formatted date / date range |
| `get_start_formatted()` | string | start datetime, locale-formatted |
| `get_end_formatted()` | string | end datetime, locale-formatted |
| `get_price()` | string | currency-formatted price (e.g. `"10,00 €"`) |
| `get_capacity_formatted()` | string | localised capacity copy (e.g. `"Voľné miesta"`, `"Plno"`) |

`course` (second arg) is the same shape as in `render_course_tile`.

If embedders later want a richer stable surface (e.g. raw price + currency separately so they can format their own), flag it on the docs page and we'll add stable accessors — we'd rather extend the contract deliberately than promise the whole model object.

**On the rest:**

- **Page placement (A–D slots), Block D structural pushback, single-PR batching with label-filter:** all your call. You know the page structure best — pick whatever fits the existing layout and is most maintainable. Slim `:::info` admonition is fine if that's better.
- **Q5 (class hooks):** confirmed stable as documented.
- **Q6 (anchors):** no action our side; you verify on dev server.

That clears all three blockers. Ready for `agreed` once Q4's stable contract is acceptable.

### 2026-05-03 — api-docs

Q4 contract is acceptable. Three small notes, then we're done.

**On `get_capacity_warning()` and `get_description()`** — both appeared in the original section C sketch for `render_schedule_tile` but didn't make the stable list. Reading your "extend the contract deliberately" note as intentional scoping. We'll omit them from docs entirely. If embedder demand surfaces (capacity warning is the obvious one — "almost full" badges are a common request), we'll flag it via a fresh handoff and you can decide whether to promote them.

**Acceptances:**
- Q2 (WP) — JS + URL Query only on the two collapse flags. Per-tile callbacks JS-only by nature.
- Q3 — Settings A admonition will read `render_course_tile`, no `render_courses_list` reference anywhere. Thanks for catching the spec rev too.
- Q4 — stable contract documented exactly as listed. Anything not in the table gets no mention.

**Confirmed our side:**
- Page placement per the table in our previous reply (Settings → after Price display; init options → after `schedule_id`, before `ps`; callbacks → after `schedule_registration_options_loaded`; orientation `:::info` once at top of `## Initialisation options`).
- Slim `:::info` admonition for Block D (per your "all your call" — we go with our pushback).
- Single PR on a `feature-courses-label-filter` branch (or similar — final branch name decided when we open it), batching label-filter + renderer doc edits.
- Anchors verified on local dev server before PR open.

**Decision Summary** below — proposing this as the contract; flag anything you'd reword.

---

## Decision Summary

**What will be built:**
- New entries in `docs/widgets/registration-widget.md` covering W1-20260501-001:
  - **Settings (`## Settings`):** `### Course list display`, `### Course grid columns` — placed after `### Price display for payment schedules`.
  - **Initialisation options (`## Initialisation options`):** `### course_list_collapse_on_select`, `### schedule_list_collapse_on_select` — placed after `### schedule_id`, before `### ps`. Tabs: JavaScript + URL Query only (no WordPress, no `document.zooza`).
  - **Events and callbacks (`## Events and callbacks`):** `### render_course_tile`, `### render_schedule_tile` — placed after the existing `### schedule_registration_options_loaded`. Stable param contract documented exactly per Q4 table; nothing else mentioned.
  - **Orientation `:::info` admonition** at the top of `## Initialisation options` summarising the four customisation surfaces.
- Public class-hooks contract documented as stable: `zooza_courses_course_select`, `zooza_courses_course_change`, `zooza_schedules_schedule_select`, `zooza_schedules_schedule_change`.

**What will NOT be built (and why):**
- WordPress shortcode tab on the two collapse flags — WP plugin doesn't expose these for this release; can be added later via a fresh handoff.
- `render_courses_list` callback reference — superseded by per-tile callbacks in spec rev 2026-05-01; the original handoff reference was stale.
- `get_capacity_warning()` / `get_description()` on `schedule` — not in the stable contract; deliberately scoped out, can be promoted later if demand surfaces.
- Documentation of internal CSS classes (`.zooza_courses_grid_cols_1..4`, `.zooza_courses_custom_render`, `.zooza_courses_course_description`) — CSS-only, tenants who restyle can read them off the rendered DOM.
- `document.zooza` examples for any new option — legacy form, not promoted in new docs.

**Constraints agreed:**
- Match existing page conventions (`| Value | Description | Example Value |` Settings tables; `_Type: ..._` italic init-option headers; `#### Params` callback tables; `:::info` admonitions; 4-space code indent; generic English copy; no `jQuery(...)` in callback examples).
- Stable callback param contract documented exactly per Q4 (no extras, no soft "at minimum" wording).
- Existing structure preserved — additions only, no rewrite.
- The legacy id-based `?labels=<id>|<id>` filter and other legacy options remain untouched.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---|---|---|
| api-docs | Edit `docs/widgets/registration-widget.md` per the placement and content above. Verify anchors on local dev server. Open a single PR batching renderer + label-filter doc edits on a `feature-courses-label-filter` (or similar) branch. | Once both this handoff and label-filter handoff `widgets-v1-to-api-docs-20260503-001` are `agreed`. |
| widgets-v1 | Keep runtime aligned with the documented stable param/class contract. Ping back via this handoff if any of it drifts during implementation. | Ongoing. |
| widgets-v1 | If embedder demand surfaces for currently-experimental schedule methods (`get_capacity_warning`, `get_description`, etc.) or richer course fields, decide whether to promote them and ping back. | As needed, separate handoff. |

---

## Resolution

<!-- filled when status moves to "resolved" -->
