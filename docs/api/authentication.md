---
title: Authentication
description: How to authenticate with the Zooza REST API — headers, token acquisition, and code examples.
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Authentication

This page covers authentication for the **REST API** only. Widgets do not require authentication — see the [widget docs](../widgets/index.md) for embedding instructions.

Zooza uses **passwordless login**. Instead of relying on a password, identity is verified via email verification, PIN code, or client secret.

---

## Required headers

Every REST API request requires these three headers:

| Header | Description |
|--------|-------------|
| `X-ZOOZA-API-KEY` | Your REST API key |
| `X-ZOOZA-TOKEN` | Identifies the current user |
| `X-ZOOZA-COMPANY` | Scopes requests to a specific company |

---

## Obtaining your REST API key

REST API keys are different from widget API keys and must be requested through [Zooza support](mailto:support@zooza.com). A widget API key **cannot** be used for REST API calls.

---

## Obtaining a user token

There are three ways to obtain a token, depending on your use case.

### Via email verification

The most common approach for customer-facing applications.

1. Send a POST request with the user's email.
2. Zooza sends a verification email containing a link with a `key` query parameter.
3. Extract the token from the URL and store it.

**Example verification link:**

```
https://yoursite.com?key=abc123token
```

<Tabs>
  <TabItem value="curl" label="cURL">

```bash
curl -X POST https://api.zooza.app/v1/login \
  -H "Content-Type: application/json" \
  -H "X-ZOOZA-API-KEY: your_api_key" \
  -d '{
    "login": "customer@example.com",
    "verification_method": "email"
  }'
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```javascript
const response = await fetch("https://api.zooza.app/v1/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-ZOOZA-API-KEY": "your_api_key",
  },
  body: JSON.stringify({
    login: "customer@example.com",
    verification_method: "email",
  }),
});
const data = await response.json();
```

  </TabItem>
</Tabs>

<!-- TODO: add example — /login response body for email verification -->

Store the token in a **session, cookie, or localStorage**, and include it in subsequent requests:

```
X-ZOOZA-TOKEN: <token>
```

:::note
This is a long-term token, but it may be invalidated by Zooza at any time.
:::

---

### Via PIN code

Instead of clicking a verification link, users can enter a **PIN code** (valid for 5 minutes) from the same email.

<Tabs>
  <TabItem value="curl" label="cURL">

```bash
curl -X POST https://api.zooza.app/v1/verify \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-ZOOZA-API-KEY: your_api_key" \
  -d '{
    "action": "validate_pin",
    "email": "customer@example.com",
    "pin": "123456"
  }'
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```javascript
const response = await fetch("https://api.zooza.app/v1/verify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-ZOOZA-API-KEY": "your_api_key",
  },
  body: JSON.stringify({
    action: "validate_pin",
    email: "customer@example.com",
    pin: "123456",
  }),
});
const data = await response.json();
// data.token contains the user token
```

  </TabItem>
</Tabs>

**Response:**

```json
{
  "message": "Code accepted",
  "token": "<token>"
}
```

---

### Via client secret (server-to-server)

For server-side or automated applications where no human interaction is possible. Use a **client secret** to authenticate directly.

<Tabs>
  <TabItem value="curl" label="cURL">

```bash
curl -X POST https://api.zooza.app/v1/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-ZOOZA-API-KEY: your_api_key" \
  -d '{
    "login": "admin@example.com",
    "verification_method": "client_secret",
    "client_secret": "your_client_secret"
  }'
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```javascript
const response = await fetch("https://api.zooza.app/v1/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-ZOOZA-API-KEY": "your_api_key",
  },
  body: JSON.stringify({
    login: "admin@example.com",
    verification_method: "client_secret",
    client_secret: "your_client_secret",
  }),
});
const data = await response.json();
// data.token contains the user token
```

  </TabItem>
</Tabs>

<!-- TODO: add example — /login response body for client_secret -->

:::warning Important
- The email must belong to a **valid Zooza user** with a role in the target company.
- Use a user with the **Owner role** for full access.
- Responses are always scoped to the user's role (e.g. a Lecturer only sees classes where they are assigned).
:::

To obtain a client secret, contact [Zooza support](mailto:support@zooza.com).

---

## Getting the company ID

Once you have a token, retrieve the company ID from the `/v1/user` endpoint.

<Tabs>
  <TabItem value="curl" label="cURL">

```bash
curl -X GET https://api.zooza.app/v1/user \
  -H "X-ZOOZA-API-KEY: your_api_key" \
  -H "X-ZOOZA-TOKEN: your_token"
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```javascript
const response = await fetch("https://api.zooza.app/v1/user", {
  headers: {
    "X-ZOOZA-API-KEY": "your_api_key",
    "X-ZOOZA-TOKEN": "your_token",
  },
});
const data = await response.json();
// Find your company in data.user.companies
```

  </TabItem>
</Tabs>

**Response (abbreviated):**

```json
{
  "user_valid": true,
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@example.com",
    "companies": [
      { "id": 65, "name": "Company A", "role": "member" },
      { "id": 76, "name": "Company B", "role": "owner" }
    ]
  },
  "app": {
    "application_id": 1,
    "company_id": 65,
    "type": "application"
  }
}
```

Use the `id` from the appropriate company in the `X-ZOOZA-COMPANY` header for subsequent requests.

---

## Token lifecycle

<!-- TODO: requires more content — token expiry, refresh, invalidation behavior -->

- Tokens are **long-lived** but may be invalidated by Zooza at any time.
- There is no explicit refresh mechanism — if a token becomes invalid, re-authenticate using one of the methods above.
- Store tokens securely and handle `401 Unauthorized` responses by re-initiating the login flow.
