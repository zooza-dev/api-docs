---
handoff_id: api-v1-to-api-docs-20261119-001
from: api-v1
to: api-docs
status: agreed
created: 2026-11-19
updated: 2026-11-19
related_specs: [API-20261118-005, API-20261119-001, DOC-20261118-001]
related_handoffs:
  - 2026-11-18-api-docs-to-api-v1-v3-document-gaps.md
  - 2026-11-18-api-v1-to-api-docs-v3-developer-guide.md
---

## Request

### What we need

The /v3 developer docs need an **Error codes** reference page. A partner who gets a `400` should be able to
look up any code there and learn:
- what it means;
- when it is returned;
- whether the response names a value (and where);
- what to do next, where that is useful.

The page must stay correct without anyone editing it by hand. It is built from the published document, so a
new or changed code shows up on the next docs build.

### Why we need it

Every error the API returns is `{"<code>": "<message>"}`. The message is localised into the **company's**
language, for the end user. Partners write code against the numeric code, and today nothing tells them what
any code means. The overview's Errors section already says "every code is listed in the error code
reference", and that page doesn't exist yet.

### Constraints from our side

- **Source:** the top-level `x-zooza-error-codes` array in `docs/openapi/zooza_api_v3.json`, which is the same
  document you already publish. It holds 318 entries, sorted by code:

  | Field | Meaning |
  |---|---|
  | `code` | four-digit string, e.g. `"0037"`; this is the key in the response |
  | `name` | stable identifier, e.g. `invalid_value` |
  | `area` | one of 13 groups ("Bookings", "Payments", "Authentication and access", …) |
  | `description` | when it is returned, written for partners; one or two sentences |
  | `message` | the **English** message. Real responses carry the company's language. Every code has one as of 2026-11-19. |
  | `value` | `in_message`: the value ends the message (`… - rate_tier`) or replaces `{value}`; `alongside`: it comes under key `0` next to the message; `none`: no value |

- **Tell partners to branch on `code`, never on `message`.** Messages are localised and their wording may
  change.
- **Don't promise that the code list is exhaustive per endpoint.** We don't track which endpoint returns which
  code (owner, 2026-11-19). Most generic codes (`wrong_parameters_sent`, `resource_not_found`,
  `invalid_value`, `update_failed`) can come from almost anywhere.
- **16 codes are not returned today.** Their descriptions say "Not currently returned" or "Reserved". The
  owner chose to keep them listed (2026-11-19). Spec API-20261119-001 decides, code by code, whether each one
  gets raised, retired or kept reserved. Show them as described. Don't hide them on your side, so that the
  page and the document never disagree.
- **Wording rule** (same as the rest of /v3): never mention gateway, api-v1, /v1, forwarding or legacy
  headers. The descriptions already follow it, and a test enforces it. The one exception is
  `refund_gateway_declined`, which refers to the payment provider's gateway, not ours.

### How we imagine it — open to challenge

One page with a section per `area` and a row per code, plus search or filter by code or name. Linking each
operation's `400` response to the page would help. The page could also explain the two value shapes once,
at the top, using the examples above. You know the docs tooling, so the layout is your call.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-11-19 — api-v1

Background is in the v3 gaps thread (`2026-11-18-api-docs-to-api-v1-v3-document-gaps.md`, our replies of
2026-11-19). This handoff replaces the "we'd like a page" note there. Since that thread:
- all 69 previously missing English messages are now in the document;
- four codes were renumbered before anyone used them (0364–0367);
- new codes are now allocated through a shared claim log, so two branches can no longer reuse a number.

Tell us if you need a field that isn't there, e.g. an "added on" date or HTTP status (always `400` today).

### 2026-11-19 — api-docs

Thanks, this is clear and we accept every constraint as written. Our approach:

- **One page, `/api/error-codes`**, generated at build time from `x-zooza-error-codes` in our verbatim copy of the
  document. Nobody edits it; a new or changed code appears on the next sync and build.
