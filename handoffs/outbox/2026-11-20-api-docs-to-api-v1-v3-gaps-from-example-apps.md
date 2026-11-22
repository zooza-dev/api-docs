---
handoff_id: api-docs-to-api-v1-20261120-001
from: api-docs
to: api-v1
status: agreed
created: 2026-11-20
updated: 2026-11-20
related_specs: [DOC-20261120-002, DOC-20261120-001, EXB-20261120-001]
related_handoffs:
  - 2026-11-20-api-docs-to-api-example-backoffice-console-first-slice.md
  - 2026-11-20-zooza-api-gateway-to-api-docs-v3-document-generation.md
---

## Request

### What we need

We're building small demo apps on `/v3`, the way a partner would, to write our API tutorials and guides from real
use (spec DOC-20261120-002). The first one, a back-office console (`api-example-backoffice`, spec
EXB-20261120-001), found these gaps while planning its "set up a term" flow: programme → class → sessions. That flow
is the main write tutorial the docs need.

**1. Finding the company's instructors.** `POST /schedules` and `POST /events` need a `trainer_id`. The only way to
find one in `/v3` is `GET /users`, which returns everyone with a role in the company, clients included, 50 per page,
with no role filter. A partner must be able to get the people who can be assigned as instructor without paging
through every client. Either a way to list instructors, or a role filter on the user list, would do.

**2. Billing periods (term blocks).** `/v3` has no operation for them. `POST /schedules` without `billing_period_id`
falls back to the company's most recently created billing period. For a guide called "set up a term", the partner
needs at least:
- to **list** the company's billing periods (name, dates, whether active), so the class can be put in the right
  one;
- and, if you consider it eligible, to **create** one, so a term can be set up end to end without the Zooza app.

If only listing is eligible, the guide will say "create the billing period in the Zooza app first". That's
acceptable, but we need to know which way it goes.

**3. `course_type` values.** `POST /courses` requires `course_type`, but the subset declares it as a plain `string`
with no allowed values and no meanings. We need the values (an `enum`) and a line on what each means, wherever
`course_type` appears.

**Lower priority, your call:**

4. **`POST /events` skips incomplete items without an error.** A partner sending ten sessions can get eight back with
   no sign why. Is that intended? We'd prefer a `422` naming the item, or a list of skipped items in the response.
   At the least, the operation's description should say that it happens.
5. **No `GET /schedules/{ID}`.** Reading a class back takes `GET /schedules?ids=<id>`. A single read would match the
   other resources. Not blocking: the guide can show the `ids` filter.

### Why we need it

- Without 1 and 2, the first write tutorial would have to teach a workaround: "copy the `trainer_id` from an
  existing class", "your class lands in whichever billing period was created last". Partners would build
  integrations on that, which is exactly what these demo apps are meant to prevent.
- Without 3, nobody can call `POST /courses` correctly from the reference alone.
- Every gap a demo app finds now is one a partner won't hit later.

### Constraints from our side

- **Eligibility is yours,** per operation, as agreed in the generation handoff. If something isn't safe to expose
  to a partner key, tell us, and the guide will say how to do it in the Zooza app instead.
- **Through the subset, as agreed:** stable `operationId`s, clean of internals, ready for `access.json`. We open
  operations in `access.json` with the API owner's approval. We'd expect reads in `core_read` at a list cost (2) and
  a create in `core_write` (5), but tell us if you see it differently.
- **The `/v3` wording rule** applies to every description.
- Today's merged document stays the generator's input until the bare subset exists. A new operation can arrive
  either way: in today's document or in the bare subset.

### How we imagine it — open to challenge

- Instructors: a role filter on `GET /users` (e.g. `role=trainer`), or a separate instructor list. If an existing
  `/v1` operation already does this, making it eligible is all we need.
- Billing periods: `GET /billing_periods` (filter for active ones), and possibly `POST /billing_periods`. `/v1`
  seems to have billing-period endpoints already; whether they're fit for partners is your call.
- `course_type`: an `enum` with a description per value in the subset's `Programme` / request schema.

**Questions for you:**
1. For each of 1–3: will you add it, and roughly when?
2. If something isn't eligible: what should the guide tell partners to do instead?

The back-office app won't start the "set up a term" flow until it has your answers on 1 and 2.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-11-20 — api-v1

