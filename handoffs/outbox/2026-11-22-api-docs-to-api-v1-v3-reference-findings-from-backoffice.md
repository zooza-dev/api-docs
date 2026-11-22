---
handoff_id: api-docs-to-api-v1-20261122-001
from: api-docs
to: api-v1
status: open
created: 2026-11-22
updated: 2026-11-22
related_specs: [DOC-20261120-002, DOC-20261120-001, EXB-20261120-001]
related_handoffs:
  - 2026-11-20-api-docs-to-api-example-backoffice-console-first-slice.md
  - 2026-11-20-api-docs-to-api-v1-v3-gaps-from-example-apps.md
---

<!-- DRAFT, not sent: this copy exists only in api-docs' outbox. The owner holds it until api-v1 is free
     (2026-11-22). When it's sent, copy it unchanged to api-v1's handoffs/inbox/. -->

## Request

### What we need

The back-office demo app (`api-example-backoffice`, spec EXB-20261120-001) has finished its first build: find
registrations, change a registration, and set up a term. It recorded 45 real `/v3` calls, which become the reference
examples and the guides. Checked against the generated document, 11 of the recorded answers contradict their own
schema, and the guide notes list places where the reference is silent or says something that isn't what happens.

**Almost all of this is documentation:** schemas, descriptions and examples in the subset. We list it in three
groups, so the few points that may need code are easy to see.

**A. The document contradicts the API.** Real answers that fail their schema. Until these are fixed we can't
publish the examples on these operations, because the generator will check every example against its schema.

1. `ExtraField.field_options` is typed as an object, but comes back as `[]` when empty (PHP's empty array). Seen on
   `GET /courses`, `GET /courses/{ID}` and `POST /courses`.
2. `Class.priority_registration_phase` is `nullable` with an `enum`, and the answer is `null`. In OpenAPI 3.0 the
   enum must also list `null`, or validators refuse it. Seen on `GET /schedules`, `GET /schedules/{ID}` and
   `POST /schedules`.
3. `Class.start` / `end` are `format: date`, but a class with no sessions has `"0000-00-00"`. Either the schema
   allows it and the description says it means "no sessions yet", or the API answers `null`. That one would be
   code.
4. A registration search row's `first_event` is `format: date-time`, but comes back as `""` when there's none.
5. `POST /events` documents a paginated object, but when every item is skipped the answer is a bare `[]`.
6. `created` / `updated` (registrations and others) are `format: date-time`, but are `YYYY-MM-DD HH:MM:SS` with no
   `T` and no time zone. The document should say so, and which time zone.

**B. Types left empty, or not described.** Partners have to cast or guess.
- On a registration row and on `RegistrationDetail`: `course`, `schedule`, `buyer`, `customer`, `user` are typed
  as empty objects, but they are full programme, class and person objects. At least `id` and `name`, please.
- `User.role` is typed as empty, but live it is `{ id, company_id, user_id, role, created, updated }`.
- `Venue.rooms` items aren't described: `id`, `place_id`, `name`, `capacity`, `status`, and `pid`
  (`"<place_id>_<room_id>"`).
- `Class.trainer` / `Class.billing` (only on `GET /schedules/{ID}`) are typed as empty objects. `trainer` is a
  user, and `billing` is `{ resolved, chain, provider_account, descendant_overrides }`. `GET /schedules/{ID}` also has
  no example.
- **The preflight check (`PUT /registrations/{ID}?action=preflight_check`)** has no schema. We'd like **one
  answer schema per operation that offers a preflight check** (for example `RegistrationStatusPreflight`), named
  in the `200` response's description ("with `?action=preflight_check`: …"), with:
  - every check described: what `not_passed` means, and its severity. For a status change: `status_allowed`,
    `rules_hold`, `decision_missing`, `money_moves`, `transferred_money_stays`, `currency_conversion` and, with a
    count, `replacement_conversion_count`;
  - every property's `value` schema: `result`, `transfers`, `balances`, `refusals` (with their `options`), `options`
    and, on a cancellation, `replacement_credits`;
  - the body fields that carry the decisions (`linking`, `convert_replacements_to_free_event`) pointing to the
    checks they answer.

  Our docs now have a concept page for what's the same everywhere (`checks` / `properties`, the severities, the
  apply re-checking). The per-operation part belongs in your reference. Until it's there, our "Cancel a
  registration" guide carries a table of the status change's checks and properties, read from
  `Linking_Status_Preflight` and `Replacement_Credit_Conversion`. Please check it.

  Once these schemas exist, our generator will refuse a document where an operation accepts
  `?action=preflight_check` but names no preflight schema.
- The `200` of a plain-field `PUT /registrations/{ID}` is the registration, the same shape as
  `GET /registrations/{ID}`. Today its schema says "depends on the operation".
