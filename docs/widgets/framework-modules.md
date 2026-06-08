---
title: Framework modules (npm)
description: Install Zooza widgets as npm packages — React, Vue, Svelte, Web Components, or vanilla JS. SSR-safe, TypeScript-typed, multiple widgets per page.
sidebar_position: 8
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Framework modules (npm)

**If your website is a JavaScript application — React, Next.js, Vue, Svelte, or anything that builds with npm — you don't have to paste the raw `<script>` [embed snippet](registration-widget.md#embed-code). Install the matching `@zooza/widgets-*` package and render the widget as a component.**

The packages reproduce the official embed mechanism 1:1 and add what the snippet lacks: unique ids (so you can place multiple widgets on one page), clean unmount, server-side-rendering safety, TypeScript types, and a Zooza-branded loading placeholder. The remote widget script still renders the actual UI — the packages never reimplement it.

:::tip Where the app generates this for you
In the Zooza app, go to `Publish > Widget > [Widget type]`. The install command and the framework snippet shown there match this page exactly — pick your package manager and framework and copy.
:::

## Packages

| Package | For | Component / usage |
|---|---|---|
| `@zooza/widgets-react` | React, Next.js (App Router ready) | `<ZoozaWidget type="registration" />` |
| `@zooza/widgets-vue` | Vue 3, Nuxt | `<ZoozaWidget type="calendar" />` |
| `@zooza/widgets-svelte` | Svelte 3/4/5, SvelteKit | `<div use:zoozaWidget={{ type: 'map' }} />` |
| `@zooza/widgets-wc` | Plain HTML, WordPress, Angular, anything | `<zooza-widget type="checkout">` |
| `@zooza/widgets-core` | Vanilla JS / any framework | `loadWidget({ type, container })` |

:::info Angular & Qwik
Use `@zooza/widgets-wc` — custom elements work natively in both. Dedicated wrappers are planned.
:::

## Setup — API key & region

Every widget needs your **company API key** — the same value you find under `Publish > Widget` (it is the `id` from the classic embed snippet, e.g. `abc123xyz`). The key is a **public identifier**: it ships in the page HTML to every visitor, so keeping it in a `VITE_*` / `NEXT_PUBLIC_*` env var is configuration hygiene, not a secret. Never put real secrets in widget config.

Set it once at app startup. `initZooza` is re-exported by every package:

```ts
import { initZooza } from '@zooza/widgets-react'; // or -vue, -svelte, -wc, -core

initZooza({
  apiKey: import.meta.env.VITE_ZOOZA_API_KEY, // Next.js: process.env.NEXT_PUBLIC_ZOOZA_API_KEY
  region: 'uk',                               // optional — omit for the default (Europe) region
});
```

Every widget on the page then works without per-widget config. Per-widget props/attributes override the global config when needed.

### Regions

The API base is **page-global** — one region per page. Regions resolve to `https://{region}.api.zooza.app`:

| Region | `region` value | Resolved API URL |
|---|---|---|
| Europe (default) | _omit_ or `'default'` | `https://api.zooza.app` |
| UK | `'uk'` | `https://uk.api.zooza.app` |
| UAE / Asia | `'asia'` | `https://asia.api.zooza.app` |

Any future region string works without a package update. For test or self-hosted environments, pass a full `apiUrl` instead — it beats `region`.

## Quick start

<Tabs groupId="framework">
<TabItem value="react" label="React / Next.js" default>

```bash
npm install @zooza/widgets-react
```

```tsx
import { initZooza, ZoozaWidget } from '@zooza/widgets-react';

initZooza({ apiKey: 'YOUR_API_KEY' });

export default function Page() {
  return <ZoozaWidget type="registration" />;
}
```

Works directly inside a Next.js Server Component page — the component itself is the `"use client"` boundary, no extra wrapper needed. In Next.js read the key from `process.env.NEXT_PUBLIC_ZOOZA_API_KEY` (via `initZooza` in a client root component, or pass it as the `apiKey` prop).

</TabItem>
<TabItem value="vue" label="Vue 3 / Nuxt">

```bash
npm install @zooza/widgets-vue
```

```vue
<script setup>
import { initZooza, ZoozaWidget } from '@zooza/widgets-vue';

initZooza({ apiKey: 'YOUR_API_KEY' });
</script>

<template>
  <ZoozaWidget type="registration" />
</template>
```

