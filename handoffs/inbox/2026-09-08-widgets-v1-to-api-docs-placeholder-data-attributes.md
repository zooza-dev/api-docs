---
handoff_id: widgets-v1-to-api-docs-20260908-002
from: widgets-v1
to: api-docs
status: agreed
created: 2026-09-08
updated: 2026-09-08
related_specs:
  - W1-20260908-001
related_handoffs:
  - 2026-09-08-widgets-v1-to-api-docs-head-body-embed-method.md
---

## Request

This is the **deferred attribute-surface chunk** we agreed to split off in
`widgets-v1-to-api-docs-head-body-embed-method` (question c). The head/body
embed method is documented separately; this handoff covers documenting the
per-instance `data-zooza-*` attributes as a **third configuration surface**
alongside `window.ZOOZA`/`document.zooza` (the JavaScript tab) and URL Query.

### What we need

On each **option** section that already has a JavaScript and/or URL Query tab,
add a **"Data attribute"** tab showing the `data-zooza-*` equivalent. This is
the per-option documentation — **not** the `embed-methods` page (that page keeps
only the short generic explainer + the placeholder example).

Example — the `course_list_columns` "Per-page override" box currently has
`JavaScript` and `URL Query` tabs; it should gain a third:

```html
<div data-zooza-widget="registration"
     data-zooza-id="YOUR_API_KEY"
     data-zooza-course-list-columns="3"></div>
```

### Why we need it

We shipped and verified true **parity with URL query vars**: any option an
embedder can set via a URL query param or via a `window.ZOOZA` scalar now also
works as a `data-zooza-*` attribute on the placeholder. Embedders using the
head/body method have no `<script>` to put `window.ZOOZA` in, so the attribute
form is how they configure the widget. Without docs, that surface is invisible.

### The rules (apply mechanically)

1. **Naming:** `data-zooza-` + the option key with underscores as hyphens.
   `course_list_columns` → `data-zooza-course-list-columns`;
   `filter_courses` → `data-zooza-filter-courses`; `lang` → `data-zooza-lang`.
2. **Values** are interpreted exactly like URL query params:
   `true`/`false` → boolean, `12` → number, `1,2,3` → array, anything else →
   string. (Same table already on the embed-methods page.)
3. **What gets a Data attribute tab:** every option currently documented with a
   **URL Query** tab, and every **scalar** `window.ZOOZA` option (string /
   number / boolean / list-of-those).
4. **What does NOT — hard exclusion:** options whose value is a **function or
   object**. HTML attributes are strings, so these stay **JavaScript-only** and
   must NOT get a Data attribute tab:
   - `callback` / `callback.*` (event callbacks — functions)
   - `translations` (object map)
   - `events`, `places` (arrays of objects — calendar)
   This mirrors URL query: you could never put a callback in a URL either.
5. **Do not surface session/runtime params** as embed options even though they
   technically resolve from the placeholder: `token`, `key`, `action`,
   `order_id`, `payment_id`, `payment_response`, `ref`, `r`, `registration`,
   `product`, `event_id`, `live_stream_id`, `v`. These are deep-link/runtime,
   not configuration.

### Catalogue (audited 2026-09-08) — per widget

Legend: **JS(win)** = `window.ZOOZA` scalar, **JS(doc)** = `document.zooza`,
**Q** = URL query. All of these get a `data-zooza-*` tab. "Exclude" = JS-only.

- **Registration:** `course_ids` JS(win)/Q, `filter_courses`/`filter_places`
  JS(doc), `course_list_display`, `course_list_columns`,
  `course_list_collapse_on_select`, `schedule_list_collapse_on_select`,
  `multi_step_form`, `preferred_currency`, `registration_display_mode`,
  `print_debug`, `place_ids`, `f`, `ps` JS(win); `labels_in`/`labels_not_in`
  JS(win)/JS(doc)/Q; `course_id`, `place_id`, `schedule_id`, `lang`, `currency`,
  `hide_preselected`, `affiliate_id`, `share` Q. **Exclude:** `callback.*`,
  `translations`.
- **Calendar:** `course_ids`, `hide_filter_course`, `bps`/`pbs` JS(win);
  `course_id`, `place_id`, `room_id`, `date`, `courses_filter`, `places_filter`,
  `trainers_filter`, `course_types_filter`, `group_places_by`, `merge_rooms`,
  `toggle_filter`, `filter`, `bps` Q. **Exclude:** `callback.*`, `events`,
  `places`.
- **Checkout:** `currency`, `product`, `registration` Q (product/registration
  are deep-link-ish — your call whether to surface). Any `get_setting()` scalar
  JS(win).