- A section per `area` (in order of each area's lowest code), one row per code: code, `name`, description,
  English message. Codes with a value get a short note ("value ends the message" / "value under key `0`"). A
  filter box at the top matches code, name, message or description.
- **Every code has its own anchor**, `/api/error-codes#0037`, so you, support and the guide can deep-link one code.
- The top of the page explains the envelope once, both value shapes with your examples, and "branch on the code,
  never the message". It also says plainly that a code isn't tied to particular operations and that the generic
  codes can come from almost anywhere. We won't promise per-endpoint lists.
- The 16 unreturned codes are shown exactly as described. No hiding, no badge of our own.
- `llms-full.txt` gets the same list as a Markdown table, so agents can read it too.
- Our wording check already scans the whole document, including these descriptions. `refund_gateway_declined`
  passes, because "gateway" is only allowed next to "payment" or "SMS" and that code's description says "payment
  provider".

While checking, we found that our Errors page showed the `400` entry as `{"0065": ["resource_not_found",
"Registration"]}`. That's wrong against your `RequestError` description. We're correcting it to the
`{"0066": "…"}` shape, with the value at the end of the message or under key `0`.

**One ask, optional:** if each operation's `400` response description ended with "Codes: see the error code
reference (https://docs.zooza.online/api/error-codes)", the link would show in the reference and in `/v3/openapi.json`
itself. Your call. We don't need extra fields: HTTP status is always `400` and "added on" isn't worth it yet.

Moving to `agreed` with the Decision Summary below. Tell us if anything in it is off.

### 2026-11-19 — api-docs (follow-up)

The page is built and in our sidebar. Looking at it next to the reference, the link from `400` responses is more
than a nice-to-have. A developer reading `PUT /registrations/{ID}` sees the envelope and the code shape, but has no
way to find out what `0066` means. So we're making the optional ask from our last reply a firm request:

- **What:** the description of the shared response `components/responses/RequestError` ends with a link to the
  error code reference. Every operation's `400` uses that response, except `POST /v3/token`, which has OAuth errors
  and doesn't need the link. So one edit covers all 27. For example:

  > The request failed. HTTP 400 with the error codes and localised messages. What each code means:
  > [error code reference](https://docs.zooza.online/api/error-codes).

- **Absolute URL**, because `/v3/openapi.json` is also read outside our site.
- **Optional:** the example codes in `RequestError.errors` (`0066`, `0037`, `0074`) could link to their rows, e.g.
  `https://docs.zooza.online/api/error-codes#0066`. Every code has an anchor of that form, and it's stable.
- **Wording:** your call. The URL is the only part we need.

This doesn't change the Decision Summary beyond moving "optionally link `400` responses" to "link `400` responses".
We've updated that row. We'll pick the link up with the next copy of the document.

### 2026-11-19 — api-v1 (link done)

Done as asked. `components/responses/RequestError` now ends with "What each code means:
[error code reference](https://docs.zooza.online/api/error-codes)." That covers every `400` except `POST /v3/token`,
which has its own response. The URL is a constant in the builder and a test checks that it's there. We left out
per-code anchors in the `RequestError.errors` examples. Your Decision Summary is right as written.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:** api-docs: an Error codes page at `/api/error-codes`, generated at build time from
`x-zooza-error-codes`, with a section per area, a row and an anchor (`#<code>`) per code, a filter box, an intro
covering the envelope, both value shapes and "branch on code", and the same list in `llms-full.txt`. The Errors page
links to it and shows the correct `400` shape. api-v1: keeps `x-zooza-error-codes` complete and described, and links
the shared `400` response to the page.
**What will NOT be built (and why):** Per-endpoint code lists, because api-v1 doesn't track which endpoint returns
which code (owner, 2026-11-19). No hiding or badging of the 16 unreturned codes on the docs side, so the page and the
document never disagree. No hand-edited copy of the list.
**Constraints agreed:** The document is the only source. Branch on `code`, never on `message`. English messages are
reference only; real responses use the company's language. The /v3 wording rule applies.
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-v1   | Keep `x-zooza-error-codes` complete and described; settle the 16 unreturned codes (API-20261119-001); link the shared `400` response (`components/responses/RequestError`) to the page | ongoing |
| api-docs | `/api/error-codes` generated from the document; Errors page fix; `llms-full.txt` table (DOC-20261118-001) | with the /v3 docs release |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
