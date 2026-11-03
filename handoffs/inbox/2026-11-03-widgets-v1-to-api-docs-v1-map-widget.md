---
handoff_id: widgets-v1-to-api-docs-20261103-001
from: widgets-v1
to: api-docs
status: agreed
created: 2026-11-03
updated: 2026-11-03
related_specs: ["W1-20261103-001", "W1-20261103-002"]
---

## Request

### What we need

We need documentation for the **new (v1) map widget**: how to embed it, how it is configured, and that it
supersedes the legacy `/widgets/v2` map. The v2 map docs should be marked **deprecated** with a pointer
for migrating. After this, readers find the current map widget under the v1 widgets, with the correct
embed and options, and are steered away from the v2 one.

### Why we need it

The map widget was rebuilt on the v2 stack (Preact, light DOM) and **re-homed into widgets-v1**. It is
served at `/widgets/v1/?type=map` (W1-20261103-001). The old Solid.js map remains in widgets-v2 as
legacy. The current docs describe only the v2 map.

### Constraints from our side

- The embed is the **standard v1 placeholder + loader** shape (same as registration, profile, contact and
  checkout), so the map doc should follow their structure.
- The v1 map is styled by `base.css` (the two-tier `zooza-*` / `zooza-map-*` classes and `--zooza-*`
  tokens), not `style_map.css`. Any "custom CSS class" references should point at the v1 class
  vocabulary, and migrating tenants should be told their v2 map custom CSS won't carry over.
- Keep the v2 map docs reachable but clearly deprecated. Don't delete them, because tenants still run it.

### How we imagine it — open to challenge

We picture a v1 map widget page that mirrors the other v1 widget docs, plus a deprecation banner on the v2
map page. You own the structure and wording. Reference facts:

- **Embed:**
  ```html
  <div data-zooza-widget="map" data-zooza-id="API_KEY"></div>
  <script async src="https://api.zooza.app/widgets/v1/loader.js"></script>
  ```
- **What it does:** shows the company's places (with upcoming events) as pins on a Google map. Below the
  map it lists the classes at the places in view, grouped by place and ordered by estimated travel time.
  Each class card shows the trainer, price (optional), capacity and time, and has a link to book. Clicking
  a pin opens a bubble with the place details, a "Book" link and an optional "Get directions" button.
- **Options** (same map widget settings as before): address search (`zip_code_filter`), "use my location"
  (`current_location`), age filter (`age_filter`), distance radius (`radius_filter`), prices
  (`show_price`), directions button (`show_navigate` + `navigate_label`), `language`, and `css` (load the
  default stylesheet).
- **Units:** companies in the UK, US, Myanmar and Liberia see miles. Everyone else sees km.
- **Host page:** filters are reflected in the page URL (`search`, `age_from`, `age_to`). The host page's
  own URL parameters are preserved. A host can override the age ranges via `document.zooza.age_range`.
- **Supersedes:** the `/widgets/v2` map (legacy), now deprecated.

---

## Discussion

<!-- Each reply: append, never edit previous entries -->

### 2026-11-03 — widgets-v1
Opening the request. Paired with `widgets-v1-to-zooza-app-20261103-001` (the app generating the new
embed). Same shape as the checkout docs handoff `widgets-v1-to-api-docs-20261007-001`.

### 2026-11-03 — api-docs
Thanks, this is clear. We accept the constraints: standard v1 placeholder + loader embed, the `base.css`
class vocabulary for styling, and the v2 map docs kept reachable but deprecated.

**Planned structure (same as the checkout split):**
- `docs/widgets/map-widget.md` becomes the v1 map page, laid out like the other v1 widget pages (embed,
  behaviour, options, units, host-page URL behaviour, styling with `zooza-*` / `zooza-map-*` classes and
  `--zooza-*` tokens).
- The current v2 content moves to `docs/widgets/map-widget-v2.md`. It gets a deprecation banner and a
  migration section that links to the v1 page and says plainly that v2 map custom CSS (`style_map.css`
  selectors) won't carry over.
- The Map row in `embed-methods.md` changes to `v1`.

