---
handoff_id: widgets-v1-to-api-docs-20261103-002
from: widgets-v1
to: api-docs
status: agreed
created: 2026-11-03
updated: 2026-11-03
related_specs: ["W1-20261103-002"]
---

## Request

### What we need

From now on, the docs should present **`window.ZOOZA.widgets.<widget>.<setting>`** as the way to set
JS init options for every v1 widget, for example:

```js
window.ZOOZA = {
  widgets: {
    registration: { course_ids: [3911], multi_step_form: true },
    map:          { map_view: { center: { lat: 48.1486, lng: 17.1077 }, zoom: 13 } }
  }
};
```

After this, a reader copying an init example gets the namespaced form on every widget page
(registration, profile, contact, checkout, map). They should also find one short explanation of the
pattern, its precedence, and the fact that the old flat form still works.

### Why we need it

Today the docs show a flat `window.ZOOZA.course_ids`, `window.ZOOZA.multi_step_form`, and so on. That
object is shared by every widget on the page. On a page with several widgets (say a registration and a
map, or two registrations), a setting meant for one widget applies to all of them, and widgets leak
their settings into each other. W1-20261103-002 gives each widget its own namespace so settings can be
targeted. The flat form stays fully supported, so no existing site breaks. New sites should use the
namespaced form.

### Constraints from our side

- **Flat keys keep working indefinitely.** Don't describe them as deprecated or removed. "Still
  supported; prefer the namespaced form" is the right tone. Existing customer sites rely on them.
- **Precedence** (later wins): widget defaults < flat `window.ZOOZA.<setting>` <
  `window.ZOOZA.widgets.<widget>.<setting>` < placeholder `data-zooza-*` attribute < URL query param.
  Nested objects (`translations`, `callback`) merge key by key.
- **Widget keys:** `registration`, `profile`, `contact`, `checkout`, `map`. Use `registration` even for
  embeds that load `type=registration_new`.
- `document.zooza.*` stays undocumented (legacy), as agreed in the map thread.
- **Timing:** publish the namespaced form when W1-20261103-002 is released. We'll post the release here.
  Until then, the namespace doesn't exist in production.
- **Scope:** v1 widgets only. The legacy `/widgets/v2` widgets (calendar, video, legacy checkout/map)
  still read only the flat form.

### How we imagine it — open to challenge

We picture one short "Customising widgets from JavaScript" section, or a page linked from each widget
page, that explains the namespace, the precedence and the flat-form compatibility. Each widget page's
init examples would then switch to `window.ZOOZA.widgets.<widget>.…`. You own the structure and wording.

---

## Discussion

<!-- Each reply: append, never edit previous entries -->

### 2026-11-03 — widgets-v1
Opening the request. The map-specific options (`map_view`, `show_schedules`, `age_range`) are covered in
the map docs thread `widgets-v1-to-api-docs-20261103-001`, now in this namespaced form.

### 2026-11-03 — api-docs
Thanks. We accept the constraints: flat keys are described as "still supported; prefer the namespaced
form", the precedence is as stated, it applies to v1 only, and `document.zooza` stays undocumented.

**Planned structure:** a new "Setting options from JavaScript" section in `embed-methods.md`, next to
the existing "Configuring a widget on the placeholder" section. It explains the namespace, the widget
keys, the full precedence order (including the key-by-key merge for `translations` and `callback`) and
flat-form compatibility. Every v1 widget page (registration, profile, contact, checkout, map) switches
its examples to `window.ZOOZA.widgets.<widget>` and links to that section. Calendar and video keep the
flat form, with a short note that they're v2 widgets.

**Release:** we'll ship this together with the v1 map docs (`widgets-v1-to-api-docs-20261103-001`) as
one release once W1-20261103-002 is released. Please post the release notice in both threads.

**Questions:**
1. **Two widgets of the same type on one page.** Your "why" mentions two registration widgets, but the
   namespace is keyed by widget type, so `widgets.registration` reaches both. Is the answer for that
   case "use `data-zooza-*` on each placeholder"? Or is there an instance-level key, for example by
   placeholder ID?
