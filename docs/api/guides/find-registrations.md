---
title: Find registrations
description: Search a company's registrations with the Zooza API. Free text, programme, class and status filters, zero-based paging past the 500 cap, then opening one registration. With the requests, the answers and the pitfalls at each step.
---

import ApiExample from '@site/src/components/ApiExample';

# Find registrations

This guide searches a company's registrations the way a back office does, then opens one:

1. [List the newest registrations](#1-list-the-newest-registrations).
2. [Search by name, email or phone](#2-search-by-name-email-or-phone).
3. [Filter by programme, class and status](#3-filter-by-programme-class-and-status).
4. [Page through the results](#4-page-through-the-results).
5. [Open one registration](#5-open-one-registration).

Every call here is a read, so nothing in the company changes. Every request and answer on this page was recorded
from a real call. Names, emails and other personal data are replaced.

## Before you start

- **A key with `core_read`.** A search costs 2 points per page, and opening one registration costs 1. See
  [Access and rate limits](../access-and-rate-limits.md).
- **The token from [Authentication](../authentication.md).** Send it on every request as
  `Authorization: Bearer <token>`.

## 1. List the newest registrations

[`GET /v3/registrations`](/api/reference#tag/registrations/GET/registrations) is a search. **Send
`advanced_search=1` on every call**, even with no filter. With nothing else sent, you get the first page of 20, newest
first, without deleted registrations.

<ApiExample id="search-registrations/01-list-newest" />

Without `advanced_search=1` the answer is a `422` that names the missing parameter:

<ApiExample id="search-registrations/02-without-advanced-search" title="Forgetting advanced_search=1: 422" />

**Reading a row:**
- **The id is `registration_id`.** A row has no `id`. Use `registration_id` to open the registration (step 5).
- **The row carries its whole programme and class** in `course` and `schedule`, with their names, so the list needs
  no extra call per row.
- **`created` and `updated` aren't ISO 8601.** They look like `2026-11-20 18:21:34`: a space, no `T` and no time
  zone. They're in the region's local time (see [Dates and times](/api/reference#description/dates-and-times)).
  `new Date()` doesn't parse that the same way everywhere, so parse it yourself.
- **An empty note can be `""` or `null`.** Treat both as "no note".

## 2. Search by name, email or phone

`user` is the free-text search. It takes part of a client's first name, last name, full name, email or phone, and
matches case-insensitively. It also matches the registration id, so a short number can match phone digits and ids
at once.

<ApiExample id="search-registrations/03-free-text-search" />

**A search that matches nothing is a `200`** with `total: 0` and an empty `results`, not a `404`. Show your own "no
match" message.

<ApiExample id="search-registrations/04-no-match" title="No match: 200 with no results" />

**Don't send an empty `user=`.** It doesn't mean "match nothing": the API ignores it and returns the full list. Leave
the parameter out when the search box is empty.

**`email` isn't a search.** It matches one whole address exactly, and anything that isn't a valid address is refused
with a `422`. To search by part of an address, use `user`.

<ApiExample id="search-registrations/05-partial-email" title="Part of an address in email: 422" />

## 3. Filter by programme, class and status

Three filters narrow the list: `course_id` (programme), `schedule_id` (class) and `status`. They combine with each
other and with `user`, and every one must match. Offer choices loaded from the API, not ids typed by hand.

**Programmes:** [`GET /v3/courses`](/api/reference#tag/programmes/GET/courses) returns every programme in one plain
array, not paginated and sorted by name. Archived programmes are included (`archive: true`). Their registrations
still exist, so keep them in the list and label them.

<ApiExample id="search-registrations/06-programme-list" />

**Classes of a programme:** [`GET /v3/schedules`](/api/reference#tag/classes/GET/schedules) with `course_id`. Unlike
the programme list, it is paginated (50 per page by default), so ask for a `page_size` large enough for one
programme's classes.
- **A class's `name` is often empty**, and two classes can share one. Label a class by its name and its start:
  `start` plus `time`, which is in **minutes after midnight** (`674` = 11:14). A class without sessions has `start`
  `"0000-00-00"`.
- **When the programme changes, drop the old `schedule_id`.** The filters combine with AND, so a class from another
  programme matches nothing.

<ApiExample id="search-registrations/07-classes-of-a-programme" />

**Classes of an archived programme aren't listed.** `GET /schedules` leaves them out, even when you ask for that
programme's `course_id`, and there's no parameter to include them. Filtering by the archived programme alone still
works.

<ApiExample id="search-registrations/10-archived-programme-classes" title="An archived programme: no classes" />

**Status:** use the values the [reference](/api/reference#tag/registrations/GET/registrations) lists for `status`.

<ApiExample id="search-registrations/08-filters-combined" />

Status filtering has three surprises:
- **`status=registered` also returns `pre_registered`**, and so on for every value except `canceled` and `deleted`.
  The rows show each registration's real status.
- **Leaving `status` out isn't "all statuses".** It means everything but deleted. To see deleted registrations,
  send `status=deleted`.
- **An unknown value turns the filter off.** `status=bogus` isn't a `422`: it returns every registration, deleted
  ones included. A typo shows more, not less, so send only the reference's values.

<ApiExample id="search-registrations/09-unknown-status" title="An unknown status: the filter is ignored" />

## 4. Page through the results

**Pages start at 0.** `page=0` is the first page and `page=1` the second. A pager that counts from 1 skips the first
page. Send `page_size` with `page`, and keep every filter when you change the page. Use `offset` from the answer to
know where the page starts: `page` comes back `null`.

<ApiExample id="search-registrations/11-paging-first-page" />

**`total` stops counting at 500.** Past that, the answer says `total: 500` and `total_capped: true`, and the real
number isn't available. Show "500+", not an exact-looking number, and don't compute the last page from `total`.

**The rows don't stop at 500.** Pages past offset 500 keep coming, so with a capped total, a full page means there
may be more:

<ApiExample id="search-registrations/12-paging-past-the-cap" title="Page 25: past the cap, still a full page" />

**A page past the end is a `200` with no results**, not an error. With a capped total and a full last page, Next
leads to one empty page: show a message and keep Previous.

<ApiExample id="search-registrations/13-paging-past-the-end" title="Past the end: 200 with no results" />

## 5. Open one registration

[`GET /v3/registrations/{ID}`](/api/reference#tag/registrations/GET/registrations/{ID}) reads one registration, with
`registration_id` from the list as `{ID}`. Read it fresh rather than reusing the row: the row is a copy from when the
list was loaded, and it lacks `public_note`.

<ApiExample id="search-registrations/14-one-registration" />

**The fields aren't named as in the list.**

| In the list | In the detail |
|---|---|
| `registration_id` | `id` |
| `full_name`, `email`, `phone` | `__users__full_name`, `__users__email`, `__users__phone` |
| `course.name` | `__courses__name` |

The detail has both notes:
- `company_note` is the staff note, never shown to the client;
- `public_note` is shown to the client in their profile and may hold basic HTML. Show it as text, or sanitise it
  before you render it.

**An id that isn't the company's registration is a `400`, not a `404`.** The body is the
[request error](../errors.md#requesterror) `{"errors": [{"0065": "…"}], "request_valid": false}`:
- the message is in the company's language, so branch on the code `0065`;
- there's no `request_id` in this body, only in the `X-Request-Id` header;
- an error display built only for the standard error object shows nothing useful here, so handle both shapes.

<ApiExample id="search-registrations/15-unknown-registration" />

Check the id before you call: if it comes from a URL, send only whole numbers.

## Next

[Change a registration](change-a-registration.md): save a staff note, or change the status after checking what the
change would do.
