---
handoff_id: widgets-v1-to-api-docs-20260501-001
from: widgets-v1
to: api-docs
status: open
created: 2026-05-01
updated: 2026-05-01
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

---

## Decision Summary

<!-- filled when status moves to "agreed" -->

---

## Resolution

<!-- filled when status moves to "resolved" -->
