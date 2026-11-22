---
title: Set up a term
description: Create a programme, a class and its weekly sessions with the Zooza API, then read the term back and check that every session exists. With the requests, the answers and the pitfalls at each step.
---

import ApiExample from '@site/src/components/ApiExample';

# Set up a term

A term is a programme, a class in it, and the class's weekly sessions. This guide creates one with three writes,
then reads it back from Zooza to prove that everything exists:

1. [Load the choices](#1-load-the-choices): venues and rooms, billing periods, instructors.
2. [Create the programme](#2-create-the-programme), or use an existing one.
3. [Create the class](#3-create-the-class).
4. [Create the sessions](#4-create-the-sessions), all of them in one request.
5. [Read the term back](#5-read-the-term-back) and count the sessions.
6. [When a write fails](#6-when-a-write-fails), finish without creating anything twice.

Every request and answer on this page was recorded from a real call. Names, emails and other personal data are
replaced.

:::warning There is no delete
`/v3` can't delete a programme, a class or a session. Everything you create stays in the company, so check every
value before you send it, and never send a write twice by accident. Try this in a test company first.
:::

## Before you start

- **A key with `core_read` and `core_write`.** The three writes cost 5 points each, and the reads 1 or 2 points
  each. See [Access and rate limits](../access-and-rate-limits.md).
- **A billing period for the term, created in the Zooza app.** A billing period (term block) groups classes into a
  term, such as "Autumn 2026". `/v3` can list billing periods but can't create them.
- **At least one venue with a room**, and **at least one instructor** in the company.

The calls below use the token from [Authentication](../authentication.md). Every request needs
`Authorization: Bearer <token>`, and every body is JSON.

## 1. Load the choices

A class points at things that must already exist: a venue and one of its rooms, an instructor, and a billing period.
Load them before you write anything, and offer only what exists. **`POST /schedules` doesn't check these ids** (see
[step 3](#3-create-the-class)), so a typo creates a class that points at nothing.

The three reads don't depend on each other, so make them together. If one fails, show that error where its list
would be and keep the others.

**Venues and rooms:** [`GET /v3/places`](/api/reference#tag/company/GET/places) returns the company's active venues,
each with its active rooms. A class and each of its sessions take both `place_id` and `room_id`, so keep the venue's
id with the room the user picks. A venue without rooms can't hold a class.

<ApiExample id="set-up-a-term/01-venues-and-rooms" />

**Billing periods:** [`GET /v3/billing_periods`](/api/reference#tag/billing-periods/GET/billing_periods) returns
active and inactive periods, sorted by name. Leave out `page_size`, and all of them come in one page. Use `active`
to hide the old ones. A period's `period_start` and `period_end` can be `null`, so don't rely on the dates to find
"this term's" period; let the user choose.

<ApiExample id="set-up-a-term/02-term-blocks" />

**Instructors:** [`GET /v3/users`](/api/reference#tag/users/GET/users) lists everyone with a role in the company,
clients included. Send `roles=owner|main_member|member|external_member|assistant` to get only the people who can
teach a class. Don't copy a `trainer_id` from an existing class: that person may have left.

<ApiExample id="set-up-a-term/03-instructors" />

## 2. Create the programme

A class lives in a programme, so the programme comes first. If the term belongs to a programme you already have,
pick it from [`GET /v3/courses`](/api/reference#tag/programmes/GET/courses) and skip to step 3.

[`POST /v3/courses`](/api/reference#tag/programmes/POST/courses) needs five fields:

| Field | For a term | Meaning |
|---|---|---|
| `name` | `"Little movers"` | The programme's name. **Check that it isn't empty yourself**: `""` is accepted. |
| `public` | `true` / `false` | Show it in the programme catalogue on your website. |
| `online_registration` | `true` / `false` | Allow online booking. `false` means none of its classes can be booked online. |
| `registration_type` | `"full2"` | A term: the client books the whole class and is enrolled in every session. |
| `course_type` | `"course"` | A programme with instructors and sessions. |

`price` is the programme's total price. Payment settings you don't send (`money_collection`, `price_type`,
`unit_price`, `registration_fee`) are copied from the company's defaults. If the company collects in instalments,
`price` is for reference only, so read `money_collection` in the answer, or send it.

<ApiExample id="set-up-a-term/04-create-programme" />

The answer is the whole programme. Keep its `id` for the next step.

## 3. Create the class

The class is the group that meets: venue and room, instructor, number of places, start time and billing period.
[`POST /v3/schedules`](/api/reference#tag/classes/POST/schedules) creates it in the programme. Creating a class
creates no sessions.

Send these fields, and check every one before you send:
- **Required:** `course_id`, `name`, `room_id`, `trainer_id`, `capacity`, `all_day`, `online_registration`.
- **`place_id`, always.** Without it, Zooza picks one of the company's active venues, which may not be the room's.
- **`billing_period_id`, always.** Without it, the class goes into the company's most recently created billing
  period, which may not be this term's.
- **`time`**: the start in **minutes after midnight** (`960` = 16:00). Leave it out and the class starts at 15:00.
- **`duration`**: the length in minutes. Leave it out and it is 60.

<ApiExample id="set-up-a-term/05-create-class" />

**Don't read the answer to check what was stored.** Right after creation the class has no sessions, so the answer
says `time: 0` and `start` / `end` `"0000-00-00"`, which come from the sessions. It also says `billing_period_id: null`:
the billing period is in `billing_periods_schedules.billing_period_id`. Keep the values you sent for the next step.

**An all-day class:** send `all_day: true` and `time: 0`, and leave out `duration`. The class is stored with the
default `duration` of 60, which doesn't matter for an all-day class.

<ApiExample id="set-up-a-term/06-create-all-day-class" title="An all-day class" />

## 4. Create the sessions

[`POST /v3/events`](/api/reference#tag/sessions/POST/events) creates any number of sessions in one request, so a
whole term is one call and 5 points, not one call per week. The body is an object with an `events` list, one item per
session. Each item repeats the class's values:

| Field | Value |
|---|---|
| `date_string` | The date, `YYYY-MM-DD`. |
| `time_string` | The start in **minutes after midnight**, a number despite its name: the class's `time`. |
| `course_id`, `schedule_id` | The programme and the class. |
| `trainer_id`, `place_id`, `room_id` | The class's instructor, venue and room. |

Leave out `duration` and the session takes the class's length. New sessions are `scheduled`, and no client is
notified.

**Build the dates in UTC**, or in whole days. Adding 7 × 24 hours to a local midnight shifts by an hour when summer
time starts or ends, and can land on the previous day.

<ApiExample id="set-up-a-term/07-create-sessions" />

**A bare list is refused.** Send `{ "events": [ … ] }`, not `[ … ]`:

<ApiExample id="set-up-a-term/08-sessions-bare-array" title="A bare list instead of { events }" />

**An incomplete item is skipped without an error.** An item missing `date_string`, `time_string`, `course_id`,
`schedule_id`, `trainer_id` or `place_id` is dropped. If every item is dropped, the answer is still `200`, with an
empty list. Check every item before you send, and count the sessions afterwards (step 5).

<ApiExample id="set-up-a-term/09-sessions-skipped" title="Two incomplete items: 200, nothing created" />

## 5. Read the term back

A `200` from `POST /events` doesn't prove the sessions exist. Read the term back from Zooza, not from what you sent.

**The class:** [`GET /v3/schedules/{ID}`](/api/reference#tag/classes/GET/schedules/{ID}). Now that it has sessions,
`start`, `end` and `time` are real. Only this read (not the class list) also has `trainer`, the instructor as a user,
and `billing`, which billing profile and bank account the class invoices with. The billing period is again in
`billing_periods_schedules`.

<ApiExample id="set-up-a-term/10-read-class" />

**The sessions:** [`GET /v3/events`](/api/reference#tag/sessions/GET/events) with
`filter=filter&schedule_id=<class id>`. Send `filter=filter`: without it, the list ignores `schedule_id`. One page
holds up to 1000 sessions, more than one term needs.

<ApiExample id="set-up-a-term/12-read-sessions" />

**Compare the number of sessions with the number you sent.**
- **Fewer:** items were skipped (step 4). Show the dates, so the user sees which weeks are missing.
- **More:** the sessions were sent twice. `POST /events` doesn't check for duplicates, so the same request sent
  again creates every session again:

<ApiExample id="set-up-a-term/13-sessions-sent-twice" title="Sent twice: every date has two sessions" />

To show the programme's name with the class, read it with
[`GET /v3/courses/{ID}`](/api/reference#tag/programmes/GET/courses/{ID}).

## 6. When a write fails

There is no delete, so a failure half-way mustn't mean starting again. The programme, and maybe the class, already
exist.

**Keep every id you've made**, and on a retry skip the writes that already have one. Before you send the sessions
for a class made earlier, read its sessions (step 5): if it has any, the term is done and you send nothing. That's
what prevents duplicates.

**Read the status before you retry:**
- **`400` or `422`:** Zooza refused the request and created nothing. Fix the value and send again.
- **Anything else** (a `5xx`, a timeout, no answer): something may have been created. Check before you send again,
  or a blind retry can make a second class or a second set of sessions.

**The two error shapes.** A `422` means the body doesn't match the operation's schema. The body is the standard
[error object](../errors.md), and `errors` lists every problem at once, each with a `path` into your body:

<ApiExample id="set-up-a-term/14-class-validation-failed" title="422: two fields of the wrong type" />

A `400` means the body was valid but Zooza refused it, for example an id that doesn't exist. The body is
`{ "errors": [{ "<code>": "<message>" }], "request_valid": false }`:
- the message is in the company's language, so **branch on the four-digit code**, not the text;
- there's no `request_id` in this body, so take it from the `X-Request-Id` header when you report a problem.

<ApiExample id="set-up-a-term/16-class-unknown-programme" title="400 0065: a programme that doesn't exist" />

Required fields aren't all checked by the schema. A class without `room_id` gets a `400` `0068` ("insert failed"),
which doesn't name the field:

<ApiExample id="set-up-a-term/15-class-without-room" title="400 0068: no room_id" />

## Things Zooza accepts that you should check yourself

These answer `200` and create something you can't delete:
- **An empty programme name.** Check `name` before you send.
- **A `billing_period_id` or `room_id` that doesn't exist.** The class is stored pointing at nothing. Offer only the
  ids from step 1.

The schema doesn't refuse a negative `capacity` either, so check that it's at least 1.

<ApiExample id="set-up-a-term/17-class-unknown-term-block" title="A billing period that doesn't exist: 200" />

<ApiExample id="set-up-a-term/18-programme-empty-name" title="An empty programme name: 200" />
