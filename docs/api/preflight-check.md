---
title: Preflight check
description: How ?action=preflight_check works on the Zooza API. It tests a change without writing anything and answers with checks (with severities) and properties. What's the same for every operation, and how to handle it once.
---

import ApiExample from '@site/src/components/ApiExample';
import PreflightOperations from '@site/src/components/PreflightOperations';

# Preflight check

Some changes in Zooza do more than change one field: they can move money, affect other bookings, or need a decision
first. A **preflight check** tests such a change before it happens. Send the request you mean to make with
`?action=preflight_check` added, and Zooza answers what would happen and **writes nothing**.

This page covers what's the same for every operation. **Each operation has its own checks and properties**: the
[reference](/api/reference) documents them per operation, and the guides show how to use them in a real flow.

## How it works

1. **Check:** send the request with `?action=preflight_check`.
2. **Decide:** read `checks` to see whether the change would go through, and use `properties` to show the user what
   would happen, or to ask for the decisions it needs.
3. **Apply:** send the same request without `?action=preflight_check`, with the user's decisions added to the body.

**The apply step checks everything again.** Data can change between the two calls, so the apply runs the same checks
on current data and refuses the change if one fails. Nothing links the two calls (no token, nothing stored), so a
check that passed a minute ago is not a promise.

**A check costs the same points as the change itself**, although it writes nothing.

## The answer

The answer is always a `200` with two objects:

```json
{
  "checks": {
    "<check name>": { "name": "<check name>", "result": "passed", "severity": "error" }
  },
  "properties": {
    "<property name>": { "name": "<property name>", "value": "<depends on the property>" }
  }
}
```

**`checks`**: each check is a question about the change, with a `result` of `passed` or `not_passed` and a severity:

| Severity | If it didn't pass |
|---|---|
| `error` | The change would be refused. Don't offer to apply it: explain why, or ask for what's missing. |
| `warning` | The change would go through, but the user should confirm something first. |
| `notice` | Something the user should know. It never blocks the change. |

**`properties`**: what you need to decide, such as the records involved, amounts, or the choices the change offers.
Each property's `value` has its own shape.

**The status is `200` whether or not the change would go through.** Read `checks`, not the status code. Here, a
check with severity `error` didn't pass:

<ApiExample id="update-registration/08-check-refused" title="A refused change: still a 200" />

## Handling any preflight check

You can handle every operation's check with the same code, and add operation-specific handling only where you need
it:

1. If any check with severity `error` is `not_passed`, don't offer to apply.
2. If any check with severity `warning` is `not_passed`, ask the user to confirm.
3. Show each `notice` that's `not_passed` as information.
4. Read `properties` only for the operations your app knows, by property name. Ignore names you don't know: an
   operation can gain checks and properties over time.

## Errors

Before it gets to `checks`, a preflight check can fail with the same errors as the change itself: a `422` when the
body doesn't match the schema, or a `400` when Zooza refuses the request (a missing field the change needs, for
example). See [Errors](errors.md).

## Operations with a preflight check

<PreflightOperations />

For a worked example, see [Cancel a registration](guides/cancel-a-registration.md): it uses the check to find the
client's make-up credits and the registrations booked together, and to ask the right question before cancelling.
