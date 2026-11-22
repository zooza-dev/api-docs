---
title: Cancel a registration
description: Cancel a registration with the Zooza API, now or on a date. Check the cancellation first with preflight_check, ask about the client's make-up credits and the registrations booked together, choose whether the client is emailed, then apply.
---

import ApiExample from '@site/src/components/ApiExample';

# Cancel a registration

Cancelling looks like one field, `status: canceled`, but it can do more:
- cancel the client's unused make-up credits;
- affect the other registrations booked together with this one;
- move money;
- email the client.

This guide uses the [preflight check](../preflight-check.md) to find out what a cancellation would do, ask the user
what it needs, and then apply it:

1. [Check the cancellation](#1-check-the-cancellation).
2. [Make-up credits](#2-make-up-credits): how many the client keeps.
3. [Registrations booked together](#3-registrations-booked-together): what happens to the group.
4. [Email and date](#4-email-and-date): whether the client hears about it, and when it happens.
5. [Apply](#5-apply).

Every request and answer from a recorded call is marked as an example. Names, emails and other personal data are
replaced.

## Before you start

- **A key with `core_read` and `core_write`.** The check and the cancellation each cost 5 points. See
  [Access and rate limits](../access-and-rate-limits.md).
- **The registration's id.** See [Find registrations](find-registrations.md).
- **The token from [Authentication](../authentication.md)**, sent as `Authorization: Bearer <token>`.

Both calls are [`PUT /v3/registrations/{ID}`](/api/reference#tag/registrations/PUT/registrations/{ID}) with the body
`action: change_status`. [Change a registration](change-a-registration.md) explains why that body must carry
nothing else.

## 1. Check the cancellation

Send the cancellation with `?action=preflight_check`. **A cancellation needs a reason**: `cancellation_reason`, one of
the values the reference lists (for example `personal_default` or `not_paid_default`), or `cancellation_reason_id`,
one of the company's own reasons.

<ApiExample id="update-registration/05-check-a-cancel" title="Checking a cancellation" />

**The checks of a status change.** The reference doesn't describe them per check yet, so this table describes how
they behave today:

| Check | Severity | Not passed means |
|---|---|---|
| `status_allowed` | `error` | The registration can't go from its current status to this one. |
| `rules_hold` | `error` | The change would break a rule about registrations booked together. `refusals` says which. |
| `decision_missing` | `error` | The change needs a decision you haven't sent: what happens to the group (step 3). |
| `replacement_conversion_count` | `error` | Only when you send `convert_replacements_to_free_event`: the number isn't a whole number from 0 to the make-up credits available (step 2). |
| `money_moves` | `notice` | Money would move between registrations. `transfers` lists the movements. |
| `transferred_money_stays` | `notice` | Money moved earlier stays where it is; it doesn't move back. |
| `currency_conversion` | `notice` | A movement would convert between currencies. |

**The properties:**

| Property | What it holds |
|---|---|
| `result` | The registrations involved, as they would be after the change. `members` lists each with a `summary` (client, programme, class, status, balance, currency). |
| `replacement_credits` | On a cancellation only: the client's unused, unexpired make-up credits from this registration (step 2). |
| `refusals` | Why an `error` check failed: the `check`, the `booking` concerned and, when a decision would solve it, its `options`. |
| `options` | Every choice the change offers, in the same shape as a refusal's `options`. `{}` when there's nothing to choose. |
| `transfers` | The money movements the change would make. |
| `balances` | Each affected registration's balance after the change. |

A registration that isn't in a group passes every check about groups, and `options` is `{}`.

**Without a reason, the check itself is refused**, with a `400` `0338`:

<ApiExample id="update-registration/10-cancel-without-reason" title="Checking a cancellation without a reason" />

## 2. Make-up credits

When a client misses a session in time, they can earn a make-up credit (see
[How make-up sessions work](../../make-up-sessions.md)). **Cancelling the registration cancels every make-up credit the
client still has from it**, unless you say how many to keep as free sessions.

`properties.replacement_credits` shows what the client has:

```json
{ "available": 2, "replacement": 2, "replacement_transfer": 0 }
```

`available` is the total, split into the two kinds of make-up credit. With `available: 0` there's nothing to ask.
Otherwise, ask before you cancel:

> This registration has 2 unused make-up credits. Cancelling it cancels them too. How many should the client keep
> as free sessions? (0–2)

Send the answer as `convert_replacements_to_free_event`. To validate the number first, include it in the check:
`replacement_conversion_count` then says whether it's valid.
- **Which credits are kept:** the ones that expire last.
- **The rest:** cancelled together with the registration. Either all of it happens or none of it.
- **Without the field, or with `0`:** every credit is cancelled.
- **On apply:** the number is checked against the credits available then, so it fails if the client has used one in
  the meantime.

There's no other `/v3` call that lists a registration's make-up credits. The check is the way to know.

## 3. Registrations booked together

Registrations can be booked together, for example siblings in one booking, or a trial with the products bought with
it. A group has one main registration, which may pay for the others.

**Cancelling any other registration in the group changes nothing about the group.** The checks pass and `options` is
`{}`.

**Cancelling the main registration needs a decision.** Without it, `decision_missing` fails, and `refusals` and
`options` list the choices:

| Choice | What happens |
|---|---|
| `new_root` | Another registration of the group becomes the main one. `options.new_root` lists the registrations that can. The cancelled registration's money moves to the new main one, unless `options` offers `keep_balance` and you choose it. |
| `whole_group` | Every registration in the group is cancelled with it. |
| `disband` | The group stops existing, and each registration pays for itself. Optionally, `transfer_balance_to` (one of `options.transfer_balance_to`) receives the cancelled registration's remaining balance. |

Send the choice in `linking`, next to `status`, both in the check and when you apply:

```json
{
  "action": "change_status",
  "status": "canceled",
  "cancellation_reason": "personal_default",
  "linking": { "resolution": "new_root", "new_root": { "type": "registration", "id": 50715 } }
}
```

Check again with the decision in. `decision_missing` then passes, and `transfers` and `balances` show what the choice
does to the money. Show that to the user before you apply.

## 4. Email and date

**Email.** Zooza emails the client only if you ask:
- **`send_confirmation`** emails a cancellation confirmation **whatever its value**, `false` included. To send no
  email, leave the key out.
- **`email`** sends your own message, but only when it has `subject`, `body` and `template`.

The check doesn't say whether an email would go: that depends only on these two fields.

**Date.** Without `schedule_at`, the registration is cancelled now. With `schedule_at: "YYYY-MM-DD"`, it is cancelled
on that date, but some of it is decided **when you schedule it**:
- the make-up credits are handled at once: kept as free sessions or cancelled;
- the group decision (step 3) is applied at once;
- only the status waits for the date.

The check works the same for a scheduled cancellation. To call a scheduled cancellation off, send
`action: revoke_scheduled_status_change`. That doesn't bring back make-up credits that were already cancelled.

## 5. Apply

Send the same body without `?action=preflight_check`, with the decisions from steps 2 to 4 added. The answer is the
registration with its new status.

<ApiExample id="update-registration/06-apply-a-cancel" title="Applying the cancellation" />

**If the check refused it, the apply is refused too**, with a `400`. Here is a refused change applied anyway:

<ApiExample id="update-registration/09-apply-refused" title="Applying a refused change: 400 0033" />

### Undoing a cancellation

You can change a cancelled registration's status again, but not always back to what it was. For example, after
`pre_registered` → `canceled`, the check refuses `pre_registered` and allows `registered` or `waitlist`. Check first:

<ApiExample id="update-registration/07-check-reinstate" title="Checking canceled → registered" />

Make-up credits cancelled with the registration don't come back.