</TabItem>
<TabItem value="svelte" label="Svelte / SvelteKit">

```bash
npm install @zooza/widgets-svelte
```

```svelte
<script>
  import { initZooza, zoozaWidget } from '@zooza/widgets-svelte';

  initZooza({ apiKey: 'YOUR_API_KEY' });
</script>

<div use:zoozaWidget={{ type: 'registration' }}></div>
```

</TabItem>
<TabItem value="wc" label="Web Components">

As a module bundle:

```bash
npm install @zooza/widgets-wc
```

```js
// JavaScript — run once at startup
import '@zooza/widgets-wc/register';
import { initZooza } from '@zooza/widgets-wc';

initZooza({ apiKey: 'YOUR_API_KEY' });
```

```html
<!-- HTML — anywhere on the page -->
<zooza-widget type="registration"></zooza-widget>
```

Or straight from a CDN, no build step:

```html
<script src="https://unpkg.com/@zooza/widgets-wc"></script>
<script>ZoozaWidgets.initZooza({ apiKey: 'YOUR_API_KEY' });</script>

<zooza-widget type="registration"></zooza-widget>
```

</TabItem>
<TabItem value="core" label="Vanilla JS (core)">

```bash
npm install @zooza/widgets-core
```

```js
import { initZooza, loadWidget } from '@zooza/widgets-core';

initZooza({ apiKey: 'YOUR_API_KEY' });

const handle = loadWidget({
  type: 'registration',
  container: document.querySelector('#zooza'),
});

// handle.destroy() removes the widget
```

</TabItem>
</Tabs>

:::warning One widget per page
The same rule as the classic embed applies: **only one widget per page**. You can mix the `type` freely, but don't mount two widgets on the same page.
:::

## Widget types & versions

The `type` prop selects which widget renders. Each type has an official default version — you normally don't set `version` yourself.

| `type` | Default version | Page |
|---|---|---|
| `registration` | v1 | [Registration/Booking widget](registration-widget.md) |
| `profile` | v1 | [Profile widget](profile-widget.md) |
| `calendar` | v2 | [Calendar widget](calendar-widget.md) |
| `video` | v2 | [Video widget](video-widget.md) |
| `checkout` | v2 | [Checkout widget](checkout-widget.md) |
| `map` | v2 | [Map widget](map-widget.md) |

All the per-widget settings documented on those pages (URL, availability, filters, callbacks, …) apply the same way — set them in `Publish > Widget`, or override per instance via props/attributes.

## Options

Pass any of these as a prop (React/Vue), an attribute (Web Components), or a field in the `use:` / `loadWidget` config object (Svelte/core). Names are consistent across packages except where noted.

| Option | Default | Description |
|---|---|---|
| `type` | — (required) | Widget to embed (see table above) |
| `apiKey` | from `initZooza` | Company API key (public) — required here or via `initZooza` |
| `version` | per-type default | Widget API version override (`v1` / `v2`) |
| `region` | from `initZooza`, else default | API region → `https://{region}.api.zooza.app` |
| `apiUrl` | region-derived | Full API base URL override (beats `region`) |
| `widgetId` | `zooza` | `data-widget-id` value — constant, leave alone |
| `refUrl` | `location.href` | Referrer URL reported to the widget API (named `ref` in Svelte/Web Components/core; `ref` is reserved in React/Vue) |
| `placeholder` | `true` | Show the Zooza-branded loading placeholder |
| `onLoad` / `onError` | — | Widget script lifecycle callbacks |

Everything else passed to the React/Vue component is forwarded to the container `<div>`.

## SSR & React StrictMode notes

- All packages are SSR-safe and `"use client"`-marked — they work in CRA, Vite, Remix, and Next.js (Pages + App Router) without configuration.
- In React 18 `StrictMode` (dev only) the widget mounts twice by design — harmless, the first instance is destroyed immediately.

## How it works

The packages reproduce the official Zooza embed snippet exactly:

1. set `data-zooza-api-url` on `<body>`,
2. insert an embedder `<script>` whose `id` **is your company API key**, plus `data-version` and `data-widget-id` attributes,
3. insert the async widget script `{apiUrl}/widgets/{version}/?type={type}&ref={ref}` before the embedder.

The remote script identifies your company by reading the embedder's `id` from the DOM — the key is never in the script URL — then renders the actual widget UI. See [Importance of a URL](index.md#importance-of-a-url) for how the configured widget URL ties instances together.