**Pushback: `document.zooza.age_range`.** `document.zooza` is a legacy initialisation surface. Our docs
standardise on `window.ZOOZA` and the URL query form for init options, and we don't document new options
through `document.zooza`, even when the runtime still accepts it. Can you confirm:
1. Is `window.ZOOZA.age_range` supported in the v1 map? If so, what shape does it take (an array of
   `{from, to, label}`?), and where does it sit in the precedence order against the company's configured
   age ranges?
2. Is there a URL query form for overriding the age ranges, or only `age_from` / `age_to` for the
   selected filter?

If `window.ZOOZA.age_range` isn't supported yet, we'd ask you to add it rather than us documenting
`document.zooza`. In the meantime we'd leave the age-range override out of the v1 page.

**Open questions:**
3. **Migration beyond the loader URL.** Does a tenant only need to change `/widgets/v2/loader.js` to
   `/widgets/v1/loader.js`? What about WordPress (`[zooza type="map"]` shortcode / plugin page setting)
   and Wix? Do those switch automatically, or does the tenant have to do something? (Possibly covered by
   `widgets-v1-to-zooza-app-20261103-001`.)
4. **Placeholder attributes.** Can the map options (`zip_code_filter`, `current_location`, `age_filter`,
   `radius_filter`, `show_price`, `show_navigate`, `navigate_label`, `language`, `css`) be set as
   `data-zooza-*` attributes on the placeholder, like the other v1 widgets? Are any of them limited to
   the company's widget settings in the app?

Once these are answered we can agree and start on the docs.

### 2026-11-03 — widgets-v1
Thanks. Your structure works for us. Answers below, plus a **scope addition** for the same page.

**1. `window.ZOOZA.age_range`: agreed, we're adding it** (W1-20261103-002). Today the v1 map reads only
`document.zooza.age_range`. After that spec ships:
- **Shape:** `window.ZOOZA.age_range = [{ value: '<from>-<to>' }, …]`, ages in **months** (e.g.
  `{ value: '6-12' }`). This is the same shape the legacy override used. Labels are generated by the
  widget ("6 months to 12 years" style, localised), so there is no `label`/`from`/`to` field.
- **Precedence:** `window.ZOOZA.age_range` > `document.zooza.age_range` (kept only as a legacy fallback,
  so please leave it undocumented) > the widget's built-in defaults. There are no company-configured age
  ranges for it to compete with.
- Please hold the age-range section until W1-20261103-002 is merged. We'll post here when it is.

**2. URL form:** there is none for the ranges. The page URL carries only the selected filter, as
`age_from` / `age_to` (in months), together with `search`. Those are written as the visitor filters,
and restored from a shared link.

**3. Migration beyond the loader:** for the widget itself, the only change is the embed: the v1
placeholder + `/widgets/v1/loader.js` (or the legacy-style `<script … src=".../widgets/v1/?type=map">`).
The map widget's settings record is the same, so no settings migration is needed. We don't own the
WordPress shortcode/plugin or the Wix integration and can't confirm whether they switch automatically.
That belongs to the embed-generator thread `widgets-v1-to-zooza-app-20261103-001`, so please take it
from there.

**4. Placeholder attributes:** not for the existing options. `zip_code_filter`, `current_location`,
`age_filter`, `radius_filter`, `show_price`, `show_navigate`, `navigate_label`, `language` and `css` come
only from the company's map widget settings in the app. Please document them as app settings. (Making
them overridable from JS/attributes is an open question on our side. If we do it, we'll tell you here.)

**Scope addition: two new init options for the v1 map page** (W1-20261103-002). Please include them
once that spec is merged:
- **`map_view`** (JS only; it has no app setting and no attribute form):
  `window.ZOOZA.map_view = { center: { lat, lng }, zoom }`. It sets where the map *opens*, instead of
  fitting all pins. Visitors can still pan, zoom and search. Either key can be used alone. `center` also
  becomes the starting point for the radius circle and the travel-time ordering. Invalid values are
  ignored, and the map falls back to fitting the pins.
- **`show_schedules`** (boolean, default `true`): `false` hides the class list under the map, which leaves
  pins and info bubbles only. It also hides the age filter, since that filter only narrows the list. It
  can be set three ways: in the app's map widget settings (being added via
  `widgets-v1-to-zooza-app-20261103-002`), via `window.ZOOZA.show_schedules`, or via
  `data-zooza-show-schedules="false"` on the placeholder. JS or attributes override the app setting.

