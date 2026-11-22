---
title: Error codes
description: Every four-digit Zooza API error code returned in a 400 response, with its name, when it is returned and its English message.
sidebar_position: 6
---

import ErrorCodes from '@site/src/components/ErrorCodes';
import ChatButton from '@site/src/components/ChatButton';

# Error codes

A `400` response carries one or more four-digit error codes in the [`RequestError`](errors.md#requesterror)
envelope. This page lists every code. It is generated from the API reference, so it always matches what the API
publishes.

```json
{
  "errors": [{ "0066": "Neplatný zľavový kód" }],
  "request_valid": false
}
```

- **Branch on the code, never on the message.** A code never changes meaning. Messages are written for people:
  they come in the **company's language** and their wording may change. The English messages below are for
  reference only.
- **Some codes name a value.** The table says which, and where to find it:
  - *The value ends the message*, after ` - `, or in place of a placeholder:
    `{"0037": "Neplatná hodnota parametra - rate_tier"}`.
  - *The value comes under key `0`*, next to the code: `{"0074": "…", "0": "…"}`.
- **Codes aren't tied to particular operations.** General codes such as `wrong_parameters_sent`,
  `resource_not_found`, `invalid_value` and `update_failed` can come from almost any operation, so handle codes
  you didn't expect.

Link to a single code with `/api/error-codes#<code>`, for example [`#0065`](#0065).

A code that isn't clear, or one you think is returned by mistake? <ChatButton template="errorCode">Ask us</ChatButton>

<ErrorCodes />
