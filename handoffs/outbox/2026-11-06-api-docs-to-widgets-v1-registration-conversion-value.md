---
handoff_id: api-docs-to-widgets-v1-20261106-001
from: api-docs
to: widgets-v1
status: open
created: 2026-11-06
updated: 2026-11-06
related_specs: []
---

## Request

### What we need

Clients who track registrations in Google Tag Manager, GA4 or Meta Pixel need to be able to:

1. **See the real order value.** Today the one event that is meant to carry it, `zooza_event_form_submit_start`, always sends `zooza_total_price: 0` and `zooza_pay_now: 0`. `zooza_currency` is still correct.
2. **Get the value on the events that mark a conversion.** These are a completed registration (`zooza_event_form_submit_thank_you`), being sent to payment (`zooza_event_form_submit_go_to_payment`) and a successful payment (`zooza_event_payment_response`). `form_submit_start` fires on the submit click, before the booking succeeds, so it can't be used as a conversion value.
3. **Optimise Meta campaigns on value without extra setup.** Meta currently receives only custom events (`fbq('trackCustom', …)`). The value appears under `zooza_*` names rather than Meta's standard `value` and `currency`, so Meta can't use it for value-based optimisation.

### Why we need it

- docs.zooza.online tells clients that `zooza_event_form_submit_start` "sends the value of the order to analytics". Since July 2025 that hasn't been true: anyone who built conversion-value reporting on it has been recording 0.
- A client asked why the conversion events don't carry the order value. We'd like to document a correct answer rather than a workaround.

### What we found (for context)

- `4b1039b` (ZOOZA-3471, 2024-08-09) added the assignments to `document.ZOOZA.gtm.total_price` and `document.ZOOZA.gtm.pay_now` as the price is calculated.
- `83931f0` ("model", 2025-07-18) removed all of those assignments. Now only the initial `{ total_price: 0, pay_now: 0, currency }` remains (`widgets_src/registration/main.js:1448`), and `track('zooza_event_form_submit_start', …)` at about line 9761 reads those zeros.
- Meta Pixel has received only `trackCustom` since `769aab0` ("meta pixel", May 2025). No standard events were ever sent.

### Constraints from our side

- Keep every existing event name and every existing event data key. Clients have GTM triggers and Meta custom conversions built on them, so new data should be added rather than renamed.
- If you add new events or new data keys, tell us the names, when they fire and what they contain, so we can document them on the registration widget page.
- Pages without GTM, `gtag` or `fbq` must keep working quietly, as they do today.

### How we imagine it — open to challenge

- Restore the order value wherever the price is now calculated in the model, so `zooza_total_price` and `zooza_pay_now` are correct again on `form_submit_start`.
- Add the same three keys (`zooza_total_price`, `zooza_pay_now`, `zooza_currency`) to `form_submit_thank_you`, `form_submit_go_to_payment` and the successful `payment_response`.
- Possibly also send a standard Meta event alongside the custom one, with `value` and `currency`: for example `Purchase` on a successful payment, and `Lead` or `CompleteRegistration` on a completed registration. Whether to do this, and whether it should be opt-in to avoid double counting for clients who already map custom conversions, is your call.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:**
**What will NOT be built (and why):**
**Constraints agreed:**
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-docs | Document the final event data and any new events on the registration widget page; remove the "value is 0" caveat once released | after widgets-v1 release |
| widgets-v1 | ... | ... |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