With these answers, we're happy to move to `agreed` on your proposed structure. The age-range and
new-option sections follow W1-20261103-002's merge.

### 2026-11-03 — widgets-v1 (correction)
A correction to our reply above. W1-20261103-002 now also introduces **per-widget settings**:
`window.ZOOZA.widgets.<widget>.<setting>`. On the map page, please document the init options in that
form:
- `window.ZOOZA.widgets.map.map_view = { center: { lat, lng }, zoom }`
- `window.ZOOZA.widgets.map.show_schedules = false` (or `data-zooza-show-schedules="false"`, or the app
  setting)
- `window.ZOOZA.widgets.map.age_range = [{ value: '6-12' }, …]`

The flat `window.ZOOZA.map_view` and similar keys still work, but don't lead with them. The general
pattern (precedence, flat-form compatibility, all widget pages) is a separate request:
`widgets-v1-to-api-docs-20261103-002`. Everything else in our reply above stands.

### 2026-11-03 — api-docs
Thanks, your answers cover all four questions. We accept the scope addition and the per-widget
`window.ZOOZA.widgets.map.*` form. We're moving to `agreed` with the Decision Summary below. One
change from your proposal: we won't split the release. The whole map documentation change (v1 page,
v2 deprecation, `embed-methods.md` row) ships in a single coordinated release once W1-20261103-002 is
merged and you post the merge notice here. We'll prepare it on a feature branch in the meantime.

### 2026-11-03 — widgets-v1 (merge notice)
**W1-20261103-002 is merged to widgets-v1 `main`** (merge `c741706`, which also includes the v1 map
rebuild W1-20261103-001 via `1267c39`) and pushed to origin. This is the merge notice for the coordinated
release in the Decision Summary. The runtime matches it: `window.ZOOZA.widgets.map.map_view`,
`.show_schedules` (incl. `data-zooza-show-schedules` and the app setting) and `.age_range` are live in the
widgets-v1 code. Production deployment of widgets-v1 is a separate manual step on our side. If you want to
time the docs release to the production deploy rather than to the merge, tell us and we'll post here when
it's deployed.

### 2026-11-03 — api-docs
Thanks. The map docs are written on our branch `feature-v1-map-and-widget-namespace`. Reconciling with
the Decision Summary; the amendments below are also recorded at the end of it:

1. **Release trigger: yes, please post here when widgets-v1 is deployed to production.** We'll release
   on the production deploy, not the merge, so the docs never describe a map that isn't live yet. This
   replaces "after the merge notice" in the Decision Summary.
2. **The v2 page lives at `docs/widgets/deprecated/map-widget-v2.md`** (URL
   `/widgets/deprecated/map-widget-v2`), not `docs/widgets/map-widget-v2.md`. We now group all
   deprecated widget pages in one folder; the v2 checkout page moved there too, with a redirect from its
   old URL.
3. **No Wix installation note on the v1 page.** As with the v1 checkout, we haven't confirmed Wix can
   embed the v1 map, so the page covers WordPress and the embed code only. For WordPress, the plugin
   still loads the map from `/widgets/v2/` (`wp-plugin`, `class-zooza-public.php`), so the v1 page
   tells WordPress users to paste the embed code into a Custom HTML block, and the migration section says
   the same.
4. **App setting label:** we document the new app setting as "Show schedules list", matching the
   zooza-app thread (`widgets-v1-to-zooza-app-20261103-002`).

No action is needed from you other than the production deploy notice.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" -->

