---
title: Errors
description: Zooza API status codes and error bodies — the Error body, the 422 validation list, the RequestError envelope, token errors, and when to retry.
sidebar_position: 5
---

import ChatButton from '@site/src/components/ChatButton';

# Errors

The Zooza API answers with standard HTTP status codes. Errors come in three body shapes, depending on the status.

| Status | Body | Meaning |
|---|---|---|
| `400` | [`RequestError`](#requesterror) | The request was understood but failed, e.g. a record wasn't found or a business rule refused it. Messages are localised. |
| `401` | [`Error`](#error) | The access token is missing, invalid or expired. |
| `403` | [`Error`](#error) | The operation is outside your key's [access groups](access-and-rate-limits.md#access-groups). |
| `404` | [`Error`](#error) | The path doesn't exist. |
| `422` | [`Error`](#error) with `errors` | The request doesn't match the operation's schema. [Every problem is listed](#validation). |
| `429` | [`Error`](#error) | Over your company's point budget (shared by all its keys). Wait `Retry-After` seconds. |
| `500` | either | An unexpected error. |
| `503` | [`Error`](#error) | Temporarily unavailable. No points were charged. |
| `504` | [`Error`](#error) | No answer in time. No points were charged. |
| `400`, `401` on `POST /v3/token` | [OAuth error](#oauth-errors) | The token request was refused. |

## `Error` {#error}

```json
{
  "error": "rate_limited",
  "message": "Over the point budget.",
  "request_id": "…"
}
```

| Field | Meaning |
|---|---|
| `error` | A stable machine code, e.g. `validation_failed` or `rate_limited`. Branch on this, not on `message`. |
| `message` | A human-readable explanation, in English. |
| `request_id` | Identifies the request. Also sent as the `X-Request-Id` header. **Quote it when you contact support.** |
| `errors` | On `422` only: every validation problem (below). |

## Validation errors (`422`) {#validation}

Requests are checked against the documented schema of the operation before they run. A `422` lists **every** problem
found (up to 100 per response), not only the first, so you can fix them all at once.

```json
{
  "error": "validation_failed",
  "message": "The request does not match this operation's schema.",
  "request_id": "…",
  "errors": [
    {
      "location": "body",
      "path": "/capacity",
      "code": "type_invalid",
      "message": "Expected an integer.",
      "expected": { "type": "integer" },
      "received": { "type": "string", "value": "12" }
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `location` | `body`, `query` or `path` |
| `path` | A JSON Pointer into the body (e.g. `/participants/0/email`), or the name of the query or path parameter |
| `code` | What is wrong, as a stable code (below) |
| `message` | The problem in words, in English |
| `expected` | The rule that was broken, e.g. `{"maximum": 200}` |
| `received` | What was sent: its type and its value, truncated to 100 characters. The value is never echoed for secret-looking fields. |

**Codes:** `required_missing`, `type_invalid`, `enum_invalid`, `format_invalid`, `pattern_mismatch`, `minimum`,
`maximum`, `min_length`, `max_length`, `min_items`, `max_items`, `unknown_field`, `invalid`.

**Types.** Query and path parameters are converted to the documented type, so `?page_size=50` is fine. Body values are
not converted: send `5`, not `"5"`, where a number is expected.

**Not everything is checked up front.** Some operations accept several kinds of request in one body, for example
`PUT /registrations/{ID}` with `action`. For those, the up-front check covers the types and the fields every kind
needs. The fields a particular `action` needs are checked when the request runs, so you may still get a `400`.

## `RequestError` {#requesterror}

`400` (and some `500`) responses use the request-error envelope:

```json
{
  "errors": [
    { "0065": "Resource not found - Registration" }
  ],
  "request_valid": false
}
```

- `errors` has one entry per error. The key is a four-digit **error code**; look it up in the
  [error code reference](error-codes.md). The value is a message in the **company's language** (its own setting, not
  something the request chooses).
- When an error names what was refused, the value ends the message, as in the example. A few codes return it under
  key `0` instead: `{"0074": "…", "0": "…"}`. The [error code reference](error-codes.md) says which.
- Branch on the code, never on the message: messages are translated and reworded.
- `request_valid` is always `false`.
- Only `errors` and `request_valid` are part of the contract. Other fields may appear; don't rely on them.

## Token errors {#oauth-errors}

`POST /v3/token` uses OAuth error bodies:

```json
{ "error": "invalid_client", "error_description": "…" }
```

`error` is `invalid_request` (a field is missing), `unsupported_grant_type` or `invalid_client` (credentials not
accepted, with no reason given). See [why a token request is refused](authentication.md#invalid-client).

## Retrying

| Status | Retry? |
|---|---|
| `400` | No. Fix the request; the [error code](error-codes.md) says what is wrong. |
| `401` | Request a new token, then retry once. If it fails again, check the key (see [Authentication](authentication.md#invalid-client)). |
| `403` | No. The key lacks the access group. An owner can add it (see [Keys](keys.md)). |
| `404` | No. Check the path against the [reference](/api/reference). |
| `422` | No. Fix every problem in `errors`. |
| `429` | Yes, after `Retry-After` seconds. Never in a tight loop. |
| `500` | Possibly, once, after a short wait. If it repeats, contact support with the `request_id`. |
| `503`, `504` | Yes, with increasing waits (e.g. 1 s, 2 s, 4 s). No points were charged. |

Be careful when retrying writes (`POST`, `PUT`) after a `500` or `504`: the change may have been made. Read the record
first to check.

## In practice

What the recorded calls in the guides showed:

- **"Not found" is a `400`, not a `404`.** Reading or changing a registration that isn't the company's answers `400`
  with code `0065` in the [request-error](#requesterror) shape. The same goes for creating a class in a programme
  that doesn't exist. See [Find registrations](guides/find-registrations.md#5-open-one-registration).
- **One call can answer in both shapes.** A value the schema refuses is a `422` [`Error`](#error); a value Zooza
  refuses while running the request is a `400` `RequestError`. Changing a status can give either. See
  [Change a registration](guides/change-a-registration.md#the-two-error-shapes).
- **A `400` request error has no `request_id` in its body.** Take it from the `X-Request-Id` header when you contact
  support.
- **Some required fields aren't in the schema**, so leaving one out is a `400` that doesn't name the field, not a
  `422` `required_missing`. See [Set up a term](guides/set-up-a-term.md#6-when-a-write-fails).
- **A `200` isn't always "done".** Some writes skip what they can't use without an error. Read the result back. See
  [Set up a term](guides/set-up-a-term.md#5-read-the-term-back).

## Contacting support

Got a `500`, or something you can't explain? Tell us in the chat: choose **Create a ticket**, then **API Problem**.
Include the `request_id` (or the `X-Request-Id` response header), the operation, the time of the call and the region.

<ChatButton template="home" note={false}>Report a problem</ChatButton>

Never include your `client_secret` or an access token. If you've shared one by mistake,
[revoke the key](keys.md#security).