2. **Page-level keys.** Are any `window.ZOOZA` keys page-wide by design and so not meant to be
   namespaced, such as `language` or tracking keys? Or does every option documented on a widget page
   accept the namespaced form?
3. **Options the registration page documents via `document.zooza`** (for example `filter_courses`,
   `filter_places`). We won't touch those legacy sections, but does
   `window.ZOOZA.widgets.registration.filter_courses` work? If so, should we document it as the new
   form?
4. **Callbacks.** Should the segment-renderer callbacks on the registration page move to
   `widgets.registration.callback`, and does the flat `window.ZOOZA.callback` still reach every widget?

### 2026-11-03 — widgets-v1
Thanks, the structure and the joint release with the map docs work for us. We'll post the merge notice in
both threads. Answers (checked against the W1-20261103-002 implementation):

**1. Two widgets of the same type: yes, use `data-zooza-*` on each placeholder.** The namespace is
per widget *type*, so `widgets.registration.*` applies to every registration on the page. To set one
instance differently, put the setting on that instance's placeholder (e.g.
`data-zooza-course-ids="3911"`). Placeholder attributes beat the namespace and stay with their own
placeholder: they don't leak to another registration or another widget type. There is no instance-level
key (e.g. by placeholder ID), and we're not adding one now. Please correct our "why" accordingly:
the namespace separates *different* widgets; placeholder attributes separate instances of the *same*
widget.

**2. Page-level keys: none.** Every option documented on a v1 widget page accepts the namespaced form,
including `translations`, `print_debug` and the language setting. Each widget reads them from its own
resolved settings, so `widgets.contact.translations` affects contact only. Two runtime *outputs* live on
`window.ZOOZA` and aren't settings:
- `window.ZOOZA.active_step`, the registration's current form step, written by the widget and unchanged;
- `window.ZOOZA.get_setting`, an internal helper (on a multi-widget page it belongs to whichever widget
  started last).

Neither should be presented as a setting, and `get_setting` shouldn't be documented at all.

**3. `document.zooza.filter_courses` / `filter_places`: the namespaced equivalent is `course_ids` /
`place_ids`, not `filter_courses`.** `window.ZOOZA.widgets.registration.filter_courses` is **not**
read. The registration filters come from `widgets.registration.course_ids` / `place_ids` (or the flat
`window.ZOOZA.course_ids` / `place_ids`), then from `document.zooza.filter_*`. One difference is worth
stating on the registration page: **with the placeholder + loader embed, the flat
`window.ZOOZA.course_ids` / `place_ids` are ignored on purpose**, because other widgets on the page may
set them. The namespaced `widgets.registration.course_ids` / `place_ids` and the placeholder's
`data-zooza-course-ids` / `data-zooza-place-ids` are honoured. So yes, please document
`widgets.registration.course_ids` / `place_ids` as the new form, and keep the `document.zooza`
sections as they are.

**4. Callbacks: yes, move them to `widgets.registration.callback`.** The flat
`window.ZOOZA.callback` still works. It is copied into every v1 widget's settings, but only the
registration invokes callbacks today. Flat and namespaced callbacks merge key by key: a flat
`callback.on_schedule_selected` plus a namespaced `callback.render_segment_tile` gives both. For the same
key, the namespaced one wins.

### 2026-11-03 — widgets-v1 (merge notice)
**W1-20261103-002 is merged to widgets-v1 `main`** (merge `c741706`) and pushed to origin. The
per-widget namespace `window.ZOOZA.widgets.<widget>.<setting>` is live in the code for registration,
profile, contact, checkout and map, as described in our replies above. This is the release notice you
asked for, posted in both threads. Production deployment is a separate manual step on our side. If you'd
rather time the docs to the production deploy, tell us and we'll post again when it's deployed.

### 2026-11-03 — api-docs
Thanks, your answers settle all four questions. We're moving to `agreed` with the Decision Summary
below. The docs are written on our branch `feature-v1-map-and-widget-namespace` and follow your
answers. Two points to reconcile:

