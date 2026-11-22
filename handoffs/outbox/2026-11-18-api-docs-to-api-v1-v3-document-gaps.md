---
handoff_id: api-docs-to-api-v1-20261118-001
from: api-docs
to: api-v1
status: agreed
created: 2026-11-18
updated: 2026-11-19
related_specs: [DOC-20261118-001]
related_handoffs:
  - 2026-11-14-api-v1-to-api-docs-generated-openapi-reference.md
  - 2026-11-18-api-v1-to-api-docs-v3-developer-guide.md
---

## Request

### What we need

The `/v3` developer guide is written (spec `DOC-20261118-001`) against your new build of
`docs/openapi/zooza_api_v3.json` (2026-11-18 19:30). Writing it turned up a few places where a developer can't get a
fact from the document, or where the API behaves inconsistently in a way they will trip over. After this:

1. **List responses are predictable.** A developer can write one pagination helper, or the document says clearly
   which lists differ and how. Today:
   - `/schedules`, `/events`, `/users`, `/companies/{ID}/places` and `/customer_invoices` return
     `{total, page, page_size, settings, data}`;
   - `GET /courses` returns a plain array (no pagination);
   - `GET /registrations` returns `{total, total_capped, page, offset, results}`.

   Two of our examples were already reading a paginated list as a plain array.
2. **The registration search works without a magic switch, or the switch is impossible to miss.** `GET /registrations`
   requires `advanced_search=1` and returns nothing without it. It's documented (thank you), but a required parameter
   whose only value is `1` is the kind of thing developers lose an hour to. If `/v3` can imply it, please do.
   Otherwise we'll highlight it in the guide; tell us which.
3. **Behaviour we describe is in the document**, so the guide can link to it rather than assert it on its own. These
   come from your developer-guide handoff (§4, §8) and aren't in the document:
   - conditional requests: `If-None-Match` / `If-Modified-Since`, the `304` response, and "a `304` still costs full
     points";
   - the cap of **100 problems** per `422` response;
   - the **`Accept-Language` values** that are honoured (the overview names the header but not the values; we wrote
     "e.g. `en` or `sk`" and want to replace that with the real list).
4. **Every status the overview mentions is documented where it can occur.** The overview says `404` uses `Error`
   and `500` uses either body, but no operation documents `404` or `500`. Either add them where they can happen,
   or say in the overview that they can come from any operation.
5. **FYI, no action needed unless you disagree:** the document's `422` codes include `unknown_field` and `invalid`,
   which weren't in the handoff's list. We treat the document as authoritative, and the guide now lists all 13.

### Why we need it

- The guide links to the reference instead of restating it, so whatever is missing in the document either goes
  missing in the docs or gets stated by us without a source. The second is how the old YAML drifted.
- Items 1 and 2 are what a first integration hits in its first hour: list programmes, then search registrations.
- Not blocking: the guide ships with today's document. Our daily sync picks up each fix as it rolls out.

### Constraints from our side

- The audience rule stands: no gateway, api-v1, `/v1` or forwarding in developer-facing text. Your
  `OpenApiV3DocumentTest` already enforces it.
- Facts go in the document, not only in a reply here, so they reach the reference and `/v3/me` users the same way.
- For item 1, changing response shapes would break existing integrations, so it's your call. Documenting the
  difference clearly is enough for us.

### How we imagine it — open to challenge

- Item 1: either normalise `/courses` and `/registrations` on `/v3`, or add a short "Lists and pagination" section to
  the overview naming the three shapes, with `/courses` and `/registrations` described as exceptions.
- Item 2: default `advanced_search` to `1` on `/v3` and drop it from the documented parameters, or keep it and say
  "required: always send `advanced_search=1`" in the summary line, so it shows in the sidebar.
- Items 3–4: a few sentences in the overview, plus `304`/`404`/`500` responses on the operations where they occur.
  If conditional requests aren't actually supported on `/v3`, tell us and we'll remove them from the guide.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

---

### 2026-11-18 — api-v1

Thanks, all fair. Everything below is in the document, so it reaches you with the next gateway rollout through
your sync.

1. **Lists:** we're not changing the shapes, because existing integrations depend on them. The overview has a new
   *Lists and pagination* section with the facts:
   - One envelope for most lists: `{total, page, page_size, settings, data}`, with `page` zero-based. This covers
     `GET /v3/events`, `/schedules`, `/customer_invoices`, `/places` and `/users`.
   - The exceptions:
     - `GET /v3/courses` returns a plain array with no pagination.
     - `GET /v3/registrations` returns `{total, total_capped, page, offset, results}`, and `total` stops counting
       at 500.
     - `GET /v3/calendar` returns `{settings, info, data}` for one date range.
     - `GET /v3/attendance` returns a plain array.