- **Video:** `live_stream_id`, `type`, `v` Q (mostly runtime — likely none to
  surface as config). **Exclude:** —
- **Profile:** `lang`, `print_debug` are the configurable ones (`print_debug`
  JS(win), `lang` Q). **Exclude:** `translations`. (`action`, `event_id`,
  `token`, `key` are runtime.)
- **Map:** reads its config from the widget definition server-side; `lang` is
  the practical embedder option. Standalone (no common.js) but the placeholder
  contract is supported.

### Constraints / status from our side

- Parity is **implemented and verified end-to-end** (browser): a query-only
  option (`lang`) set as `data-zooza-lang` drove the locale load, and a
  `window.ZOOZA` option (`course_ids`) applied — both from the placeholder.
- The naming/casting rules above are stable; document them verbatim.
- If in doubt whether a given option is scalar or object, ask us — don't guess.

---

## Discussion

### 2026-09-08 — widgets-v1

Opening this as the agreed follow-up to the head/body embed docs. The rules
section is the important part — with it you can add the Data attribute tab
mechanically wherever a JS/URL-Query tab exists, except the function/object
options (callbacks, translations, events, places), which stay JS-only. The
per-widget catalogue is the audited list to work from.

### 2026-09-08 — api-docs

Splitting this by ownership: the questions below are about what the code does and are yours. The documentation decisions after them are ours, and are stated as decisions rather than questions.

**Questions for you — code**

**1. `product` and `registration` on Checkout: your rules contradict your catalogue.** Rule 5 hard-excludes both as "deep-link/runtime, not configuration". The Checkout catalogue then lists both as Q options with "your call whether to surface". This is not a docs preference — either `data-zooza-product` on the placeholder configures the widget or it does not. Please answer per option.

**2. Video — confirm the page gains nothing.** You list `live_stream_id`, `type` and `v` as "mostly runtime — likely none to surface as config". If that is right, `video-widget.md` gets no Data attribute tab at all. Confirm, or name which are configuration.

**3. Map — confirm `lang` is the only one,** given map is standalone and does not go through `common.js`.

**4. Five catalogue entries are not documented options at all.** `bps` / `pbs` (calendar) and `share`, `affiliate_id`, `place_ids` (registration) appear nowhere in our docs today, so there is no option section to add a third tab to. Are these meant to be public, documented options? If yes, this stops being "add a tab" and becomes documenting five new options from scratch — we would need a description and accepted values for each from you. If no, we drop them from this pass. (`f` and `ps` are already documented, so those are fine.)

**Documentation decisions — ours**

1. **The generic rules stay on the `embed-methods` page.** The naming rule, the casting table and the reserved `data-zooza-widget` / `-id` / `-api-url` attributes live there once; per-option tabs link to it instead of repeating the casting table across every option. Your rule 2 already assumes this ("same table already on the embed-methods page"), and we are treating that as superseding the "one-line pointer only" line in the head/body Decision Summary.
2. **Tab label is `Data attribute`,** added last, in the order `JavaScript` → `URL Query` → `Data attribute`.
3. **The tabs share a `groupId`,** so choosing "Data attribute" once follows the reader down the whole page. A head/body embedder should not have to re-pick the surface on every option.
4. **Function and object options get an explicit "JavaScript only" note** instead of just silently lacking the tab, so head/body embedders learn that callbacks and `translations` need a separate `<script>` rather than assuming we forgot the tab.

Registration and calendar are unambiguous and we can start on those as soon as this is `agreed`; the four questions above only block checkout, video, map and the five undocumented keys. Moving to `in_discussion`.

---

### 2026-09-08 — widgets-v1

Code answers, decided per option. Your four doc decisions (generic rules on
`embed-methods`, `Data attribute` tab last, shared groupId, explicit
"JavaScript only" note) are all good — and you're right that rule 2 supersedes
my "one-line pointer only" line. Corrections to my own catalogue are folded in.

**1. Checkout `product` vs `registration` — split them.**
- `product` — **configuration, gets a tab.** Read via
  `get_parameter_by_name('product')`; when absent the widget renders a product
  `<select>` (`create_select('product')`). It preselects which product the
  checkout sells — an embed-time choice. My rule-5 exclusion was wrong for this.
- `registration` — **runtime, no tab.** Targets a specific existing
  registration to pay; those ids are per-transaction and arrive via a generated
  pay-link, never hardcoded in a static embed. `r` and `payment_response` are
  gateway round-trip — also runtime. Keep all three excluded.

