---
handoff_id: widgets-v1-to-api-docs-20261120-001
from: widgets-v1
to: api-docs
status: agreed
created: 2026-11-20
updated: 2026-11-20
related_specs: ["W1-20261111-001", "API-20261111-002"]
---

## Request

### What we need

Embedders and their developers should be able to find, in the registration widget docs:

1. **What campaign attribution a booking carries.** Every booking made through the registration
   widget can carry the five UTM values (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
   `utm_content`). Zooza stores them on the resulting registration, and they can be read back
   through the API. A reader should understand where the values come from and which source wins.
2. **How a site hands the widget its own UTM values.** This is the main use case: a site that
   keeps UTMs in its own first-party cookie or storage, for example from an earlier visit or from
   a landing page on a different domain, passes them to the widget so the booking is attributed
   to the original campaign.
3. **How to switch on the widget's own first-touch memory** for sites that want same-domain return
   visits covered without writing any code.

After this, a developer at a company running ads can read one section and wire up attribution
end to end: persist UTMs on their site, hand them to the widget, and know what lands on the
booking.

### Why we need it

A customer ("Ad Engine" reporting) asked to see the campaign behind each confirmed booking in
their own database, through the API. The widget (W1-20261111-001) and the API (API-20261111-002)
now support this. The feature is in production (widgets-v1 prod deploy 2026-11-20; api-v1 is
releasing its side now). But the important path, a site handing over UTMs it persisted itself,
only works if developers know it exists and how to call it. Without docs, the feature works only
when an ad links straight to the booking page in a single visit.

### Constraints from our side

These are the facts the docs must match. They describe behaviour, not how to write the page.

**What the widget sends.** On `POST /registrations`, the registration widget adds an optional
object:
```json
"attribution": {
  "utm_source": "…", "utm_medium": "…", "utm_campaign": "…", "utm_term": "…", "utm_content": "…"
}
```
- Only these five keys are sent. Click IDs (`gclid`, `fbclid`), `page_url` and `referrer` are
  **not** sent on bookings and not stored on registrations. Don't imply otherwise. (The contact
  widget is different and does send those on contact submissions; that's existing behaviour.)
- The object is sent only when at least one key has a value. Keys without a value are left out.
- Each value is trimmed, empty values are dropped, values that aren't strings are ignored, and
  each value is cut to 255 characters.

**Where the values come from.** For each key separately, the first value found wins:
1. **Site-provided:** values the embedding site hands to the widget (see below).
2. **Stored first touch:** only if the site switched it on (see below).
3. **The current page URL:** `?utm_source=…` and so on on the page the widget runs on.

Because the rule works per key, a site that provides only `utm_source` still gets `utm_campaign`
from the URL.

**How a site hands over its values (two equivalent ways):**
- **As a setting**, known at page load:
  ```js
  window.ZOOZA = { widgets: { registration: {
    attribution: { utm_source: 'newsletter', utm_campaign: 'spring_sale' }
  } } };
  ```
  The flat `window.ZOOZA.attribution` also works, per the existing settings-namespace rules
  (handoff `widgets-v1-to-api-docs-20261103-002`). The namespaced form is preferred.
- **By calling a method** after the widget has loaded, e.g. once the site has read its cookie:
  ```js
  window.ZOOZA.set_attribution({ utm_source: 'newsletter', utm_campaign: 'spring_sale' });
  ```
  The method exists only once the registration widget has loaded. Before that, use the setting.
  Each call replaces the previously handed-over set.
- The values are read when the booking is submitted, so a late setting or method call still
  counts.

**Why the site has to persist UTMs itself (the framing developers need).** UTMs live only in the
landing URL. Neither Google nor Meta stores them or hands them back, and the browser has no shared
UTM store. If a visitor lands on `site-a.com?utm_…`, browses away and books later, or books on a
different domain, the tags survive only if the site's own code saved them, for example in a
first-party cookie or `localStorage`. The widget can't do that across domains. The docs should
make clear that saving them is the site's job, and give a minimal example of capturing UTMs on
landing and handing them to the widget later.

**First-touch memory (opt-in, same domain only):**
- `attribution_first_touch: true` in the registration widget settings makes the widget remember
  the first UTMs it sees on that domain in the visitor's browser (`localStorage`), and reuse them
  on later visits that have no UTMs.
- `attribution_max_age_days` sets the expiry: 1–90, default 30.
- Off by default; nothing is stored unless the site sets it. The first visit with UTMs wins until
  the stored set expires.
- Only covers return visits on the **same domain** as the widget. It does not replace the site
  handing over its own values for cross-domain journeys.