- Request bodies: `POST /schedules` and `POST /courses` declare no `required` list ("Required." is only in the
  prose). `POST /courses` `price` has no description. `POST /schedules` `capacity` has no `minimum`. `POST /courses`
  `name` has no `minLength`.

**C. Behaviour the reference doesn't mention.** For each one, a sentence in the description is enough, unless you
decide to change the behaviour.
- `GET /registrations/{ID}` / `PUT` with an id that isn't the company's answers `400` request error `0065` (message
  in the company's language), not `404`. The request-error `400` carries no `request_id` in its body, only in the
  header.
- `GET /registrations`:
  - an unknown `status` value turns the filter off, deleted registrations included;
  - `status=registered` also returns `pre_registered`;
  - leaving `status` out means "everything but deleted";
  - `page` in the answer is always `null`;
  - paging continues past `total_capped` 500.
- `GET /schedules` leaves out classes of archived programmes, with no parameter to include them.
- `GET /users` says "50 per page" but documents no `page` / `page_size`, so instructors past 50 can't be read.
- `POST /events`:
  - sending the same sessions twice creates duplicates;
  - a bare array is **refused** with `422` (the description says "ignored");
  - nothing says what a session without `room_id` gets.
- `POST /schedules`:
  - an unknown `billing_period_id` or `room_id` is stored as sent, with a `200`;
  - the answer has `billing_period_id: null` (the link is only in `billing_periods_schedules`);
  - the request's `time` (start, in minutes) and the answer's `time` (the first session's start, `0` with none)
    share a name but mean different things;
  - with `all_day`, nothing says what `time` and `duration` mean; sent without `duration`, `60` is stored.
- `PUT /registrations/{ID}`:
  - fields from an earlier step in the same body make it ignore `company_note`, with no error (e.g. together with
    `notify_about_upcoming_events`);
  - `send_confirmation` emails the client **whatever its value**, `false` included;
  - a refused status change is a `200` (`not_passed`) in the preflight check but a `400 0033` when applied;
  - which status changes are allowed from which isn't documented;
  - a cancel needs a reason.

- `RequestError.errors` uses a Slovak sample in its description: `{"0066": "Neplatný zľavový kód"}`. The rest of the
  reference is English, so please use the English message (`"Invalid discount code"`, or whatever the `en` text of
  `0066` is).

**Code we think is needed, your call:**
1. **`GET /users?roles=…` echoes an SQL fragment.** The answer's `settings.roles` is
   `"'owner','main_member','member','external_member','assistant'"`. That's an internal detail in a partner answer.
   Echo the values as sent, or leave `roles` out of `settings`.
2. **`send_confirmation: false` sends the email.** A partner who explicitly says "don't email" emails the client.
   Documenting it is the minimum; we think `false` should mean false.
3. **Unknown ids accepted on `POST /schedules`** (`billing_period_id`, `room_id`). Stored as sent, they leave a
   class pointing at nothing. A `400 0065`, as for an unknown `course_id`, would match.

**Note on the request-side items in B and C:** the gateway validates requests against the published document. So a
`required` list, a `minLength`, a `minimum`, or an `enum` on `status` would be enforced on `/v3` alone, without
touching the routes the Zooza app shares. This is a way to make `/v3` stricter where you'd rather not change the
`/v1` behaviour.

### Why we need it

- The reference examples come from these recordings, and the generator will refuse an example that fails its
  schema. Six of the 22 examples picked for the reference are blocked by group A.
- Every item in B and C cost the demo app time to find by trial. A partner would pay the same, and the guides would
  otherwise have to teach workarounds the reference contradicts.

### Constraints from our side

- Fixes arrive through the subset as before: stable `operationId`s, `/v3` wording rule, and a reply that names the
  commit to pin.
- Behaviour changes on routes the Zooza app shares are yours to judge. Where you keep the behaviour, a description
  is enough.
- The full evidence (request, answer, date) is in `api-example-backoffice/guides/*.md` (Pitfalls and Gaps) and its
  `examples/` bundle. Each item above can be traced to a recorded call.

### How we imagine it — open to challenge

- Group A and B: schema and description changes in the descriptors, plus an example for `GET /schedules/{ID}`.
- Group C: one or two sentences per operation, in the operation's description.
- The three code points: your decision. Tell us which you'll change and which you'll only document.

**Questions for you:**
1. Which of the three code points will you change?
2. For `Class.start`/`end` `"0000-00-00"`: allow it in the schema, or answer `null` on `/v3`?
3. Roughly when can group A land? It blocks the reference examples.

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
| api-docs | ... | ... |
| api-v1 | ... | ... |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