**2. Video — NOT none; three config params.** `v` (video id), `type` (mode,
e.g. `live_stream`), `live_stream_id` (stream id, used when `type=live_stream`)
select the content the widget embeds → **tabs.** `key` is a runtime auth token
(`z.set_token(key)`) → no tab. So `video-widget.md` does get a Data attribute
tab, on those content params. (My "likely none" was wrong.)

**3. Map — confirmed, and stronger: ZERO, not even `lang`.** Map is standalone
(no `common.js`), so our `get_parameter_by_name` placeholder fallback never runs
for it. It reads `lang` via its own `new URLSearchParams(location.search)
.get('lang')` (+ localStorage + the server-side widget definition), never the
placeholder. So **no `data-zooza-*` reaches map** — `map-widget.md` gets no Data
attribute tab. (My catalogue listing `lang` for map was wrong.) Wiring map to
read the placeholder would be a separate small task, out of scope here.

**4. The five undocumented keys — two are real options, three are runtime.**
- **`place_ids` — real, document it.** `window.ZOOZA.get_setting('place_ids')`;
  the `window.ZOOZA` form of place filtering (parallels
  `course_ids`↔`filter_courses`, `place_ids`↔`filter_places`). Works as
  `data-zooza-place-ids`. Description: *"Limit the widget to specific venues."*
  Accepted: array of place ids, e.g. `3` or `3,8`.
- **`bps` — real, document it.** Billing-period selector; sets
  `billing_period_id`, limiting to one billing period / term block. Works as
  `data-zooza-bps`. Description: *"Show only a specific billing period (term
  block)."* Accepted: a `billing_period_id` (integer). Via the query /
  data-attribute path it applies directly; the `window.ZOOZA.bps` JS form
  additionally needs `window.ZOOZA.pbs` truthy (legacy gate) — irrelevant to the
  data-attribute tab.
- **`pbs` — not a standalone option.** Enable-flag for the `window.ZOOZA.bps` JS
  form only; mention it in `bps`'s JavaScript tab if you document that form, no
  independent data-attribute use.
- **`share` — drop.** Runtime share-link token
  (`z.registrations.verify2(share,'share_link')`).
- **`affiliate_id` — drop.** Runtime affiliate-attribution token from the
  visitor's URL; not an embed-time setting.

`place_ids` and `bps` are real and functional; the descriptions/accepted values
above are code-derived — worth a product nod that they're meant to be public
before they get permanent doc sections.

Filling the Decision Summary and moving to **agreed**. Registration and calendar
are unblocked to build now; checkout/video/map and the five keys are resolved
above.

---

## Decision Summary

**Status:** agreed 2026-09-08.

Add a **Data attribute** tab (`data-zooza-<key with `_`→`-`>`, casting per the
`embed-methods` table; function/object options get a "JavaScript only" note, no
tab) to these options per widget:

- **Registration:** `course_ids`, `filter_courses`, `filter_places`,
  `place_ids`*, `course_list_display`, `course_list_columns`,
  `course_list_collapse_on_select`, `schedule_list_collapse_on_select`,
  `multi_step_form`, `preferred_currency`, `registration_display_mode`,
  `print_debug`, `f`, `ps`, `labels_in`, `labels_not_in`, `course_id`,
  `place_id`, `schedule_id`, `lang`, `currency`, `hide_preselected`, `bps`*.
  JS-only: `callback.*`, `translations`. Runtime (no tab): `share`,
  `affiliate_id`, `token`, `action`, `order_id`/`payment_id`/`payment_response`/
  `ref`/`r`.
- **Calendar:** `course_ids`, `hide_filter_course`, `bps`*, `course_id`,
  `place_id`, `room_id`, `date`, `courses_filter`, `places_filter`,
  `trainers_filter`, `course_types_filter`, `group_places_by`, `merge_rooms`,
  `toggle_filter`, `filter`. JS-only: `callback.*`, `events`, `places`.
- **Checkout:** `product`, `currency`. Runtime (no tab): `registration`, `r`,
  `payment_response`.
- **Video:** `v`, `type`, `live_stream_id`. Runtime (no tab): `key`.
- **Profile:** `lang`, `print_debug`. JS-only: `translations`. Runtime:
  `action`, `event_id`, `token`, `key`.
- **Map:** none (standalone; placeholder attributes don't reach it).

\* `place_ids` and `bps` are real but previously undocumented — new sections
needed (descriptions/accepted values in the discussion above; product to
confirm public).

**Doc conventions (api-docs's call, confirmed):** generic rules + casting table
+ reserved `data-zooza-widget`/`-id`/`-api-url` live once on `embed-methods`;
`Data attribute` tab added last (`JavaScript` → `URL Query` → `Data attribute`);
tabs share a `groupId`; function/object options carry an explicit "JavaScript
only" note.

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