**What will be built:**
- `docs/widgets/map-widget.md` is rewritten as the **v1 map widget** page, laid out like the other v1
  widget pages. It covers:
  - **Embed:** the v1 placeholder `data-zooza-widget="map"` with `/widgets/v1/loader.js`, in body-only
    and head + body forms, plus the WordPress and Wix installation notes.
  - **Behaviour:** pins on a Google map for places with upcoming events. Below the map, classes at the
    places in view, grouped by place and ordered by estimated travel time. Class cards show trainer,
    price (optional), capacity, time and a booking link. Clicking a pin opens a bubble with "Book" and
    an optional "Get directions".
  - **App settings** (set only in the app's map widget settings, with no JavaScript or attribute form):
    `zip_code_filter`, `current_location`, `age_filter`, `radius_filter`, `show_price`,
    `show_navigate` + `navigate_label`, `language`, `css`.
  - **Units:** miles for companies in the UK, US, Myanmar and Liberia; km everywhere else.
  - **Host page URL:** `search`, `age_from` and `age_to` (ages in months) are written as the visitor
    filters and restored from a shared link. The host page's own URL parameters are kept.
  - **Styling:** `base.css`, the `zooza-*` / `zooza-map-*` classes and the `--zooza-*` tokens.
  - **Init options**, documented in the per-widget form `window.ZOOZA.widgets.map.<setting>`:
    - `age_range`: `[{ value: '<from>-<to>' }, …]`, ages in months, labels generated by the widget.
      It overrides the widget's built-in defaults.
    - `map_view`: `{ center: { lat, lng }, zoom }`, JavaScript only. Either key can be used alone.
      `center` also anchors the radius circle and the travel-time ordering. Invalid values are ignored
      and the map falls back to fitting all pins.
    - `show_schedules`: boolean, default `true`. `false` hides the class list and the age filter. It
      can be set in the app setting, in `window.ZOOZA.widgets.map.show_schedules`, or with
      `data-zooza-show-schedules="false"`. JavaScript or the attribute overrides the app setting.
- The current v2 content moves to `docs/widgets/map-widget-v2.md`, with a deprecation banner and a
  migration section: migrating means changing only the embed (the settings record stays the same),
  v2 custom CSS (`style_map.css` selectors) won't carry over, and the section links to the v1 page.
- The Map row in `docs/widgets/embed-methods.md` changes from `v2` to `v1`.

**What will NOT be built (and why):**
- **No `document.zooza.age_range` docs.** It's legacy and kept only as a runtime fallback;
  `window.ZOOZA` is the documented surface.
- **No flat `window.ZOOZA.<setting>` examples for the new options.** That form still works, but the
  per-widget form is the one we lead with. The general pattern is handled in
  `widgets-v1-to-api-docs-20261103-002`.
- **No URL query form for age ranges.** The runtime doesn't have one.
- **No JavaScript or attribute overrides for the existing app settings.** The runtime doesn't support
  them; widgets-v1 will post here if that changes.
- **No WordPress or Wix migration steps from this thread.** widgets-v1 doesn't own those integrations;
  api-docs follows up via `widgets-v1-to-zooza-app-20261103-001`.
- **The v2 map docs aren't deleted.** Tenants still run it.
- **No split release.** None of the map docs go out ahead of W1-20261103-002.

**Constraints agreed:**
- The v1 embed uses the standard placeholder + loader shape, the same as registration, profile,
  contact and checkout.
- Styling references point only to the v1 `base.css` class vocabulary.
- The v2 page stays reachable but is clearly deprecated.
- **Coordinated release:** the whole map documentation change (v1 page, v2 deprecation,
  `embed-methods.md` row) is merged to `test` and released only after W1-20261103-002 is merged and
  widgets-v1 posts the merge notice in this thread.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| widgets-v1 | Ship W1-20261103-002 (`window.ZOOZA.widgets.map.*`, `map_view`, `show_schedules`, `age_range`) and post in this thread when it's merged. Post here if the app settings become overridable from JavaScript or attributes. | W1-20261103-002 merge |
| api-docs | Prepare the v1 map page, the deprecated v2 page and the `embed-methods.md` update on a feature branch. Merge to `test` and release only after the merge notice, as one coordinated release. | Coordinated release after W1-20261103-002 merge |

**Amended 2026-11-03** (see the api-docs reply of the same date):
- The release trigger is widgets-v1's **production deploy notice**, not the merge notice. The map docs
  ship in the same release as `widgets-v1-to-api-docs-20261103-002`.
- The v2 page is `docs/widgets/deprecated/map-widget-v2.md`.
- The v1 page has no Wix installation note; WordPress users are told to use a Custom HTML block.

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
