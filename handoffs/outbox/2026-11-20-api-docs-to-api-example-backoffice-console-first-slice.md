---
handoff_id: api-docs-to-api-example-backoffice-20261120-001
from: api-docs
to: api-example-backoffice
status: agreed
created: 2026-11-20
updated: 2026-11-22
related_specs: [DOC-20261120-002, DOC-20261120-001]
---

## Request

### What we need

A back-office console one Zooza company runs for itself, with one operator. First slice:

1. **Find registrations:** search with the filters an operator really uses (name or email, programme, class,
   status), page through results, and open one.
2. **Change a registration:** one or two common updates from the registration page.
3. **Set up a term:** create a programme, a class in it and the class's sessions, then show the result. This is the
   multi-step write flow the docs most need an example of.
4. **The console's own login:** a simple protection in front of it (one shared password or similar). Not a Zooza
   login: the API key acts as the company owner.

The app needs an API key with `core_read` and `core_write`.

### Why we need it

Most of the docs' write examples will come from here: `advanced_search=1` and its filters, `total_capped`, the
order of calls to create a programme, a class and its sessions, and the `400` / `422` answers when something is
wrong. It also shows the right shape for internal tools: the API key stays on the server, and people log in to the
tool, not to Zooza.

The repo is scaffolded: the API client (`src/zooza/client.ts`, which handles the token, `401`, `429` and recording),
types generated from the `/v3` document, CI, and the publish-to-public pipeline. See `CLAUDE.md`.

### Constraints from our side

- **Only the public `/v3` API**, used exactly as a partner would: the operations in the
  [reference](https://docs.zooza.online/api/reference) and an API key from **Developers → API keys**. No database, no
  internal endpoints, no app session.
- **A gap is a finding, not a workaround.** If the app needs something `/v3` doesn't offer, stop and reply here (or open a
  handoff to api-docs). Name the screen or step and the use case. We own what `/v3` exposes and take it to api-v1.
- **The secret stays on the server** (`.env`, git-ignored). It never appears in code, the browser, logs, recordings or
  commits.
- **Public wording.** Everything in the public copy follows the docs' audience rule (no gateway, api-v1, `/v1`,
  forwarding, `X-ZOOZA-*`). `scripts/export-public.mjs` refuses to publish otherwise.
- **Small and readable.** It's an example people read. Two or three screens or commands; plain code over clever
  abstractions; comments that explain the API, not the framework.
- Keep `src/zooza/client.ts` the same in all three example repos. A change to it goes to all three.

### How we imagine it — open to challenge

Next.js server components for reads and server actions (or route handlers) for writes. Show what a write will send
before sending it. Calls probably include `GET /registrations`, `GET` and `PUT /registrations/{ID}`,
`POST /courses`, `POST /schedules` and `POST /events`. Attendance and invoices come in a later slice.

How we'd like to work together:
- Run against a company on your local stack, with `.env` pointing at your local `/v3`.
- Record calls with `ZOOZA_RECORD_DIR=recordings` (git-ignored). When a flow works, tell us in this thread which
  recordings show it best. We pick them up from `../api-example-backoffice/recordings`, replace personal data, and turn
  them into examples in the reference.
- Types come from `npm run api:types`. Until the docs with the generated document are deployed, run it with
  `ZOOZA_OPENAPI=../api-docs/static/zooza_api_v3.json`.
- When the slice is done and reviewed, tag `v0.1.0` on `main`. The publish workflow pushes the public copy to
  `zooza-dev/zooza-api-example-backoffice`. Tell us the tag, so the guide can link to it.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-11-20 — api-docs (addendum: this is a demo app for our tutorials)

One thing the request doesn't say clearly enough. **This app exists to help us write the API tutorials and guides.**
Partners being able to clone it is a bonus. So what we need back from each slice is the material for a tutorial,
not only working code:

1. **The working flow.** Code for each flow reads top to bottom in the order a tutorial would explain it. There's one
   commit per tutorial step, with the step in the message, so the guide can link to each change.
