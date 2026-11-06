---
handoff_id: api-docs-to-widgets-v1-20261106-001
from: api-docs
to: widgets-v1
status: agreed
created: 2026-11-06
updated: 2026-11-06
related_specs: [W1-20261106-001]
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

### 2026-11-06 — widgets-v1

Thanks. Your diagnosis was right: the value has been `0` since `83931f0`. The fix is built and verified locally (spec `W1-20261106-001`, branch `feature-registration-conversion-value`). **It is not released yet.** Please hold the copy until we confirm the release.

All your constraints are met. No event name or existing data key changed, the new data is added alongside the old, and pages without GTM, `gtag` or `fbq` behave as before. Here is the contract to document.

**Value keys.** These are the same numbers the client sees in the widget's price summary, in the currency shown there:

| Key | Meaning |
|---|---|
| `zooza_total_price` | Whole order value: what is paid now plus what is paid later (instalments or down-payment remainder). Includes add-on products and discounts. |
| `zooza_pay_now` | The part due right away. Equal to `zooza_total_price` unless the order is split into instalments or a down payment. |
| `zooza_currency` | ISO currency code, e.g. `EUR`. |

Both amounts are numbers rounded to 2 decimals. A free or trial registration sends `0`.

**Events that carry the value keys** (dataLayer, `gtag` and Meta `trackCustom`, as before):

| Event | When it fires | Data |
|---|---|---|
| `zooza_event_form_submit_start` | The client clicks submit and the form passes validation, **before** the booking is accepted. Fixed: it now sends real values. | the three value keys |
| `zooza_event_form_submit_done` | The registration has been accepted. Fires once per successful registration. **Recommended conversion event.** | `zooza_form_submit_done: true` + value keys |
| `zooza_event_form_submit_go_to_payment` | After `form_submit_done`, when the client is sent to pay | `zooza_form_submit_go_to_payment: true` + value keys |
| `zooza_event_form_submit_thank_you` | After `form_submit_done`, when the client lands on the confirmation (no immediate payment) | `zooza_form_submit_thank_you: true` + value keys |

`go_to_payment` and `thank_you` never fire for the same registration; it's one or the other. Please make clear in the copy that `form_submit_start` is not a conversion, because the booking can still fail after it.

**New: Meta Pixel standard events.** These are sent *in addition to* the custom events above, only when Meta Pixel (`fbq`) is on the page:

| Standard event | Fires together with | Parameters |
|---|---|---|
| `CompleteRegistration` | `zooza_event_form_submit_done` | `value` = `zooza_total_price`, `currency` |
| `InitiateCheckout` | `zooza_event_form_submit_go_to_payment` | `value` = `zooza_pay_now`, `currency` |

We chose Meta's standard events on purpose, so value-based optimisation works with no setup. **Please warn about double counting in the copy.** A client who already made a custom conversion from `zooza_event_form_submit_done` or `..._thank_you` and also optimises on standard `CompleteRegistration` will count each registration twice. They should use one or the other as the conversion.

**Not in this change:**
- **No value on `zooza_event_payment_response`, and no standard `Purchase`.** That event fires after the client returns from the payment gateway, on a fresh page load where the order value is no longer available. The value is recorded at submit (`form_submit_done` / `go_to_payment`) instead. `payment_response` keeps its current data (`zooza_payment_response: true|false`).
- **GA4 recommended e-commerce events** (`purchase` etc.). Clients can map the value keys in GTM.
- **The "register again anyway" path**, after the duplicate-registration prompt (`resolve_conflict`). It has never sent tracking events, and this change leaves that as it is.

### 2026-11-06 — api-docs

Thanks, the contract is clear and we accept it as written. The docs update is drafted on api-docs branch `feature-registration-conversion-value`, and we're holding it until you confirm the release. It covers the value keys and the four events that carry them, recommends `form_submit_done` as the conversion, says `form_submit_start` is not a conversion, adds the `CompleteRegistration` / `InitiateCheckout` table with the double-counting warning, explains why `payment_response` has no value, and removes the "value is 0" caveat. Please post here once `feature-registration-conversion-value` is deployed and we'll publish the same day.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:** Correct `zooza_total_price` / `zooza_pay_now` / `zooza_currency` on `zooza_event_form_submit_start`. The same keys are added to `form_submit_done`, `form_submit_go_to_payment` and `form_submit_thank_you`. Meta standard events are added: `CompleteRegistration` (value = total) with `form_submit_done`, and `InitiateCheckout` (value = pay now) with `form_submit_go_to_payment`. Both are sent alongside the existing custom events.
**What will NOT be built (and why):** No value on `payment_response` and no `Purchase`, because the value isn't available after the gateway round trip and recording it at submit is enough. No GA4 e-commerce events. No tracking on the `resolve_conflict` re-submit path (unchanged).
**Constraints agreed:** No event or data key is renamed or removed; changes only add data. Pages without trackers behave as before. Docs must warn about double counting between Meta standard events and custom conversions built on the `zooza_*` events.
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-docs | Document the final event data and any new events on the registration widget page; remove the "value is 0" caveat once released | after widgets-v1 release |
| api-docs | Recommend `form_submit_done` as the conversion event and add the Meta double-counting warning | with the same copy update |
| widgets-v1 | Ship W1-20261106-001 (value keys + Meta standard events) and confirm the release in this thread | merge + deploy of `feature-registration-conversion-value` |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
