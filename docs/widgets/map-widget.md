---
title: Map widget
description: The Zooza map widget — your venues as pins on a map, with the classes at each venue listed below it, ordered by travel time.
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AiPrompt from '@site/src/components/AiPrompt';

# Map widget

**Let customers find a class near them. The map widget shows your venues as pins on a map. Below the map it lists the classes at the venues in view, grouped by venue and ordered by estimated travel time. Each class links to the [registration widget](./registration-widget.md) to book.**

:::info Replaces the v2 map
This widget is loaded from `/widgets/v1/` and replaces the [legacy v2 map widget](./deprecated/map-widget-v2.md). Existing v2 embeds keep working, but are no longer developed. See [Migrating from the v2 map](#migrating-from-the-v2-map).
:::

:::tip See it in practice
- [Map design variants](/examples/location-map#design-variants)
- [Branch and franchise location map](/examples/location-map)
:::

## Installation

### WordPress

The WordPress plugin's map page setting and the `[zooza type="map"]` shortcode still embed the [legacy v2 map](./deprecated/map-widget-v2.md). To use this widget on WordPress, paste the [embed code](#embed-code) into a **Custom HTML** block on the page instead.

### Embed code

Embed this widget with a placeholder element and the Zooza loader. The loader can sit in the `<body>` right after the placeholder, or in the `<head>` so the widget starts loading earlier. See [Choosing an embed method](./embed-methods.md) if you are not sure which one to use.

| Placeholder | Description | Example Value |
|---|---|---|
| `YOUR_API_KEY` | Replace with the API key found in the application under `Publish > Widget`. | `abc123xyz` |
| `ZOOZA_API_URL` | Replace with the Zooza API URL for your region: Europe: `https://api.zooza.app`, UK: `https://uk.api.zooza.app`, UAE: `https://asia.api.zooza.app` | `https://api.zooza.app` |

<Tabs groupId="embed-method">
  <TabItem value="body" label="Body only" default>

Place the placeholder and the loader in the `<body>` of your page, where you want the map to appear.

```html
<div data-zooza-widget='map' data-zooza-id='YOUR_API_KEY'></div>
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

  </TabItem>
  <TabItem value="head-body" label="Head + body">

Place the loader in the `<head>` of your page:

```html
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

Then place the placeholder in the `<body>`, where you want the map to appear:

```html
<div data-zooza-widget='map' data-zooza-id='YOUR_API_KEY'></div>
```

  </TabItem>
</Tabs>

The loader works out the API host for your region from its own `src`. In the rare case you need a different host, set it with `data-zooza-api-url` on the placeholder.

<AiPrompt task="Embed the map widget into my site">{`I'm adding the Zooza map widget to my website.

Read the full Zooza widget & API documentation first for context:
https://docs.zooza.online/llms-full.txt

Here is the embed snippet I need to install:

<div data-zooza-widget='map' data-zooza-id='YOUR_API_KEY'></div>
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>

Tasks:
1. Tell me exactly where in my page to place this snippet. Both lines can stay together in the <body>, or the loader <script> can move into <head> so the widget starts loading earlier — recommend what fits my site.
2. Replace YOUR_API_KEY with the key from Publish > Widget in my Zooza app — ask me for it.
3. Set ZOOZA_API_URL to my region: Europe https://api.zooza.app, UK https://uk.api.zooza.app, UAE https://asia.api.zooza.app.
4. If I want the map to open on a particular area instead of showing all my venues, add a window.ZOOZA.widgets.map.map_view block before the loader.`}</AiPrompt>

## How the map works

1. **Venues.** Every venue that has upcoming classes and a location on the map is shown as a pin. The map opens fitted to all pins, unless you set an [opening view](#map_view).
2. **Search.** Customers look for a class near them by typing an address in the search field, or with the **use my location** button. Both are switched on in the [settings](#settings).
3. **Classes in view.** Below the map, the widget lists the classes at the venues currently visible on the map. Panning or zooming the map updates the list. Classes are grouped by venue, and the venues are ordered by estimated travel time from the searched address or the customer's location.
4. **Class cards.** Each class shows its trainer, time, capacity (or that it is full) and, if enabled, its price. The select link takes the customer to the [registration widget](./registration-widget.md) to book that class.
5. **Pins.** Clicking a pin highlights that venue in the list and opens a bubble with the venue's details, a link to book, and, if enabled, a **Get directions** button that opens the venue in the customer's map app.

The list can be [switched off](#show_schedules) if you only want the map with its pins and bubbles.

### Distance units

Companies in the United Kingdom, the United States, Myanmar and Liberia see distances in **miles**: the radius filter, the radius circle on the map and the travel distances. Everyone else sees kilometres.

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Map`. They apply to every page the map widget is on and cannot be set on the placeholder or from JavaScript.

### URL

This will let Zooza know where your widget resides so that it can [redirect your customers](index.md#importance-of-a-url) to it when necessary.

### Show price

Shows or hides the price on each class in the list.

### Use age filter

Shows a dropdown that narrows the list to classes for a chosen age range. The age ranges can be [replaced from JavaScript](#age_range). The age filter is not shown when the [class list is switched off](#show_schedules).

### Search by ZIP code

Shows the address search field, which also accepts a ZIP code. Suggestions are limited to your company's country.

### Show radius filter

Shows a slider that narrows the search area by distance, from 0 to 50 [km or miles](#distance-units), and draws the radius as a circle on the map.

### Show use current location

Shows a button that uses the customer's current location as the search point. If the browser denies access to the location, the widget shows a message instead.

### Show navigate button

Shows a **Get directions** button in the bubble that opens when a customer clicks a pin. It opens the venue in the customer's default map app.

### Navigate button label

Changes the label of the **Get directions** button.

### Show schedules list

Shows the list of classes below the map. On by default. Pages can override it with [`show_schedules`](#show_schedules).

### Language

The language of the widget.

### Use CSS

Loads the default Zooza styling. By default this is turned on. The default styling is deliberately minimal: the map inherits your website's font and colours, and any CSS rule on your website overrides it. See [Styling](#styling).

You can download the default css from this URL:

`ZOOZA_API_URL/widgets/v1/css/?widget=YOUR_API_KEY&type=map`

## Initialisation options

These options are set per page, in a `window.ZOOZA.widgets.map` block placed before the loader. See [Setting options from JavaScript](./embed-methods.md#setting-options-from-javascript) for how the `widgets` namespace works.

### `map_view`

_Type: Object — `{ center: { lat, lng }, zoom }`_

Sets where the map **opens**, instead of fitting all pins. Customers can still pan, zoom and search. This option can only be set from JavaScript.

```html
<script>
window.ZOOZA = {
    widgets: {
        map: {
            map_view: { center: { lat: 48.1486, lng: 17.1077 }, zoom: 13 }
        }
    }
};
</script>
```

| Key | Description |
|---|---|
| `center` | `lat` (−90 to 90) and `lng` (−180 to 180) of the point the map opens on. It is also where travel times and the radius circle are measured from until the customer searches. |
| `zoom` | Google Maps zoom level, 0 to 22. |

Either key can be used on its own. `center` alone opens the map there at zoom 12; `zoom` alone keeps the automatic centre at that zoom. If any value is invalid, the whole option is ignored and the map fits all pins.

### `show_schedules`

_Type: Boolean — default `true`_

Set to `false` to hide the class list under the map, leaving only the pins and their bubbles. The [age filter](#use-age-filter) is hidden too, because it only narrows the list. This overrides the [Show schedules list](#show-schedules-list) setting for this page.

<Tabs groupId="config-surface">
  <TabItem value="js" label="JavaScript" default>

```html
<script>
window.ZOOZA = {
    widgets: {
        map: {
            show_schedules: false
        }
    }
};
</script>
```

  </TabItem>
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='map'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-show-schedules='false'></div>
```

  </TabItem>
</Tabs>

### `age_range`

_Type: Array of `{ value: 'FROM-TO' }`_

Replaces the age ranges offered in the [age filter](#use-age-filter). Each range is written as `from-to` in **months**. The labels, such as "6 months to 1 year", are generated by the widget in the widget's language. This option can only be set from JavaScript.

```html
<script>
window.ZOOZA = {
    widgets: {
        map: {
            age_range: [
                { value: '6-12' },
                { value: '12-36' },
                { value: '36-72' }
            ]
        }
    }
};
</script>
```

Without it, the widget offers its built-in age ranges.

## URL parameters

The map writes its filters into the URL of the page as customers use them, so a link to the page restores the same search. Other parameters in your page URL are kept.

| Parameter | Description | Example Value |
|---|---|---|
| `search` | The searched address. | `Bratislava` |
| `age_from` | Start of the chosen age range, in months. | `12` |
| `age_to` | End of the chosen age range, in months. | `36` |

```plaintext
https://sample-site.com/find-a-class?search=Bratislava&age_from=12&age_to=36
```

You can link to the page with these parameters to open the map with a search already applied. `age_from` and `age_to` are only applied when they match one of the offered age ranges.

## Migrating from the v2 map

To move a page from the [legacy v2 map](./deprecated/map-widget-v2.md) to this widget:

1. Replace the embed code on the page with the [v1 embed code](#embed-code). If you already use the placeholder embed, it is enough to change `/widgets/v2/loader.js` to `/widgets/v1/loader.js`.
2. Keep your settings — the v1 map uses the same `Publish > Widget > Map` settings, so there is nothing to set up again.
3. Rewrite your custom CSS. The v1 map uses [new class names](#class-names), so CSS written for the v2 map (the `zooza_map`, `zooza_filters`, `zooza_results_container` and similar classes) no longer applies.
4. On WordPress, replace the `[zooza type="map"]` shortcode with the embed code in a **Custom HTML** block, and clear the map page in the plugin settings so the plugin does not add the v2 map as well.

## Styling

The map widget renders directly into your page (no iframe), and its default styling is built to be overridden:

- Every default rule has zero specificity, so any rule in your stylesheet wins — no `!important` needed.
- By default the map inherits the font and text colour of the surrounding page.

### Theme variables

The quickest way to match your brand is to set CSS custom properties on `.zooza-map-widget`:

```css
.zooza-map-widget {
    --zooza-accent: #FA6900;
    --zooza-pin-color: #3aa39d;
    --zooza-border-color: #d0d0d0;
    --zooza-radius: 5px;
    --zooza-font-family: 'DM Sans', sans-serif;
}
```

The map uses the same theme variables as the [contact widget](./contact-widget.md#theme-variables), for example `--zooza-font-family`, `--zooza-accent`, `--zooza-border-color`, `--zooza-radius`, `--zooza-gap` and `--zooza-max-width`. It adds one of its own:

| Variable | Default | Purpose |
|---|---|---|
| `--zooza-pin-color` | `var(--zooza-accent)` | Colour of the ring around each map pin. |

### Class names

Every element carries two classes: a shared one that is the same in all Zooza widgets built this way, and one scoped to the map widget. Variants add a `__variant` suffix. Use the `zooza-map-*` classes to style only the map.

| Element | Classes |
|---|---|
| Widget root | `.zooza-widget` `.zooza-map-widget` |
| Filter bar | `.zooza-filters` `.zooza-map-filters` |
| Filter field | `.zooza-field` `.zooza-map-field`, e.g. `.zooza-map-field__search`, `__location`, `__age`, `__radius` |
| Address search | `.zooza-input__search` `.zooza-map-input__search` |
| Age dropdown | `.zooza-select__age` `.zooza-map-select__age` |
| Radius slider | `.zooza-range__radius` `.zooza-map-range__radius`, with its value in `.zooza-map-range-value__radius` |
| Buttons | `.zooza-button` `.zooza-map-button`, e.g. `.zooza-map-button__location`, `__navigate` |
| Map area | `.zooza-canvas` `.zooza-map-canvas` |
| Pin | `.zooza-pin` `.zooza-map-pin` |
| Pin bubble | `.zooza-bubble` `.zooza-map-bubble`, with `.zooza-map-bubble-title`, `-address`, `-text`, `-link` |
| Class list | `.zooza-results` `.zooza-map-results` |
| Venue group | `.zooza-place` `.zooza-map-place`, with `.zooza-map-place-title`, `-distance`, `-schedules`; the clicked venue adds `.zooza-map-place__highlighted` |
| Class card | `.zooza-schedule` `.zooza-map-schedule`, with `.zooza-map-schedule-row`, `-key`, `-value`, `-action` |
| Trainer photo | `.zooza-avatar` `.zooza-map-avatar` |
| Message | `.zooza-message` `.zooza-map-message`, e.g. `.zooza-map-message__error` |

The widget root also has a `data-status` attribute — `loading`, `ready` or `error` — which you can use to style each state:

```css
.zooza-map-widget[data-status='loading'] {
    min-height: 400px;
}
```

<AiPrompt task="Style the map widget to match my site">{`I've embedded the Zooza map widget and now I want it to match my site's existing design.

Read the Zooza widget documentation for the map widget's theme variables and class names:
https://docs.zooza.online/llms-full.txt

Tasks:
1. Inspect my site's current design tokens — primary colour, fonts, border radius, spacing — and how my existing forms and buttons look.
2. Write CSS that sets the --zooza-* custom properties (including --zooza-pin-color) on .zooza-map-widget to match, and add rules on the zooza-map-* classes only where the variables are not enough.
3. Do not use !important.
4. Keep it accessible (visible focus, readable error colour) and responsive on mobile.

My brand: [describe your colours and fonts here, or point me at your stylesheet].`}</AiPrompt>
