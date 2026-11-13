---
title: Branch and franchise location map
description: Show every venue, branch or franchise location of your kids' activity business on a map with postcode search, radius filter and the classes running at each venue — using the Zooza map widget, with no layout shift while it loads.
sidebar_label: Location map
---

import AiPrompt from '@site/src/components/AiPrompt';

# Branch and franchise location map

## The problem

Once a business runs classes in more than a handful of venues, *"Is there a class near me?"* becomes the most common question. Parents want to type a postcode, see the nearest venues, and go straight to a class that suits their child. Franchise networks need the same thing across many operators.

## What you'd have to build yourself

- A venue database with addresses and coordinates, kept in sync with your timetable.
- Geocoding for postcodes and addresses, distance calculation and a radius filter.
- A map with pins, a venue detail panel, and the list of classes at each venue with live availability.
- Links from each class into booking, plus "navigate here" for the parent's maps app.

The Zooza map widget covers all of this from the venues and classes you already manage in Zooza.

## How it looks

![Location map with postcode search, radius filter, venue pins and a venue panel listing its classes](/img/examples/location-map.png)

Little Movers' "Find a class" page has a short intro, then a full-width map with a pin for each venue. A search field accepts a postcode or address, and a slider narrows the radius. Below the map, the classes at the venues in view are listed by venue, nearest first. Selecting a pin highlights that venue and opens a bubble with its address, a booking link and a **Get directions** button. Each class links to the booking form.

## The code

```html
<section class="lm-locations">
  <p class="lm-eyebrow">Locations</p>
  <h1>Find your nearest class</h1>
  <p>We run classes in twelve towns, with new venues every term. Search by postcode or browse the map.</p>

  <div class="lm-map-host">
    <div class="lm-map-skeleton" aria-hidden="true">Loading map…</div>
    <div data-zooza-widget="map" data-zooza-id="YOUR_API_KEY"></div>
  </div>
</section>

<script async src="https://uk.api.zooza.app/widgets/v1/loader.js"></script>
```

```css
.lm-map-host {
  position: relative;
  min-height: 560px;            /* reserve space: no layout shift while loading */
  border-radius: 24px;
  overflow: hidden;
  background: #f3eef8;
}
.lm-map-skeleton {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #5b2a86;
  font-weight: 700;
  background: repeating-linear-gradient( 135deg, #f3eef8 0 24px, #ece4f4 24px 48px );
}
/* Hide the skeleton once the map has finished loading (or failed) */
.lm-map-host:has( .zooza-map-widget:not( [data-status="loading"] ) ) .lm-map-skeleton {
  display: none;
}

/* Brand the map through its theme variables */
.lm-map-host .zooza-map-widget {
  --zooza-accent: #5b2a86;
  --zooza-pin-color: #ff7a59;
  --zooza-radius: 14px;
  --zooza-max-width: none;
}
```

The map widget uses the same v1 loader (`/widgets/v1/loader.js`) as the registration widget. Little Movers operates in the UK, so the loader comes from `https://uk.api.zooza.app`, and the map shows distances in miles automatically. Use your own region's URL.

### Settings in the Zooza admin

The map's behaviour is configured in **Publish > Widget > Map**, not in code:

