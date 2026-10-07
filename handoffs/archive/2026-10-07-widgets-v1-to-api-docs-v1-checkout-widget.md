---
handoff_id: widgets-v1-to-api-docs-20261007-001
from: widgets-v1
to: api-docs
status: resolved
created: 2026-10-07
updated: 2026-10-07
related_specs: ["W1-20260918-002"]
---

## Request

### What we need

Documentation for the **new (v1) checkout widget**: how to embed it, how it is configured, and that it
supersedes the legacy `/widgets/v2` checkout — with the v2 checkout docs marked **deprecated** and a
migration pointer. After this, a reader finds the current checkout widget under the v1 widgets, with the
correct embed and parameters, and is steered off the v2 one.

### Why we need it

The checkout widget was rebuilt on the v2 stack (Preact, light DOM) and **re-homed into widgets-v1**,
served at `/widgets/v1/?type=checkout`. It now sells configurable products — entry passes (pack × payment
plan) — via the shared product form. The old jQuery checkout remains in widgets-v2 as legacy. Current docs
describe only the v2 checkout.

### Constraints from our side

- The embed is the **standard v1 placeholder + loader** shape (same as registration / profile / contact),
  so the checkout doc should match their structure rather than invent a checkout-specific one.
- The v1 checkout is styled by `base.css` (two-tier `zooza-*` classes), not `style.css`; any "custom CSS
  class" references for checkout should point at the v1 class vocabulary, and migrating tenants are told
  their v2 custom CSS won't carry over.
- Keep the v2 checkout docs reachable but clearly deprecated (don't delete — tenants still run it).

### How we imagine it — open to challenge

A v1 checkout widget page mirroring the other v1 widget docs, plus a deprecation banner on the v2 checkout
page linking to it. You own the structure and wording. Reference facts:

- **Embed:**
  ```html
  <div data-zooza-widget="checkout" data-zooza-id="API_KEY"></div>
  <script async src="https://api.zooza.app/widgets/v1/loader.js"></script>
  ```
- **Parameters** (read from the page URL): `?product=<id>` (the product to buy), `?return_url=<url>`
  (where to send the buyer after), plus the resume params `?r=` / `?payment_response=`. This is the model
  the profile dashboard uses to link into checkout.
- **What it does:** renders the product (including entry-pass offers — pack × payment plan), collects the
  buyer, agreements and payment method, and creates the order (`POST /v1/orders`).
- **Supersedes:** the `/widgets/v2` checkout (legacy jQuery), now deprecated.

---

## Discussion

<!-- Each reply: append, never edit previous entries -->

### 2026-10-07 — widgets-v1
Opening the request. Paired with `widgets-v1-to-zooza-app-20261007-001` (the app generating the new embed).

### 2026-10-07 — api-docs
Accepted. We'll follow your constraints: the standard v1 placeholder + loader structure, the v1 `zooza-*` class
vocabulary with a note that v2 custom CSS won't carry over, and keeping the v2 page reachable but deprecated.

**Structure (slightly different from your suggestion):** `widgets/checkout-widget` *becomes* the v1 page, so the
existing URL, sidebar entry and inbound links point at the current widget. The v2 content moves to
`widgets/checkout-widget-v2` with a deprecation banner. The v1 page has a "Migrating from the v2 checkout" section.

**Facts we took from the widgets-v1 source, beyond what the request listed** — please shout if any are wrong:
- `product`, `return_url`, `currency`, `r` and `payment_response` are read from the page URL only.
  `data-zooza-product` is not honoured, in v1 or in legacy v2, so we removed the data-attribute tab from both pages.
  On the placeholder, only `lang` / `translations` are documented.
- `return_url` only sets the target of the thank-you screen's "Continue" button; there is no automatic redirect. It
  must be http(s) and have the same origin as the checkout page or the profile widget, otherwise it is silently
  ignored. Without it, the button goes to the profile widget.
- `currency` accepts EUR, CZK, RON, GBP, PLN and HUF.
- `r` / `payment_response` are documented as set by Zooza ("don't add them to your links").
- There is no coupon / discount-code field. We removed the wrong "coupon field" mention from the v2 page too.
- One checkout per page: only the first placeholder mounts and the others stay empty, silently.
- Default CSS URL: `/widgets/v1/css/?widget=KEY&type=checkout`. The product form and payment chooser still emit
  legacy `zooza_*` classes; we document that.
- The WordPress plugin still emits the v2 checkout, both from the page setting and the shortcode, so WordPress users
  are told to use a Custom HTML block.

**Timing:** the docs ship together with the widgets release and are written as live.

**Flags for widgets-v1 (not blocking):**
1. Spec W1-20260918-002 still says the checkout "stays in the widgets-v2 repo, served at /widgets/v2" (lines 32-33).
2. wp-plugin still emits the v2 checkout embed. This probably needs a follow-up handoff to wp-plugin.
3. Consider a console warning / notice for multiple checkout placeholders, as contact has. If you add one, we'll
   update the docs.

---

## Decision Summary
<!-- Filled when status moves to "agreed" -->

**What will be built:** `widgets/checkout-widget` documents the v1 checkout: placeholder + loader embed, URL
parameters (`product`, `return_url`, `currency`, `lang`), the buyer flow, settings, styling (v1 class vocabulary)
and a migration section. The legacy page moves to `widgets/checkout-widget-v2`, marked deprecated. Loader-version
tables, quickstart, the widgets index and llms.txt are updated so checkout is listed as v1.
**What will NOT be built (and why):** No deletion of the v2 docs, because tenants still run it. No `data-zooza-product`
docs, because it is not supported. No coupon docs, because the feature doesn't exist.
**Constraints agreed:** Mirror the other v1 widget pages; point to v1 `zooza-*` classes; tell migrating tenants that
v2 custom CSS won't carry over; keep v2 reachable.
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| widgets-v1 | Ship v1 checkout at `/widgets/v1/?type=checkout`; confirm the facts above; update spec W1-20260918-002 | widgets release |
| api-docs   | v1 checkout page + deprecated v2 page + cross-reference updates | same release |

---

## Resolution
<!-- Filled when status moves to "resolved" -->
**Resolved on:** 2026-10-07
**Outcome:** Built as agreed. `docs/widgets/checkout-widget.md` now documents the v1 checkout (embed, URL parameters,
buyer flow, settings, styling, migration from v2). The legacy page moved to `docs/widgets/checkout-widget-v2.md`
with a deprecation banner, and wrong v2 claims were corrected (`data-zooza-product`, coupon field). Loader tables,
quickstart, the widgets index and llms.txt list checkout as v1. Merged to `test` (staging). Production goes out
with the widgets release via the production deploy workflow. Open follow-ups for widgets-v1: update spec
W1-20260918-002, and decide on a wp-plugin handoff for the v1 checkout embed.
**Related specs/PRs:** W1-20260918-002; api-docs branch `feature-v1-checkout-widget`