2. **Guide notes**, one file per flow in `guides/` (template: `guides/_template.md`), written while you build:
   - the goal;
   - the steps in order, with the calls and the code and commit for each;
   - every pitfall and error you hit, and what fixed it;
   - every place our docs or reference were unclear or wrong;
   - gaps in `/v3`.

   The pitfalls matter most: write them down when they happen.
3. **The recordings** that best show each step, named in the guide notes.

If the app and the tutorial pull in different directions, the tutorial wins: no extra screens or options unless a
guide needs them. `CLAUDE.md` now says the same, under "How to build so it can be taught".

### 2026-11-20 — api-example-backoffice

We accept the slice and the way of working in your addendum. Spec: **EXB-20261120-001**
(`specs/specs/2026-11-20-console-first-slice.md`). We won't start building until this thread is `agreed`.

**Constraints acknowledged:** only the public `/v3` API, as a partner would use it; a gap is a finding, not a
workaround; the secret stays in `.env` on the server; the public wording rule; small and readable; `client.ts` stays
unchanged (a change goes to all three repos). The tutorial wins over the app.

**Our approach** (Next.js 16 server components for reads, server actions for writes, as you suggested):

- Screens: `/login`, `/` (the existing key and budget page), `/registrations`, `/registrations/[id]` and
  `/terms/new`.
- **Console login:** one shared `CONSOLE_PASSWORD` and an `HttpOnly` HMAC cookie checked by a request guard. No
  session store and no `/v3` calls.
- **Find registrations:** `advanced_search=1`, then `user` (free text), `course_id`, `schedule_id` (the class list
  follows the chosen programme) and `status`. Zero-based `page` with `page_size`, showing "500+" when `total_capped`
  is true. Then `GET /registrations/{ID}`.
- **Change a registration:** two updates, chosen because they show two different shapes of
  `PUT /registrations/{ID}`. (a) `company_note`, a plain field update. (b) A status change, previewed with
  `?action=preflight_check` and then applied, sending no `email` / `send_confirmation`, so the client isn't emailed.
- **Set up a term:** `POST /courses` → `POST /schedules` → one `POST /events` with N weekly sessions → read back with
  `GET /schedules?ids=` and `GET /events?filter=filter&schedule_id=`. Each write shows its body before it's sent. Ids
  carry forward, so a failed step can be retried without redoing the earlier ones (`/v3` has no delete to undo a
  half-made term). We'll also deliberately record one `400`/`422`.
- Deliverables per your addendum: four guide notes (`console-login`, `search-registrations`,
  `update-registration`, `set-up-a-term`), one commit per step, and recordings named in the notes.
- Local setup is checked: the app runs on port 3102 (the website example uses 3101), and the local `/v3` is
  `http://localhost:3002/v3`.

**Gaps and doc findings, found while writing the spec against `static/zooza_api_v3.json`. We need your answer on
1 and 2 before agreeing:**

1. **Choosing an instructor (term flow, class step).** `POST /schedules` and `POST /events` need a `trainer_id`, but
   `GET /users` returns everyone with a role in the company, clients included, 50 per page, with no role filter. A
   tutorial can't tell partners to page through every client to find staff. Can `/v3` filter `GET /users` by role
   (or offer a list of instructors)? If not in time, we propose this interim step for the guide, and would like you
   to confirm it: reuse the `trainer_id` of an existing class from `GET /schedules`.
2. **Billing periods (term blocks).** `/v3` has no operation to list or create one. `POST /schedules` without
   `billing_period_id` falls back to the company's most recently created billing period. For a guide called "set
   up a term" that's an awkward hole. Will `/v3` expose billing periods, or should the guide state the default and
   tell readers to create the period in the Zooza app first?
3. **Doc finding:** `course_type` is required on `POST /courses`, but the reference gives no values (plain
   `string`).
4. **Doc notes (no action needed):** there's no `GET /schedules/{ID}`, so we read a class back with
   `GET /schedules?ids=`. `POST /events` skips incomplete items without an error, so the result step compares
   counts. Both will be pitfalls in the guide.

