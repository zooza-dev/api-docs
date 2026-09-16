---
handoff_id: widgets-v1-to-api-docs-20260916-001
from: widgets-v1
to: api-docs
status: resolved
created: 2026-09-16
updated: 2026-09-16
related_specs: [W1-20260914-001, W1-20260914-002, W1-20260916-001]
related_handoffs:
  - 2026-09-15-widgets-v1-to-api-docs-retire-legacy-embed-code.md
  - 2026-09-14-api-v1-to-widgets-v1-lead-capture-contact-widget.md
---

## Request

### What we need

A **new documentation page for the Contact form widget**, mirroring the structure of the
registration widget page (https://docs.zooza.online/widgets/registration-widget/) — the same
sections (Installation, Settings, Initialisation options, Analytics, Events/callbacks,
Styling, Examples). Your reply on the retire-legacy-embed handoff noted there is no contact
page yet; this is the content for it. All the contact-specific facts are below.

### Why we need it

The contact form widget is the input to the new Lead-capture module. Companies embedding it
need the same self-serve reference the other widgets have: how to embed it, what it renders,
what they can configure, and what analytics it fires.

### The content to document

**1. Overview / key facts**
- The contact widget renders a **company-configured contact form** (fields, consents, success
  behaviour are set up in the app under the contact form's configuration) and submits enquiries
  into the Lead-capture module.
- **One contact form per page** (like the other widgets). If a page has more than one contact
  placeholder, only the first renders; the rest show a small "only one contact form per page"
  notice.
- **Invisible spam protection** is built in and automatic — nothing to configure (details below).

**2. Installation (embed)** — the widget uses the current **placeholder + loader** model only;
there is **no legacy inline-script embed** for contact. Two placements:

*Body only*
```html
<div data-zooza-widget="contact" data-zooza-id="API_KEY" data-zooza-config-id="12"></div>
<script async src="https://api.zooza.app/widgets/v1/loader.js"></script>
```
*Head + body (loads faster)* — the same `<div>` in the body, the loader `<script>` in `<head>`.

- `data-zooza-id` = the widget API key. `data-zooza-config-id` = the contact-form configuration
  id (**optional** — omit it and the widget loads the company's **default** contact form).
- Region host rides the loader `src` (e.g. `uk.api.zooza.app`, `asia.api.zooza.app`).
- **No WordPress shortcode** for contact in v1 (relayed from the app).

**3. Settings (configured in the app, not on the embed)** — set on the contact form
configuration in the widget application, rendered by the widget verbatim:
- Standard fields toggled on/off: **first name, last name, email, phone, message**.
- **Custom fields**, any of: `text`, `long_text`, `number`, `date`, `boolean`, `select`,
  `multiselect` — with the company's own labels, options and required flags.
- **Consents** to accept: type `none` / `checkbox` / `radio`, mandatory or optional.
- **Success behaviour**: a thank-you message, or a redirect URL.
- **Attribution first-touch** on/off (see Analytics), and **allowed domains**.

**4. Initialisation options (embed `data-zooza-*` attributes / URL params)** — contact has a
small set (the form itself comes from the server config, so there are no course/place filters):

| Option | Attribute | URL param | Notes |
|---|---|---|---|
| Form config id | `data-zooza-config-id` | `?config_id=` | Optional; omit → company default form |
| Language | `data-zooza-lang` | `?lang=` | e.g. `sk`, `en`, `de`, `cz`, `pl`, `ro`, `hu`, `it`, `fr`; also honours `<html lang>`, else the company default |
| API host override | `data-zooza-api-url` | — | Rarely needed; normally the loader resolves it |
| Hidden-field value (embed source) | `data-zooza-field-<name>` | — | Supplies the value for a hidden field whose source is "embed" (below) |

**Hidden fields.** A form can include hidden fields whose value is filled automatically from
one of: a **URL query parameter**, a **cookie**, an **embed attribute**
(`data-zooza-field-<name>`), or a **fixed value** — configured per field on the form. Useful for
passing a campaign ref, a page identifier, etc.

**5. Analytics** — the widget automatically fires lifecycle events to the tag managers already
on the host page. Nothing to configure; if a tag manager is absent it's simply skipped.

Fired to **GTM** (`window.dataLayer.push({ ...data, event })`), **GA4** (`gtag('event', …)`),
**legacy UA** (`ga('send','event',…)`) and **Meta Pixel** (`fbq('trackCustom', <event>, <data>)`)
— same mechanism as the registration widget. Payloads contain **no personal data** (no
email/phone/message/name) — only the event flag and the form id:

| Event name | Fires when | Data payload |
|---|---|---|
| `zooza_event_contact_form_view` | the form is displayed | `{ zooza_contact_form_view: true, zooza_contact_form_id: <id> }` |
| `zooza_event_contact_form_submit_start` | the visitor submits and client-side validation passes | `{ zooza_contact_form_submit_start: true, zooza_contact_form_id: <id> }` |
| `zooza_event_contact_form_submitted` | the submission is accepted (the conversion / Lead event) | `{ zooza_contact_form_submitted: true, zooza_contact_form_id: <id> }` |

**Campaign attribution (separate from the events above).** The widget also captures, and sends
to the API with each enquiry, where the visitor came from: page URL, referrer, `utm_source`,
`utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `fbclid`, `gclid`. By default it reads
these from the current page URL; if **first-touch** is enabled on the form, the first campaign
parameters a visitor arrives with are remembered (first-party `localStorage`, bounded lifetime)
until they submit on a later page. (Note for the company: first-touch stores campaign data on
the visitor's browser — they should have appropriate consent on their site.)

**6. Events and callbacks** — the contact widget exposes **no JavaScript callback hooks** in v1
(unlike registration's `render_course_tile` etc.). Please state this so readers don't look for
them.

**7. Styling** — the widget renders into the host page's own DOM (light DOM) with a minimal base
stylesheet and adopts the host's fonts/colours. Every element carries two class hooks:
- a shared class (e.g. `zooza-input`, `zooza-button__primary`, `zooza-field`, `zooza-label`,
  `zooza-error`) — restyle a primitive across all Zooza widgets;
- a contact-scoped class (`zooza-contact-input`, `zooza-contact-button__primary`, …) — restyle
  only the contact form.

Base styles are low-specificity, so a company's own CSS overrides them with no `!important`.
Design tokens are exposed as CSS custom properties on the widget root (e.g. `--zooza-accent`,
`--zooza-radius`, `--zooza-gap`, `--zooza-max-width`) — e.g.
`.zooza-contact-widget { --zooza-accent:#0a7; --zooza-max-width:720px; }`. The form is capped at
`--zooza-max-width` (default 660px) and centred, like the registration widget.

**8. Behaviour worth mentioning**
- **Email typo help**: if someone types `name@gmial.com` the widget offers a one-click "did you
  mean `name@gmail.com`?".
- **Phone**: a single phone field (the country code is inferred; no separate picker).
- **Spam protection (invisible)**: a proof-of-work check, a hidden honeypot field, and a short
  minimum time before submit — all automatic and invisible to real visitors; no CAPTCHA.
- **After submit**: the company's success message shows in place, or the visitor is redirected to
  the configured URL.

**9. Examples**
```html
<!-- default contact form -->
<div data-zooza-widget="contact" data-zooza-id="API_KEY"></div>
<script async src="https://api.zooza.app/widgets/v1/loader.js"></script>

<!-- a specific form, in Slovak, with a hidden "ref" field filled from the embed -->
<div data-zooza-widget="contact" data-zooza-id="API_KEY"
     data-zooza-config-id="12" data-zooza-lang="sk" data-zooza-field-ref="landing-a"></div>
<script async src="https://api.zooza.app/widgets/v1/loader.js"></script>
```

### Constraints from our side

- The embed shapes, attribute names, event names and payloads above are the widgets-v1 contract —
  reproduce them exactly. The analytics event/flag names match the registration convention.
- Don't document a legacy inline-script embed for contact — it doesn't exist for this widget.
- The `contact.*` UI strings (button labels, validation messages) are registered by api-v1; not
  something the embedder configures.

### How we imagine it — open to challenge

A new page under the widgets section, structured like the registration widget page. You own the
page structure, wording and platform-specific instructions; the above is the authoritative
reference for what the contact widget does.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-09-16 — api-docs

Thanks. The page is live on `test` as `docs/widgets/contact-widget.md` (commit `c0a5af1`, merged in `fc0b375`). We wrote it from the agreed api-v1 ↔ widgets-v1 contract and the widgets-v1 source on `feature-lead-capture`, then checked it against this request. Embed shapes, attribute names, event names and payloads are reproduced exactly; there is no legacy script tab.

Where the page differs from this request, it follows the code:

1. **`lang` values.** The request lists `sk`, `en`, `cz`, … for `data-zooza-lang` / `?lang=`, and example 9 uses `data-zooza-lang="sk"`. `shared/i18n.js` `get_language()` only accepts full locale codes (`sk-SK`, `en-EN`, `cz-CZ`, …); a two-letter value is ignored and resolution falls through to `<html lang>` and then the company language. The page documents the full codes, as the other widget pages do. The two-letter codes are only what the widget *submits* to the API.
2. **`translations`.** The request says the `contact.*` UI strings are not something the embedder configures. The widget does honour `window.ZOOZA.translations[key]` (`__get_translation()`), the same as the other widgets, so the page documents it with the `contact.*` keys the code uses and the `global.*` standard-field labels. `contact.phone_hint_international` and `contact.loading` are left out because the widget never renders them.
3. **Allowed domains.** The request places them on the form configuration. Since the 2026-09-15 amendment they are the widget application's domain, the contact widget URL host and the contact widget's `additional_domains`, so the page documents them under `Publish > Widget > Contact form`.

Deliberately not documented: how spam protection works (minimum delay, honeypot field name and selectors, proof of work, token lifecycle). Everything is readable in the public bundle, but spelling it out in indexed docs and `llms-full.txt` lowers the effort for spammers. The page tells integrators only what they will notice: sending may pause briefly, don't unhide hidden inputs, spam gets the same success response, and page caching is fine.

Closing this as resolved from our side.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:** A contact widget page in api-docs (`docs/widgets/contact-widget.md`) covering the placeholder + loader embed (Body only, Head + body), configuration resolution, widget settings, form configuration and field types, hidden fields, attribution with opt-in first touch, spam protection from the integrator's point of view, init options (`config_id`, `lang`, `translations`, `print_debug`), styling variables and class hooks, analytics events, and a statement that there are no callbacks. It is linked from the sidebar, widgets overview, embed methods, quickstart and `llms.txt` / `llms-full.txt`.
**What will NOT be built (and why):** No legacy script embed, because none exists for contact. No description of how the spam protection works, to avoid handing spammers a recipe.
**Constraints agreed:** Embed shapes, attribute names, event names and payloads follow the widgets-v1 contract exactly. Where the request and the code disagree (`lang` codes, `translations`, allowed domains), the docs follow the code; see the 2026-09-16 api-docs entry.
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| widgets-v1 | Authoritative reference for the contact widget's embed / options / analytics / styling (above) | — |
| api-docs   | New contact widget documentation page mirroring the registration page structure | — |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:** 2026-09-16
**Outcome:** Built. The contact widget page is on `test` (staging). It follows the code where the request differed (`lang` codes, `translations`, allowed domains) and leaves out how spam protection works. It ships to production with the rest of lead capture.
**Related specs/PRs:** api-docs commits `c0a5af1` (Document the contact widget), `fc0b375` (merge into `test`); widgets-v1 W1-20260914-001, W1-20260914-002, W1-20260916-001
