---
title: Change a registration
description: Update a registration with the Zooza API. Save the staff note, and change the status after checking the change with preflight_check. With the requests, the answers and the pitfalls.
---

import ApiExample from '@site/src/components/ApiExample';

# Change a registration

This guide changes one registration in two ways:

1. [Save the staff note](#1-save-the-staff-note).
2. [Change the status](#2-change-the-status): check the change first, then apply it.

To cancel, see [Cancel a registration](cancel-a-registration.md).

Both use [`PUT /v3/registrations/{ID}`](/api/reference#tag/registrations/PUT/registrations/{ID}). Every request and
answer on this page was recorded from a real call. Names, emails and other personal data are replaced.

## Before you start

- **A key with `core_read` and `core_write`.** Each `PUT` costs 5 points, the check included. See
  [Access and rate limits](../access-and-rate-limits.md).
- **The registration's id.** [Find registrations](find-registrations.md) shows how to get one.
- **The token from [Authentication](../authentication.md)**, sent as `Authorization: Bearer <token>`.

### How this `PUT` decides what to do

`PUT /registrations/{ID}` is one operation for several jobs. It looks at the request in a fixed order and does the
first that matches:
1. `?action=preflight_check` (a check, step 2);
2. a `billing` object;
3. `notify_alternate_email` or `notify_alternate_email_only`;
4. `?confirm_registration=1`;
5. `slots`, `notify`, `business_order` or `notify_about_upcoming_events`;
6. a body `action` (a status change, step 2);
7. `actions`;
8. `?confirm_late=1`;
9. only then, the plain fields: `company_note`, `public_note`, `note`, `downpayment`, …

So **send only the fields of the one job you mean**. The [reference](/api/reference#tag/registrations/PUT/registrations/{ID})
describes each job.

## 1. Save the staff note

`company_note` is the staff note: the client never sees it. Send a body with only that field. Fields you leave out
are kept, because this `PUT` changes what you send and doesn't replace the registration. So don't read the
registration and send it all back.

<ApiExample id="update-registration/01-save-staff-note" />

The answer is the whole registration as it is now, with the new note. To clear the note, send `""`:

<ApiExample id="update-registration/02-clear-staff-note" title="Clear the note" />

**Line breaks from a browser textarea arrive as `\r\n`.** Turn them into `\n` before you send, if you want them stored
the way the Zooza app stores them.

**One extra field and the note is ignored.** A field from an earlier job in the list above makes the `PUT` do that
job and read nothing else. The answer is still `200` with the registration, and the note is unchanged, with no
error:

<ApiExample id="update-registration/03-note-ignored" title="company_note with notify_about_upcoming_events: note unchanged" />

If you must be sure, compare `company_note` in the answer with what you sent.

**An id that isn't the company's registration is a `400` request error with code `0065`**, as with `GET`:

<ApiExample id="update-registration/04-update-unknown-registration" />

## 2. Change the status

A status change can move money, affect other registrations booked together, and be refused by the company's rules.
So check it first with a [preflight check](../preflight-check.md): the same `PUT` with `?action=preflight_check`
tests the change and writes nothing. Then send the same body without the query to apply it.

**Cancelling has decisions of its own**: a reason, the client's make-up credits, the registrations booked together,
an email, and a date. [Cancel a registration](cancel-a-registration.md) covers them. This section covers any status
change.

**The body** is `{ "action": "change_status", "status": "<new status>" }`.
- **Without `schedule_at`**, the change is made now.
- **No email goes** unless you send `email` or `send_confirmation` (see
  [Cancel a registration](cancel-a-registration.md#4-email-and-date)).

### Check the change

<ApiExample id="update-registration/07-check-reinstate" title="Checking canceled → registered" />

The answer is a `200` with `checks` and `properties`, **whether or not the change is allowed**. If any check with
severity `error` is `not_passed`, the change would be refused, so don't offer to apply it. With more than one
registration in `properties.result.value.members`, say that the change applies to this registration.
[Cancel a registration](cancel-a-registration.md#1-check-the-cancellation) describes each check and property of a
status change.

Here the change isn't allowed, because `status_allowed` didn't pass:

<ApiExample id="update-registration/08-check-refused" title="A change the check refuses: still 200" />

### Apply it

Send the same body without `?action=preflight_check`. The answer is the registration with its new status, as here
after a cancellation:

<ApiExample id="update-registration/06-apply-a-cancel" />

**A refused change, applied anyway, is a `400`** with code `0033`:

<ApiExample id="update-registration/09-apply-refused" title="Applying a refused change: 400 0033" />

### The two error shapes

A status value the API doesn't know is caught first, against the schema: a `422` in the standard
[error object](../errors.md), with `request_id` in the body and `errors[].path` naming the field.

<ApiExample id="update-registration/11-unknown-status-value" title="An unknown status: 422" />

A refused change, or a cancellation without a reason, is caught when the request runs: a `400`
[request error](../errors.md#requesterror) with a four-digit code, a message in the company's language and no
`request_id` in the body, like the `0033` above.

Handle both shapes, and branch on `error` and `errors[].code` for a `422`, or on the four-digit code for a `400`.