- **Release timing: please post again when widgets-v1 is deployed to production.** We'll time the docs
  release (this thread and the map thread together) to the production deploy rather than the merge, so
  the docs never describe settings that aren't live yet. This changes our earlier "once
  W1-20261103-002 is released" to "once it is deployed to production".
- **`course_ids` on the registration page** used to show a `document.zooza.course_ids` example. Per
  your answer 3 we replaced it with `window.ZOOZA.widgets.registration.course_ids`. If
  `document.zooza.course_ids` was never read by the runtime, nothing changes for tenants. If it is
  read, tell us and we'll mention it as the legacy form.

### 2026-11-03 — widgets-v1
Agreed, thanks. Both points confirmed:
- **Release timing:** we'll post a **production deploy notice** in this thread and the map thread when
  W1-20261103-002 is deployed to production. Until then, nothing is live in production.
- **`document.zooza.course_ids` has never been read** by the v1 runtime. The only `document.zooza`
  inputs are `filter_courses` and `filter_places` (and the map's legacy `age_range`). Replacing that
  example with `window.ZOOZA.widgets.registration.course_ids` changes nothing for tenants, and there's
  no legacy form of it to mention.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" -->

**What will be built:**
- A "Setting options from JavaScript" section in `docs/widgets/embed-methods.md`, covering:
  - the namespace `window.ZOOZA.widgets.<widget>.<option>`, with widget keys `registration` (also for
    `type=registration_new`), `profile`, `contact`, `checkout` and `map`;
  - the precedence, later wins: widget default / app setting < flat `window.ZOOZA.<option>` <
    `window.ZOOZA.widgets.<widget>.<option>` < placeholder `data-zooza-*` < URL query. Objects
    (`translations`, `callback`) merge key by key; for the same key the later form wins;
  - two widgets of the same type: the namespace reaches both; set per-instance options as
    `data-zooza-*` on each placeholder;
  - the flat form: still supported, existing pages keep working, prefer the namespaced form;
  - the registration exception: with the placeholder embed, flat `window.ZOOZA.course_ids` /
    `place_ids` are ignored;
  - a note that v2 widgets (calendar, video, deprecated v2 checkout and map) read only the flat form.
- Every JS init example on the v1 widget pages (registration, profile, contact, checkout, map) uses
  `window.ZOOZA.widgets.<widget>`, and those pages link to the section above.
- Registration page: `course_ids` / `place_ids` documented in the namespaced form, with a note on the
  placeholder-embed exception; callbacks documented under `widgets.registration.callback`.
- Calendar page: a note that it reads only the flat form.

**What will NOT be built (and why):**
- **No "deprecated" wording for the flat form.** Existing customer sites rely on it.
- **No `document.zooza` docs for new options.** Existing `document.zooza` sections for legacy options
  (e.g. `filter_courses`, `filter_places`) stay as they are.
- **No instance-level key** (e.g. by placeholder ID). The runtime has none; placeholder attributes cover
  that case.
- **`window.ZOOZA.get_setting` is not documented** (internal helper), and `window.ZOOZA.active_step`
  is not presented as a setting.
- **No namespaced form on v2 widget pages.** v2 widgets don't read it.

**Constraints agreed:**
- Flat keys keep working indefinitely and are described as "still supported; prefer the namespaced
  form".
- v1 widgets only.
- **Coordinated release:** this change ships together with the v1 map docs
  (`widgets-v1-to-api-docs-20261103-001`), merged to `test` and released only after widgets-v1
  posts that W1-20261103-002 is deployed to production.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| widgets-v1 | Deploy W1-20261103-002 to production and post the deploy notice in this thread and the map thread. Confirm whether `document.zooza.course_ids` is read. | Production deploy |
| api-docs | Keep the namespace docs on `feature-v1-map-and-widget-namespace`; merge to `test` and release together with the map docs after the deploy notice. | After production deploy notice |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
