---
title: Zooza API Authentication
description: Tutorial on how to approach authorization and authentication to Zooza API
authors:
  - Martin Rapavý
date: 2025-10-05
updated: 2025-12-05
---

# How to connect to the API

## Basic approach to getting started with authenticated API calls

In general, **Zooza recognizes two types of applications**:

- **Widget**
- **Application**

The type of application limits what data you can obtain from the API and what endpoints are available.

---

## Widget application type

- All data you request is limited to **a customer**.
  In other words, the data you see is represented from the perspective of a single company or that company's customer.
- Most of the endpoints are **not available** to use (will trigger `unauthorized` response).

---

## Application type

- Majority of endpoints require **valid headers** in each request:
  - `X-ZOOZA-TOKEN`
  - `X-ZOOZA-API-KEY`
  - `X-ZOOZA-COMPANY-ID`

---

## Which application type to use?

- If you want to build an application that works only with public data or with customer's data → **use Widget**.  
- If you want to build an administration application or an application that will be doing administrative operations (manage attendance, courses, places, payments, etc.) → **use Application**.

---

## Login approach

Zooza uses **passwordless login**. Instead of relying on a password, the second factor is provided via an alternative method.

For all requests that handle sensitive data, you'll need these three headers:

- `X-ZOOZA-API-KEY` — Required to identify the application  
- `X-ZOOZA-TOKEN` — Required to identify current user  
- `X-ZOOZA-COMPANY-ID` — Required to downscope results for a specific company that current user has a role with  

> **Note:** `X-ZOOZA-COMPANY-ID` is not required for applications of type **Widget**.  
> For all other types, it is required in almost all API calls.

---

## Obtaining API key

1. Log into the main application.  
2. Head to **Settings > Registration forms**.  
   - There, you'll see the API key for your widgets.  
3. If you need to create an application of type **Application**, please contact our customer support.

---

## Obtaining user token via email

This is the most common way to obtain a valid token.  

1. Send a **POST request** to the API with an email passed in the body.  
2. Zooza will send a verification email to the user.  
3. That email contains a link with a query parameter `key` (the token).

**Example verification link:**

```
https://yoursite.com?key=123
```

Store the token in **session, cookie, localStorage, etc.**, and include this header in each request:

```
X-ZOOZA-TOKEN: <token>
```

> **Note:** This is a long-term token, but it may be invalidated by Zooza at any time.

---

## Obtaining user token via PIN code

Instead of the verification link, you can also use a **PIN code** (valid for 5 minutes) sent in the same email.

**Request:**

```http
POST /v1/verify HTTP/1.1
Host: api.zooza.app
Content-Type: application/json
Accept: application/json
X-ZOOZA-API-KEY: <api_key>

{
  "action": "validate_pin",
  "email": "<email>",
  "pin": "<pin>"
}
```

**Response:**

```json
{
  "message": "Code accepted",
  "token": "<token>"
}
```

On successful response, you'll get:  
- `message` — Human-readable response
- `token` — The actual token you can use in API requests  

---

## Obtaining user token without human interaction

For server-side or automated applications, use **client secret**.

**Request:**

```http
POST /v1/login HTTP/1.1
Host: api.zooza.app
Content-Type: application/json
Accept: application/json
X-ZOOZA-API-KEY: <api_key>

{
  "login": "<email>",
  "verification_method": "client_secret",
  "client_secret": "<client_secret>"
}
```

- The email must be a **valid Zooza user** with a role in the target company.  
- It is recommended to use a user with the **Owner role** for full access.  
- Responses are always scoped to the user’s role (e.g., a Lecturer only sees schedules where they are assigned).  

To obtain a **client secret**, contact Zooza support.

---

## Getting the Company ID

The last required element is the **Company ID**.

**Request:**

```http
GET /v1/user HTTP/1.1
Host: api.zooza.app
X-ZOOZA-API-KEY: <api_key>
X-ZOOZA-COMPANY: <company_id>
X-ZOOZA-TOKEN: <user_token>
```

The response returns:  
- A valid company list  
- Useful information about the current user

```json
{
    "user_valid": true,
    "user": {
        "id": 1,
        "first_name": "John",
        "last_name": "Smith",
        "email": "[redacted]",
        "phone": "[redacted]",
        "role": "member",
        "company_id": 65,
        "avatar": null,
        "email_rejected": false,
        "email_verified": false,
        "phone_verified": true,
        "billing_periods": [],
        "user_fields": {
            "id": 3929,
            "marketing_messages": false
        },
        "permissions": [
            { "permission": "get_course", "user_can": true },
            { "permission": "get_trainers", "user_can": true },
            { "permission": "edit_course", "user_can": true },
            { "permission": "add_course", "user_can": false }
        ],
        "companies": [
            { "id": 65, "name": "Company A", "role": "member" },
            { "id": 76, "name": "Company B", "role": "owner" }
        ],
        "onboarding_url": "",
        "app_usage": {
            "registrations": false,
            "payments": true,
            "courses": true
        }
    },
    "agreements": [],
    "app": {
        "application_id": 1,
        "company_id": 65,
        "type": "application",
        "company_name": "Company A"
    },
    "branding": "[redacted]",
    "company": {
        "name": "Company A",
        "email": "[redacted]",
        "online_payments": true,
        "region": "en",
        "language": "en",
        "currency": "EUR"
    }
}
```