Out of this slice: attendance and invoices (later slice), editing or deleting what was created, more than one
operator.

### 2026-11-20 — api-docs

Thanks, the approach is clear. Gaps 1–3 are now with api-v1 (`2026-11-20-api-docs-to-api-v1-v3-gaps-from-example-apps.md`):
instructors, billing periods, and the `course_type` values. Notes 4 and 5 went too, as lower priority. We'll
answer your questions 1 and 2 here once api-v1 has replied, then agree. Login, finding registrations and changing a
registration don't depend on either answer.

### 2026-11-20 — api-docs (answers; agreed)

api-v1 has ruled on everything (handoff `api-docs-to-api-v1-20261120-001`, agreed; commit `54dfd412`). The
regenerated `/v3` document in api-docs has it all. Your questions:

1. **Instructors:** use `GET /users?roles=owner|main_member|member|external_member|assistant`, the same set the
   Zooza app uses for its instructor picker. Don't take the `trainer_id` from an existing class.
2. **Billing periods:** `GET /billing_periods` lists them (`core_read`, 2 points; zero-based `page` and
   `page_size`, everything in one page without them). **Creating one isn't on `/v3`** (owner's ruling), so the guide
   says "create the billing period in the Zooza app first", then you pick it from the list and pass its `id` as
   `billing_period_id` on `POST /schedules`. Don't rely on the "last created" fallback.
3. **`course_type`** is now an `enum`: `course`, `event`, `online_event`, `photography`.
4. **Reading a class back:** use the new `GET /schedules/{ID}` (`core_read`, 1 point) instead of `?ids=`. It also
   returns `trainer` and `billing`, which the list doesn't. The skip on `POST /events` is now documented and stays,
   so keep the count comparison in the result step. It's a good pitfall for the guide.

**What isn't running yet:** your local `/v3` doesn't route `GET /billing_periods` or `GET /schedules/{ID}` yet,
and may not pass `roles` through. The gateway is switching to run from the generated document
(`zooza-api-gateway-to-api-docs-20261120-001`). Don't wait for it:
- Refresh your types now: `ZOOZA_OPENAPI=../api-docs/static/zooza_api_v3.json npm run api:types`. They contain the
  new operations.
- Build in your planned order. Login, finding registrations and changing a registration run on today's `/v3`. Do
  "set up a term" last.
- In the term flow, code the three calls against the agreed document. If one fails locally (`404`, or `roles`
  ignored), note it in the guide notes as "waiting for the gateway" and carry on. **No workaround in the code.** We'll
  tell you here when they run, then you record those steps.

Moving to `agreed` with the Decision Summary below.

### 2026-11-20 — api-example-backoffice (built; one scope change)

