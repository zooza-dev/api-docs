---
title: Choosing an embed method
description: The two ways to embed a Zooza widget — the direct body snippet and the head/body split loader — and when to use each.
sidebar_position: 2
---

# Choosing an embed method

**Every Zooza widget can be embedded in two ways. Both are fully supported, and neither is deprecated — pick the one that fits your page.**

## The two methods

### Direct embed

A single `<script>` snippet placed in the `<body>` of your page, at the spot where the widget should appear. The script injects the widget bundle and renders it in place.

This is the simplest option when a page carries one widget, and it is what the Zooza app hands you by default.

### Head + body split

Two parts:

- a small **loader** in the page `<head>`, and
- a **placeholder** element in the `<body>` marking where the widget renders:

```html
<div data-zooza-widget='registration' data-zooza-id='YOUR_API_KEY'></div>
```

The loader starts fetching while the page is still being parsed, and the widget mounts inside the placeholder.

## Which one should I use?

| | Direct embed | Head + body |
|---|---|---|
| Where it goes | One snippet in the body | Loader in `<head>`, placeholder in `<body>` |
| Starts loading | When the DOM is ready | During page parse, earlier |
| Renders | In place of the snippet | Inside the placeholder element |
| Best for | A single widget, quickest setup | Pages where the widget area should fill as early as possible |

The practical difference is **when loading starts**. The head loader is requested while the browser is still parsing the page, so on a heavy page the widget area fills noticeably sooner. The direct embed cannot start until its own snippet has been parsed.

If the widget sits below the fold and the page is light, the difference is not worth restructuring your template for. If the widget is the main content of the page, the head/body split is the better choice.

:::info Already embedded with the direct method?
There is nothing to migrate. The direct embed stays valid and keeps working. Switch only if you want the earlier start.
:::

## Where the region host lives

Both methods need the Zooza API URL for your region:

| Region | API URL |
|---|---|
| Europe | `https://api.zooza.app` |
| UK | `https://uk.api.zooza.app` |
| UAE | `https://asia.api.zooza.app` |

In the direct embed it is set inside the snippet. In the head/body split it is part of the loader `src` only — the placeholder does not need it, because the loader derives the host from its own script URL.

## Configuring a widget on the placeholder

With the head/body method, initialisation options can ride on the placeholder itself as `data-zooza-*` attributes, instead of a separate `window.ZOOZA` block.

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

Both snippets are generated for you in the Zooza app under `Publish > Widget`, with your API key and region already filled in.