Thanks, these are good finds. The owner ruled on each one. All of it is built in api-v1, and the regenerated
`docs/openapi/zooza_api_v3.json` and `v3_gateway_fragment.json` are in the same commit.

**1. Instructors: done, as a filter.** `GET /users` now documents `roles`: one or more role values,
pipe-separated. To list the people who can be a class or session instructor, use
`roles=owner|main_member|member|external_member|assistant`, the same set the Zooza app uses for its instructor
picker. The operation's description says so too. Unknown values are ignored; if none is known, the list is empty.

**2. Billing periods: listing only.** New `GET /billing_periods` (`get_billing_periods`, schema `BillingPeriod`
with an example, tag "Billing periods"). It returns all of the company's billing periods, active and inactive,
sorted by name, in one page. **Creating one isn't on `/v3`.** The guide should say "create the billing period in
the Zooza app first", then pass its `id` as `billing_period_id` on `POST /schedules`.

There is no paging on purpose: the endpoint mishandles `page` / `page_size` today. We'll fix that separately, and
until then the document doesn't offer them. A company has a handful of billing periods, so one page is enough.

**3. `course_type`: done.** `POST /courses` and `PUT /courses/{ID}` now carry the enum, with the same meanings as
the `Programme` read schema: `course`, `event`, `online_event`, `photography`.

**4. `POST /events` silent skips: documented, behaviour unchanged.** The description already said that items
missing a required field are skipped without an error. It now also tells partners to compare the number of
sessions returned with the number sent. A `422` would change the same route for the Zooza app, so it isn't planned.

**5. `GET /schedules/{ID}`: done** (`get_schedules_id`). It returns one class with the `Class` schema. Unlike the
list, it also carries `trainer` (the main instructor as a user) and `billing` (which billing profile and bank
account the class invoices with); the schema marks both as "only on `GET /schedules/{ID}`". It reads a class the
default list filter leaves out, so a class can always be read back by id.

**Access (proposed for `access.json`, already in the fragment):**

| operationId | Group | Cost |
|---|---|---|
| `get_billing_periods` | `core_read` | 2 |
| `get_schedules_id` | `core_read` | 1 |

`get_users` and the `courses` / `events` operations keep their entries. The changes there are a parameter, an enum
and descriptions.

**To pin:** the api-v1 commit that carries this reply, on `feature-api-key-management`. It reaches `main` with
that branch; we'll tell you when. The gateway's `config/access.yaml` doesn't have the two new operations. If it
still runs from that file when you tag, please pass them on, or tell us and we'll write to the gateway.

**From now on:** api-v1 follows a written procedure for publishing an endpoint on `/v3`, and for keeping one in
step when a change touches it. Each request like this one ends with a reply in this shape: the operationIds, the
proposed group and cost, and the commit to pin.


### 2026-11-20 — api-v1: billing periods page now

The paging bug is fixed, so `GET /billing_periods` now documents `page` (zero-based) and `page_size`. Without
`page_size`, everything still comes in one page (up to 1000), as before. Nothing else in the Decision Summary
changes, apart from the "no paging" line, which no longer applies.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:** On `/v3`:
- a `roles` filter on `GET /users`, documented with the instructor role set;
- `GET /billing_periods` (list);
- the `course_type` enum on `POST /courses` and `PUT /courses/{ID}`;
- the skip on `POST /events` described;
- `GET /schedules/{ID}`.

All built in api-v1. Proposed access: `get_billing_periods` `core_read`/2, `get_schedules_id` `core_read`/1.
**What will NOT be built (and why):**
- No `POST /billing_periods` on `/v3`: billing periods are created in the Zooza app (owner, 2026-11-20).
- No `422` on `POST /events`: the route is shared with the Zooza app, so its behaviour stays.
**Constraints agreed:**
- `operationId`s are stable.
- Descriptions follow the `/v3` wording rule.
- api-v1 tells api-docs which commit to pin.
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-v1   | Descriptors, schema, example, fragment entries, regenerated documents; tell api-docs when the commit is on `main` | done on `feature-api-key-management` |
| api-docs | Add the two operations to `access.json`, re-pin, tag; write the "set up a term" guide (billing period created in the app) | after the commit is on `main` |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
