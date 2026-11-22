---
title: Quickstart
description: Get started with Zooza — embed a widget or make your first API call in minutes.
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AiPrompt from '@site/src/components/AiPrompt';

# Quickstart

Zooza offers two integration approaches. Choose the one that fits your needs — or use both.

---

## Widgets quickstart

### Embed your first widget (5 min)

Widgets are pre-built Zooza components that you embed directly on your website. No authentication or server code required.

#### Prerequisites

- A Zooza account with at least one programme
- An HTTPS website to embed on

#### Step 1: Get your widget API key

1. Log into the [Zooza app](https://zooza.app).
2. Go to **Team & Settings > Publish**.
3. Click on your widget name to open the detail view.
4. Copy your **API key**.

![Publish screen in Zooza](/img/publish-widgets.png)

#### Step 2: Add the embed code

Paste these two lines into your HTML page where you want the registration form to appear. Replace `YOUR_API_KEY` with your actual widget API key, and `ZOOZA_API_URL` with your [region's base URL](concepts.md#api-regions).

```html
<div data-zooza-widget='registration' data-zooza-id='YOUR_API_KEY'></div>
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

For the Europe region, `ZOOZA_API_URL` is `https://api.zooza.app`.

:::tip Load faster from the head
You can move the loader `<script>` into your page `<head>` and keep only the placeholder `<div>` in the body — the widget then starts loading earlier. See [Choosing an embed method](widgets/embed-methods.md).
:::

:::tip Other widget types
Change `data-zooza-widget` to embed a different widget, and match the loader version: `registration`, `profile`, `contact`, `checkout` and `map` use `v1`; `calendar` and `video` use `v2`.
:::

#### Step 3: Verify

Open your page in a browser. You should see a Zooza registration form displaying your programmes.

#### Next steps

- [Customise your widget](widgets/registration-widget.md) with filters and styling
- Explore other widgets: [Calendar](widgets/calendar-widget.md), [Map](widgets/map-widget.md), [Profile](widgets/profile-widget.md), [Contact](widgets/contact-widget.md)
- Learn [Zooza terminology](concepts.md)

<AiPrompt task="Embed my first Zooza widget">{`Help me embed my first Zooza widget on my website.

Read the full Zooza widget & API documentation first for context:
https://docs.zooza.online/llms-full.txt

Here is the embed snippet (registration form — for other widgets change data-zooza-widget to profile, contact, checkout or map (loader v1), or calendar or video (loader v2)):

<div data-zooza-widget='registration' data-zooza-id='YOUR_API_KEY'></div>
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>

Tasks:
1. Tell me where to place this snippet on my page. Both lines can stay together in the <body>, or the loader <script> can move into <head> so the widget starts loading earlier — recommend what fits my site.
2. Replace YOUR_API_KEY with my widget key from Team & Settings > Publish — ask me for it.
3. Set ZOOZA_API_URL to my region: Europe https://api.zooza.app, UK https://uk.api.zooza.app, UAE https://asia.api.zooza.app.`}</AiPrompt>

---

## API quickstart

### Make your first API call (10 min)

The API gives your own server programmatic access to your Zooza data, for admin tools, custom customer journeys,
data caching, syncing with other systems and more.

:::warning API keys are not widget keys
API keys are separate from widget keys, and a widget key can't call the API. API keys act on your **live data**,
so test writes carefully.
:::

#### Prerequisites

- A Zooza account with at least one programme.
- An **API key**. A company owner creates it in the Zooza app under **Developers → API keys**. You get a
  `client_id` (e.g. `zk_4768b32989b7303eac7ff30e`) and a `client_secret`. The secret is shown only once.
- cURL or Node.js 18+.

Keep the secret on your server, in an environment variable or a git-ignored `.env` file:

```bash
ZOOZA_CLIENT_ID=zk_…
ZOOZA_CLIENT_SECRET=…            # shown once when the key was created
ZOOZA_OWNER_EMAIL=owner@yourcompany.example
```

#### Step 1: Get an access token

Exchange the key for a token. The `email` must belong to an owner of the key's company, and the token acts as that
owner.

<Tabs>
  <TabItem value="curl" label="cURL">

```bash
curl -X POST https://api.zooza.app/v3/token \
  -H "Content-Type: application/json" \
  -d "{
    \"grant_type\": \"client_credentials\",
    \"client_id\": \"$ZOOZA_CLIENT_ID\",
    \"client_secret\": \"$ZOOZA_CLIENT_SECRET\",
    \"email\": \"$ZOOZA_OWNER_EMAIL\"
  }"
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```javascript
const response = await fetch("https://api.zooza.app/v3/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "client_credentials",
    client_id: process.env.ZOOZA_CLIENT_ID,
    client_secret: process.env.ZOOZA_CLIENT_SECRET,
    email: process.env.ZOOZA_OWNER_EMAIL,
  }),
});
const { access_token, expires_in } = await response.json();
```

  </TabItem>
</Tabs>

The response holds an `access_token`, valid for `expires_in` seconds (one hour). Reuse it until it expires, and don't
request a new token for every call.

#### Step 2: Check what your key can do

`GET /v3/me` costs nothing. It shows your key's access groups, your company's remaining budget and every operation the key may call.

<Tabs>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.zooza.app/v3/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```javascript
const me = await fetch("https://api.zooza.app/v3/me", {
  headers: { Authorization: `Bearer ${access_token}` },
}).then((r) => r.json());
console.log(me.groups, me.points);
```

  </TabItem>
</Tabs>

#### Step 3: List your programmes

<Tabs>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.zooza.app/v3/courses \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```javascript
const courses = await fetch("https://api.zooza.app/v3/courses", {
  headers: { Authorization: `Bearer ${access_token}` },
}).then((r) => r.json());
console.log(courses);
```

  </TabItem>
</Tabs>

You should see a list of your programmes (called "courses" in the API). Outside Europe, use your region's host:
`https://uk.api.zooza.app/v3` or `https://asia.api.zooza.app/v3`.

#### Next steps

- [Getting started with the API](api/getting-started.md): the full walk-through, with Python too
- [Authentication](api/authentication.md): tokens, their lifetime and what to check when a token is refused
- [Access and rate limits](api/access-and-rate-limits.md): what your key may call, and its budget
- [API reference](/api/reference): every operation
- [Concepts and glossary](concepts.md): Zooza terminology

<AiPrompt task="Build a Zooza API integration">{`Help me build an integration against the Zooza API.

Read the setup guide for coding agents first. It covers authentication, the first call, and the rules for writing data:
https://docs.zooza.online/agent-setup.md

Full documentation: https://docs.zooza.online/llms-full.txt

What I want to build:
[describe your use case, e.g. "a script that lists all my programmes and exports enrolled clients to CSV", or "sync new bookings into my CRM"]

Tasks:
1. Write the token step (POST /v3/token) in [my language: Node.js / Python / PHP / cURL], reading ZOOZA_CLIENT_ID, ZOOZA_CLIENT_SECRET and ZOOZA_OWNER_EMAIL from a git-ignored .env file.
2. Implement the use case above with the operations from the reference.
3. Cache the token until it expires, and handle 401 and 429 (Retry-After) gracefully.

My region is [EU / UK / ASIA]. Never ask me to paste my client secret into this chat, and ask me before writing any code that creates or changes data.`}</AiPrompt>