| Setting | Little Movers uses it for |
|---|---|
| [Search by ZIP code](../widgets/map-widget.md#search-by-zip-code) | Postcode search alongside addresses |
| [Show radius filter](../widgets/map-widget.md#show-radius-filter) | "Within 10 miles" slider |
| [Show use current location](../widgets/map-widget.md#show-use-current-location) | One-tap "near me" on phones |
| [Use age filter](../widgets/map-widget.md#use-age-filter) | Only classes for the child's age |
| [Show navigate button](../widgets/map-widget.md#show-navigate-button) | Opens the parent's maps app |
| [URL](../widgets/map-widget.md#url) | Where the map lives, so links come back to it |

Clicking a class takes the parent to the [registration widget](../widgets/registration-widget.md), so set its URL in the admin too.

### Why it's built this way

- **Reserved height and a skeleton** keep the page from jumping when the map appears. That helps both parents and Core Web Vitals (CLS).
- **The skeleton sits outside the placeholder**, so the widget never has to deal with your markup. It is hidden by the widget's documented [`data-status`](../widgets/map-widget.md#class-names) attribute, with no script.
- **Branding goes through [theme variables](../widgets/map-widget.md#theme-variables)** on `.zooza-map-widget`, so it survives widget updates without overriding internal rules.
- **Venues come from Zooza**, so opening a new venue or closing one updates the map without touching the website.

## Design variants

The same map widget fits very different sites. The widget draws the map and, after a venue is selected, its details and classes below the map. The page around it is yours.

![Little Movers: rounded map with a pill-shaped postcode search floating over it, and venue cards with distance below](/img/examples/map-stacked-movers.png)

**Stacked (Little Movers).** Rounded map with the search on top. Below it, your own three "nearest venue" cards with links to venue landing pages.

![Studio Nord: square-cornered monochrome map on the left and a hairline list of three studios with their instruments on the right](/img/examples/map-split-nord.png)

**Split (Studio Nord).** Map on the left, and on the right your own list of studios (from your CMS or the [places API](/api/reference/get-places-that-belong-to-a-company)) with what is taught at each. Muted colours and no rounded corners.

![Splash Academy on a phone: map on the top part of the screen with Near me search and age chips, and the selected pool's details, lessons and a Navigate button below](/img/examples/map-mobile-splash.png)

**Mobile (Splash Academy).** On phones the map takes the top of the screen. Turn on **Show use current location** and **Show navigate button** so the nearest pool and directions are one tap away.

Style the widget's own parts by downloading the default stylesheet ([Use CSS](../widgets/map-widget.md#use-css)) and overriding colours, corners and fonts, scoped to your container.

## Variations

- **Venue landing pages for SEO:** create one page per town ("Kids' dance classes in Bristol") with local copy and a registration widget filtered by [`place_ids`](../widgets/registration-widget.md#place_ids). Link them from the map page.
- **Franchise networks:** each franchisee keeps their own Zooza company, and the network site shows all venues together.
- **Regional pages:** open the map on one region instead of fitting every pin, with [`map_view`](../widgets/map-widget.md#map_view):
  ```html
  <script>
    window.ZOOZA = window.ZOOZA || {};
    window.ZOOZA.widgets = window.ZOOZA.widgets || {};
    window.ZOOZA.widgets.map = { map_view: { center: { lat: 51.4545, lng: -2.5879 }, zoom: 11 } };
  </script>
  ```
- **Venue overview without the class list:** add `data-zooza-show-schedules="false"` to the placeholder ([`show_schedules`](../widgets/map-widget.md#show_schedules)) to show only the pins and their bubbles.
- **Deeper styling:** when the variables are not enough, target the [`zooza-map-*` classes](../widgets/map-widget.md#class-names), scoped to `.lm-map-host`.

<AiPrompt task="Add a location map to my site">{`I want a "Find your nearest class" page with the Zooza map widget.

Read the Zooza docs first: https://docs.zooza.online/llms-full.txt
Use this example as the pattern: https://docs.zooza.online/examples/location-map/

Tasks:
1. Build the page with an intro, a reserved-height map container with a CSS-only skeleton, and the map widget embed (v1 loader).
2. Ask me for my widget key and region (Europe / UK / UAE).
3. List which map settings I should enable in Publish > Widget > Map for my use case.
4. Brand the map with --zooza-* theme variables on .zooza-map-widget.
5. Optionally scaffold one landing page per town with a registration widget filtered by place_ids, or open the map on a region with window.ZOOZA.widgets.map.map_view.`}</AiPrompt>