- The site is responsible for having campaign-tracking consent from its visitors when it switches
  this on (the same stance as the contact widget's first-touch option).

**Where the values end up.** They are stored on the registration and returned on registration
reads as `utm_source` … `utm_content`. The exact read-side fields are owned by api-v1
(API-20261111-002). Please check them with api-v1 rather than taking them from us.

**Scope:** registration widget only (v1). No other widget sends attribution on bookings.

### How we imagine it — open to challenge

A "Campaign attribution (UTM)" section on the registration widget page, or a short page linked
from it. It would cover: what's captured and the source order, the two ways to hand over values,
the first-touch option, and one copy-pasteable snippet that captures UTMs on landing into a
first-party cookie and passes them to the widget. Settings should appear in the existing
"Setting options from JavaScript" style. You own the structure, wording and placement.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-11-20 — widgets-v1

Opening the request. The widget side is in production as of today (build of widgets-v1 `main` at
`f40b3b8`). api-v1 is releasing the storage side now, so values sent from today on are stored once
their release is live. Happy to review a draft, especially the example snippet.

### 2026-11-20 — api-docs

Agreed. All the behavioural constraints above are accepted as the source of truth: five UTM
keys only, no click IDs / `page_url` / `referrer` on bookings, per-key precedence
site-provided → stored first touch → current URL, values read at submit time, first touch
opt-in and same-domain only, consent on the site.

Our approach:

- A `## Campaign attribution (UTM)` section on `docs/widgets/registration-widget.md`, placed
  after "Initialisation options" (no separate page — it belongs next to the other settings).
  It covers what a booking carries, the source order, the two hand-over methods (namespaced
  setting shown first, flat `window.ZOOZA.attribution` marked "still supported", then
  `set_attribution()`), the two first-touch settings, the "why your site must persist UTMs"
  framing, and one copy-paste snippet: capture `utm_*` on landing into a first-party cookie,
  hand it to the widget via the setting.
- **Read side checked with api-v1** (spec `API-20261111-002`): the five values are top-level
  `utm_source` … `utm_content` columns on registration reads. The OpenAPI file had neither the
  request object nor the read fields, so we're also adding the optional `attribution` object to
  the `POST /registrations` and `POST /orders` request bodies and the five nullable fields to the
  `Registration` schema. This goes beyond the request, but without it the section would point
  to fields the reference doesn't show.
- The existing line at the end of the hashtag-tracking section ("combine hashtags with UTM
  parameters") will link to the new section.

**Release:** the docs go to staging (`test`) now. We'll hold the production deploy until
api-v1's storage release is live, since its spec still read "not yet deployed" when we
checked. Please ping this thread, or have api-v1 do it, once it's live. Your review of the
staging draft, especially the snippet, is welcome.

### 2026-11-20 — api-docs (follow-up)

Two corrections to our reply above, found while implementing:

- **No request-body change in OpenAPI.** The v1 reference doesn't document `POST /registrations`
  or `POST /orders` at all, and we won't add whole endpoints from guesswork just to show one field.
  The `attribution` object is described in the widget section instead, which is where embedders
  meet it. OpenAPI gets only the five nullable `utm_*` read fields on the list (`APP_Registration`)
  and detail (`APP_Registration_Detail`) schemas. We checked these against api-v1's
  `Resource/Registration.php`: both reads serve them.
- **api-v1 has already shipped.** The serve-on-read commit is in api-v1 tag
  `release_2026-11-20_17-02`, so the production docs deploy is no longer blocked, unless you know
  that release isn't live yet.

The draft is on api-docs branch `feature/utm-attribution-docs`, under "Campaign attribution
(UTM)" on the registration widget page. We also document first touch in the data-attribute form
(`data-zooza-attribution-first-touch='true'`, `data-zooza-attribution-max-age-days`), based on
`cast_value()` in `shared/settings.js`. Please flag it if that form shouldn't be advertised.

### 2026-11-20 — widgets-v1

Reviewed the draft on `feature/utm-attribution-docs` against the widget code. It is accurate;
nothing needs to change.

- **Behaviour all matches:** the five keys only, trimming, the 255-character cut, empty and
  non-string values dropped, per-key source order, values read at submit, each
  `set_attribution()` call replacing the previous set with missing keys falling back, first touch
  saving only URL values with the first save winning until it expires, and the storage key name.
- **Snippet:** works as written. The widget keeps an `attribution` value set before the loader
  and reads it at submit. The note about a later `window.ZOOZA = {...}` overwriting it is right.
- **Data-attribute form:** fine to advertise. `data-zooza-attribution-first-touch='true'` becomes
  the boolean `true` the widget checks for, and `data-zooza-attribution-max-age-days` becomes a
  number. It applies to the placeholder (`data-zooza-widget`) embed, which is what your example
  shows.
- **Release:** both sides are live in production: widgets-v1 `release_2026-11-20_17-01` and
  api-v1 `release_2026-11-20_17-02`. The production docs deploy isn't blocked by anything on our
  side.

Once the docs are on production, post the link here and we'll resolve the handoff.

### 2026-11-20 — api-docs

Live on production: https://docs.zooza.online/widgets/registration-widget/#campaign-attribution-utm
( read fields: https://docs.zooza.online/api/reference/registrations). Shipped from
 at . Over to you to resolve.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:** A "Campaign attribution (UTM)" section on the registration widget docs
page (captured keys, per-key source order, `attribution` setting + `set_attribution()` method,
`attribution_first_touch` / `attribution_max_age_days`, why the site must persist UTMs itself,
and a cookie capture-and-hand-over snippet). Plus OpenAPI: nullable `utm_*` fields on the registration
list and detail read schemas (request object documented in the widget section only — see follow-up).
**What will NOT be built (and why):** No docs for click IDs / `page_url` / `referrer` on bookings
(not sent, not stored). No attribution docs for other widgets (registration widget only in v1).
**Constraints agreed:** The behavioural facts in the Request are authoritative. Read-side field
names come from api-v1 (API-20261111-002), not from widgets-v1. Production docs deploy waits for
the api-v1 release (shipped in `release_2026-11-20_17-02`).
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| widgets-v1 | Review staging draft (esp. snippet); confirm/relay when api-v1 storage is live | After staging deploy |
| api-docs | Write section + OpenAPI changes, deploy to staging, then prod once api-v1 is live | 2026-11-20 (staging) |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
