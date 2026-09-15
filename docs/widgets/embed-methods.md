---
title: Choosing an embed method
description: How to embed a Zooza widget — a placeholder plus the loader, placed in the body only or split between head and body — and the legacy script snippet.
sidebar_position: 2
---

# Choosing an embed method

**Every Zooza widget is embedded with two pieces: a placeholder element marking where the widget renders, and the Zooza loader script. The only choice is where the loader goes.**

## The embed

The placeholder names the widget type and carries your API key:

```html
<div data-zooza-widget='registration' data-zooza-id='YOUR_API_KEY'></div>
```

The loader is a single script tag. Its URL carries your region host and the widget version:

```html
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

| Widget | `data-zooza-widget` | Loader version |
|---|---|---|
| Registration | `registration` | `v1` |
| Profile | `profile` | `v1` |
| Calendar | `calendar` | `v2` |
| Checkout | `checkout` | `v2` |
| Video | `video` | `v2` |
| Map | `map` | `v2` |

The widget mounts inside the placeholder.

## Where to put the loader

### Body only

Both pieces go in the `<body>`, at the spot where the widget should appear:

```html
<div data-zooza-widget='registration' data-zooza-id='YOUR_API_KEY'></div>
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

This is the simplest option — one copy-paste, no template changes.

### Head + body

The loader goes in the page `<head>`, the placeholder in the `<body>`:

```html
<!-- in <head> -->
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>

<!-- in <body>, where the widget should appear -->
<div data-zooza-widget='registration' data-zooza-id='YOUR_API_KEY'></div>
```

The loader is requested while the browser is still parsing the page, so the widget area fills sooner.

## Which one should I use?

| | Body only | Head + body |
|---|---|---|
| Where it goes | Placeholder and loader together in the body | Loader in `<head>`, placeholder in `<body>` |
| Starts loading | When the browser reaches the snippet | During page parse, as early as possible |
| Best for | Quickest setup, page builders that only allow body content | Pages where the widget is the main content |

If the widget sits below the fold and the page is light, the difference is not worth restructuring your template for. If the widget is the main content of the page, put the loader in the head.

## Legacy script

Before the placeholder embed, widgets were embedded with a single inline `<script data-widget-id='zooza' id='YOUR_API_KEY'>` snippet. That snippet is still shown under **Legacy script** on each widget page.

:::info Already using the legacy script?
It remains fully supported and existing embeds keep working — there is nothing you have to change. It is, however, no longer maintained or developed: new capabilities, such as [configuring a widget on the placeholder](#configuring-a-widget-on-the-placeholder), are only available with the placeholder embed. Switch when you want those, or the earlier start.
:::

## Where the region host lives

The embed needs the Zooza API URL for your region:

| Region | API URL |
|---|---|
| Europe | `https://api.zooza.app` |
| UK | `https://uk.api.zooza.app` |
| UAE | `https://asia.api.zooza.app` |

It is part of the loader `src` only — the placeholder does not need it, because the loader derives the host from its own script URL. In the legacy script it is set inside the snippet.

## Configuring a widget on the placeholder

Initialisation options can ride on the placeholder itself as `data-zooza-*` attributes, instead of a separate `window.ZOOZA` block.

The attribute name is `data-zooza-` followed by the option key with underscores written as hyphens — so the option `course_list_display` becomes `data-zooza-course-list-display`:

```html
<div data-zooza-widget='registration'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-course-list-display='grid'
     data-zooza-course-list-columns='2'></div>
```

Values are interpreted the same way as URL query parameters:

| Written as | Read as |
|---|---|
| `true` / `false` | boolean |
| `12` | number |
| `1,2,3` | array |
| anything else | string |

`data-zooza-widget`, `data-zooza-id` and `data-zooza-api-url` are reserved for the embed itself and are never treated as options.

Each widget page lists the options it accepts — see [Registration widget](./registration-widget.md), [Calendar widget](./calendar-widget.md), [Map widget](./map-widget.md), [Profile widget](./profile-widget.md), [Video widget](./video-widget.md) and [Checkout widget](./checkout-widget.md).

## Getting the snippet

The embed is generated for you in the Zooza app under `Publish > Widget`, with your API key and region already filled in.