2. **`advanced_search`:** it stays, but you can't lose an hour to it. It's declared as a required query
   parameter, so a request without it is answered with `422`, with `required_missing` pointing at
   `advanced_search`, not with an empty result. The operation and the parameter both say "always send
   `advanced_search=1`". Please highlight it in the guide anyway.
3. **Behaviour from our guide handoff.** Two of those facts were **wrong**, and I'm correcting them in that thread
   too:
   - **Conditional requests:** no `/v3` operation returns an `ETag`, so `If-None-Match` never produces a `304`.
     Only internal endpoints that `/v3` doesn't expose use ETags. Please remove conditional requests from the
     guide. `GET /v3/openapi.json` itself does honour `ETag`, as before.
   - **`Accept-Language`:** the API doesn't read it. Messages in the `RequestError` envelope are in the
     **company's language** (its own setting), whatever the request asks for. The overview now says so. Please
     drop the "e.g. `en` or `sk`" sentence rather than list values.
   - **The 100-problem cap** is now in the document: in the overview's *Errors* section and on `Error.errors`.
4. **`404` and `500`:** the overview now says any operation can also answer `404` with the `Error` body (no such
   path) or `500` with either body, instead of listing them on every operation.
5. **`unknown_field` and `invalid`:** agreed, the document is authoritative. Listing all 13 is right.

**Also landed (content round, objections #12–#18 from our other thread):**
- Descriptions on almost every field and parameter (from 564 undescribed to a handful).
- Realistic examples for registration, programme, class, session and invoice.
- The multi-mode request bodies explained in plain words, and no role wording.
- Schema names that match the guide: `Registration`, `Programme`, `Class`, `Session`, `Invoice`, `Venue`, …
- `__` fields described without "materialisation".
- Two new overview sections: *Dates and times* (each region's local time: EU `Europe/Bratislava`, UK
  `Europe/London`, ASIA `Asia/Dubai`) and *Amounts* (whether prices include VAT depends on the company's setting).
- Deprecated fields are left out of the document entirely.

**One change you need for links and samples:** venues moved from `GET /v3/companies/{ID}/places` to
**`GET /v3/places`**, which needs no company id (owner, 2026-11-18; the old route is deprecated). The response
shape is unchanged.

**Status:** moving to `agreed` on our side: there was nothing to negotiate, only facts. Draft the Decision Summary
if you want one; otherwise we'll resolve this handoff once the rollout reaches your staging.

### 2026-11-19 — api-v1

An addition you didn't ask for: the /v3 document now lists every error code a `400` can carry, under a
top-level `x-zooza-error-codes`. Partners branch on these codes, and the localised message is meant for their
end users.

Each entry is `{code, name, message, value}`, sorted by code:
- `message` is the English text, or `null` for 69 errors that don't have a translation yet. Show `name` for those.
- `value` says where the value an error names (e.g. the refused field) appears:
  - `in_message`: at the end of the message, e.g. `{"0037": "Invalid parameter value - rate_tier"}`, or in
    place of `{value}`.
  - `alongside`: under key `0`, next to the message.
  - `none`: not returned.

We'd like an "Error codes" reference page built from it. The overview's Errors section already points to it.

Also corrected: the `RequestError.errors` description used to show `{"0065": ["resource_not_found",
"Integration"]}`. That shape is never returned. The value always arrives inside the message string.

The list is generated from the code's error table. A test fails the build if two errors share a code.
Four codes were renumbered today, none of them used by any client yet:
- `create_user_already_exists` → 0365
- `invoice_creation_failed` → 0366
- `meta_code_exchange_failed` → 0367
- `api_key_not_entitled` → 0364

### 2026-11-19 — api-v1 (follow-up)

Each `x-zooza-error-codes` entry now also has:
- `area`: one of 13 groups, e.g. "Bookings", "Payments" or "Authentication and access". Use it for the page's
  sections.
- `description`: one or two sentences saying when the code is returned, and what to do where that is useful.

The order is `{code, name, area, description, message, value}`. Every code has a description, and the build
fails if one is missing.

16 codes are described as "Not currently returned". Nothing raises them today. We may remove them later;
until then, show them as they are.

The 69 missing English messages now exist. They reach the document after the next locale download.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:**
**What will NOT be built (and why):**
**Constraints agreed:**
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-v1   | ... | ... |
| api-docs | ... | ... |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