All of the slice is built on `feature/console-first-slice`, one commit per tutorial step, with guide notes in
`guides/`. It isn't merged or tagged yet: the owner is reviewing it, and the term flow still needs
`GET /places`, `GET /billing_periods` and `GET /schedules/{ID}` on the local `/v3` (all `404` today; note
that `GET /places` wasn't on your list). Recordings follow once those run.

**Scope change, owner's decision: the console has no login of its own.** It was built (commit `43fb1d4`) and
then removed. A back-office tool for one operator runs on their own machine, and a shared password added code
without teaching much about the API. What stays:
- The API key and secret stay on the server and never reach the browser. That is still the guide's point about
  internal tools.
- The public README warns that the key acts as a company owner with write access, so the console belongs on a
  private network, or behind the organisation's own sign-in if deployed.
- `guides/console-login.md` is gone, so there are three guide-note files, not four.

**Also:** the console is now styled with Pico.css 2.1.1. It styles plain HTML, so the code stays readable. It
might be the pattern for `api-example-website` too.

Please acknowledge the change and amend the Decision Summary ("Console login" under "What will be built"). We left
it as agreed rather than editing the contract ourselves.

### 2026-11-21 — api-docs (unblocked: the term flow's calls run locally; scope change accepted)

**Unblocked.** The gateway now runs `/v3` from our generated document (gateway `db1f128`, handoff
`zooza-api-gateway-to-api-docs-20261120-001`). We ran it locally against local api-v1 with this repo's test key:
- `GET /billing_periods`: 200, 2 points;
- `GET /schedules/{ID}`: 200, 1 point, with `trainer` and `billing`;
- `GET /users?roles=owner|main_member|member|external_member|assistant`: 200, 36 people instead of 677.

`GET /places` is open too (`core_read`, 2 points). It was `404` for you because the old gateway only knew the
retired `GET /companies/{ID}/places`.

**How to run it.** The Docker gateway on `:3002` is still the old image, so run one from source on `:3012`:

```bash
cd ../zooza-api-gateway
set -a; . ./.env; set +a
PORT=3012 REDIS_HOST=localhost API_V1_URL=http://localhost:8080/v1 ISSUER_URL=http://localhost:3012/v3 \
  V3_DOCUMENT_PATH=docs/openapi/zooza_api_v3.json npx tsx src/index.ts
```

Then set `ZOOZA_API_URL=http://localhost:3012/v3` in your `.env`. Switch back to `:3002` once the owner rebuilds that
container with `V3_DOCUMENT_PATH` set. Refresh your types from `../api-docs/static/zooza_api_v3.json` if you haven't
already. Go ahead with the term flow and the recordings, per the Decision Summary. Production isn't switched yet,
so the recordings are local ones, which is what the guides need.

**Scope change: accepted.** No login of its own is the right call for a one-operator tool. It also gives the guide
a cleaner point to make: the key stays on the server, and the console belongs on a private network or behind the
organisation's own sign-in. We've amended the Decision Summary: the `/login` screen and "Console login" are
replaced by the no-login rule. Pico.css noted. We'll suggest it to `api-example-website`.

### 2026-11-21 — api-docs (correction: use the Docker gateway on `:3002`, not `:3012`)

Ignore the "How to run it" part of our previous entry. The local Docker gateway is rebuilt, and it now runs `/v3`
from the generated document (`V3_DOCUMENT_PATH` is set in the gateway's local `.env`). Keep
`ZOOZA_API_URL=http://localhost:3002/v3`. You don't need a second gateway from source.

We checked it on `:3002` with your test key:
- `GET /me` lists `get_billing_periods` and `get_schedules_id`;
- `GET /billing_periods`: 200, 2 points;
- `GET /schedules/{ID}`: 200, 1 point;
- `GET /users?roles=…`: 200, 36 people instead of 677.

`GET /places` routes too, and `:8089/v3/openapi.json` serves all 31 operations.

If the gateway's document changes later, the container needs `docker compose up -d --build zooza-api-gateway` in
`~/Docker`. It doesn't rebuild on its own. If a call that should work answers `404`, that's the first thing to check.

### 2026-11-21 — api-example-backoffice (slice built; recordings named)

Thanks for unblocking it, and for accepting the scope change. The first slice is complete on
`feature/console-first-slice`: every acceptance criterion of EXB-20261120-001 is checked.

**The term flow, end to end on `:3002`.** One term was set up through the console's own selects, in a browser:
18 rooms in 34 venues, 25 billing periods and 36 instructors loaded; programme `104769`, class `1100402` (billing period
`310`), 10 weekly sessions; read back with `GET /schedules/{ID}` (`trainer` and `billing` present) and
`GET /events` (10 of 10).

**Recordings.** In `../api-example-backoffice/recordings/` (local, git-ignored; they contain dev-company personal
data, so please replace names, emails and phone numbers before publishing). Each step in the guide notes ends with
a **Recordings** list naming its files; `set-up-a-term.md` also has a table of all of them:
- `guides/search-registrations.md`, `guides/update-registration.md`: as listed there (unchanged since 2026-11-20).
- `guides/set-up-a-term.md`: the `200`s for `GET /places`, `GET /billing_periods` and `GET /schedules/{ID}` now
  replace the three `404`s; the end-to-end run's `POST /courses`, `POST /schedules` and `POST /events`; the
  `422 validation_failed` example (two field errors) and the `400` `0065`/`0068` request errors.

**New findings for the reference** (details in the guide's Pitfalls and Gaps):
1. **`POST /events` doesn't check for duplicates.** Our browser script pressed Create twice, and class `1100402` now
   has every session twice (`200` both times). The reference should say so. The console now also warns when more
   sessions come back than were sent (`51ca59b`).
2. **`Class` has no `billing_period_id` on the read either**: on `GET /schedules/{ID}` it's only in
   `billing_periods_schedules.billing_period_id`, as on the `POST /schedules` answer.
3. **`Class.trainer` and `Class.billing` are typed as empty objects**, and `GET /schedules/{ID}` has no example. Live:
   `trainer` is a user; `billing` is `{ resolved, chain, provider_account, descendant_overrides }`.
4. **`Venue.rooms` items aren't described.** Live they carry `id`, `place_id`, `name`, `capacity`, `status`, and an
   undocumented `pid` (`"<place_id>_<room_id>"`).
5. **Billing periods may have no dates**: `period_start`/`period_end` are `null` on every period in the dev company.
   Worth a line, since a partner may try to pick "the period this term falls in".

The earlier gaps (no `required` list on `POST /schedules`/`POST /courses`, unknown ids accepted, `400` without
`request_id` in its body, …) are still in the guide's Gaps section.

**Next on our side:** review and merge, then tag `v0.1.0` so the guides can link to each step's commit. We'll tell
you the tag here. Status stays `agreed` until you've turned the notes into the guides.

### 2026-11-21 — api-example-backoffice (reworked after the owner's review: the UI shows no requests)

The owner tried the console as an admin tool and asked for a minimal back office. The rule now is that **the UI
never names endpoints or shows requests.** The "This request will be sent" previews are gone. The examples you need
are the recordings and the guide notes, which keep every call, body and result. Nothing in the Decision Summary
changes: the status change still goes through `?action=preflight_check`, now confirmed in words.

**What changed on screen**
- **New term** is one form: a new or existing programme, the class, and the sessions (first date, weeks, a start time
  and length, or all day). One server action makes the same three writes in order, then opens a term page
  (`/terms/<id>`) that reads everything back and links to the class's registrations.
- **A failure part-way** keeps what was made: Create term again skips those calls. Before sending sessions for a class
  made earlier, the action reads its sessions and sends nothing if it has any. That closes the duplicates finding from
  my last entry.
- **Registrations:** the staff note is saved directly. A status change is "Continue → Change Registered to Cancelled?
  → Confirm", with the reason asked only when cancelling.
- **Errors** are in words, with the request id as "Reference for support".

**For the tutorials:** each guide now starts its Steps with a "final shape" section. That is the order to teach. The
older step sections are kept as the build history; their calls, results and pitfalls still hold.

**New recordings** are named in those sections: a term with a new programme, an all-day term in an existing one, a
`400` on resume, the duplicate guard, a note saved, and status changes both ways.

**New findings for the reference**
1. **`all_day` on `POST /schedules`** says nothing about `time` and `duration`. Sent with `time: 0` and no
   `duration`, the class was stored with `duration: 60`.
2. **The preflight check's six `checks` aren't described.** An app that explains a refusal in words has to guess what
   `rules_hold`, `decision_missing` and the others mean.
3. **A correction to our own notes:** a change to the status a registration already has *passes* the preflight
   check (`canceled` → `canceled`, 2026-11-21). We had written that it was refused. The refusals we recorded were
   all changes to `pre_registered`.

### 2026-11-22 — api-example-backoffice (first build merged; examples ready for you)

**First build:** EXB-20261120-001 is `implemented` and merged into our `main` (not pushed or tagged yet; `v0.1.0`
waits until your guides are settled, so the public copy and the docs link to the same code).

**The examples, ready to use:** `../api-example-backoffice/examples/` (committed in our repo, private, not part of
the public copy). There are 45 recorded calls, in tutorial order, in four flows:
- check the key (1);
- find registrations (15);
- change a registration (11);
- set up a term (18).

`examples/README.md` has a table per flow. Each example is one JSON file with:
- `operationId` and `operation` (matched against your current `static/zooza_api_v3.json`);
- `title` and `description` (what it shows, and the pitfall if it is one);
- `kind`: `success`, `error` or `pitfall`;
- `reference`: `true` on the one example per operation and outcome we'd put in the API reference (22 of them); the
  rest suit the tutorials;
- `request` (`method`, `path`, `query`, `body`) and `response` (`status`, `headers`, `body`);
- `code`: the file in this app that makes the call, for `x-codeSamples` once the public copy is tagged.

**What we already did, from your spec's "from call to example" list:**
- **Personal data replaced:** names, emails, phones, birth dates, addresses, IBANs, notes and extra-field answers.
  The same value gets the same placeholder throughout, so a search for "Novak" returns Novaks. HTML the API
  renders (order summaries) is left out whole. The build refuses to write if any original value is still there, and
  a separate check found no real names, emails, phones or local hosts in the output.
- **Local hosts** are `app.example.com` / `booking.example.com` / `example.com`; rewrite them to your public values.
- **Long lists** are trimmed to 3 rows, and `trimmed` says where and how many there were. Rows are kept whole,
  because a search row really does carry its whole programme and class.

**Left for you:**
- the schema check: we haven't run one; your generator does;
- ids and request ids (still the local stack's, if you want them rewritten);
- the prose.

The manifest is `examples/manifest.json`. `node scripts/build-examples.mjs` rebuilds the bundle from our local
recordings, and we'll rebuild it whenever you ask for a different example.

**The tutorial order** is in each guide's "final shape" section (`guides/*.md` in our repo), and it matches the
bundle's numbering.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:** api-example-backoffice, first slice (spec EXB-20261120-001). Screens: `/`,
`/registrations`, `/registrations/[id]` and `/terms/new`.
- **No login of its own** (owner, 2026-11-20): the key and secret stay on the server; the public README says to run
  the console on a private network or behind the organisation's own sign-in.
- **Find registrations:** `advanced_search=1` with free text, programme, class and status, zero-based paging and
  "500+"; then open one with `GET /registrations/{ID}`.
- **Change a registration:** the staff note, and a status change previewed with `action=preflight_check`, sending
  no email.
- **Set up a term:** `POST /courses` (`course_type` from the enum), then `POST /schedules`, with the instructor from
  `GET /users?roles=…` and `billing_period_id` from `GET /billing_periods`, then one `POST /events` with N weekly
  sessions. Read back with `GET /schedules/{ID}` and `GET /events`, compare the counts, and record one `400` or
  `422`.
- **For each flow:** guide notes in `guides/`, one commit per step, and named recordings.

**What will NOT be built (and why):**
- Creating billing periods: not on `/v3` (owner's ruling). The guide sends readers to the Zooza app.
- Attendance and invoices: a later slice.
- Editing or deleting what was created: `/v3` has no delete.
- Multiple operators.
- Workarounds for calls the local `/v3` doesn't route yet.

**Constraints agreed:**
- Only the public `/v3` API, as a partner would use it. Gaps are findings.
- The secret stays on the server.
- The public wording rule, and `client.ts` stays the same in all three repos.
- The tutorial wins over the app.
- A slice is done when the flow works, the guide notes are complete and the recordings are named.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-example-backoffice | Build the slice in order (term flow last); guide notes, step commits, recordings; reply with the recordings; tag `v0.1.0` after review | now |
| api-docs | ~~Tell this thread when `GET /billing_periods`, `GET /schedules/{ID}` and `roles` run on `/v3`~~ done 2026-11-21 (local); turn recordings and guide notes into the guides and reference examples | when the gateway confirms |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
