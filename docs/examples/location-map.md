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

Little Movers' "Find a class" page has a short intro, then a full-width map with a pin for each venue. A search field accepts a postcode or address, and a slider narrows the radius. Selecting a pin shows the venue's address and a **Navigate** button, and lists the classes running there. Each class links to the booking form.

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

<script async src="https://uk.api.zooza.app/widgets/v2/loader.js"></script>

<script>
  // Hide the skeleton as soon as the widget has rendered something.
  ( function () {
    var host = document.querySelector( '.lm-map-host [data-zooza-widget="map"]' );
    var skeleton = document.querySelector( '.lm-map-skeleton' );
    if ( ! host || ! skeleton ) return;

    var observer = new MutationObserver( function () {
      if ( host.children.length > 0 ) {
        skeleton.hidden = true;
        observer.disconnect();
      }
    } );
    observer.observe( host, { childList: true } );
  } )();
</script>
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
```

The map widget uses the **v2** loader (`/widgets/v2/loader.js`), while the registration widget uses v1. Little Movers operates in the UK, so the loader comes from `https://uk.api.zooza.app`. Use your own region's URL.

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
- **The skeleton sits outside the placeholder**, so the widget never has to deal with your markup. The observer only watches for the widget's first render.
- **Venues come from Zooza**, so opening a new venue or closing one updates the map without touching the website.

## Variations

- **Venue landing pages for SEO:** create one page per town ("Kids' dance classes in Bristol") with local copy and a registration widget filtered by [`place_ids`](../widgets/registration-widget.md#place_ids). Link them from the map page.
- **Franchise networks:** each franchisee keeps their own Zooza company, and the network site shows all venues together.
- **Styling:** download the default map CSS as described in [Use CSS](../widgets/map-widget.md#use-css) and override it, scoped to `.lm-map-host`.

<AiPrompt task="Add a location map to my site">{`I want a "Find your nearest class" page with the Zooza map widget.

Read the Zooza docs first: https://docs.zooza.online/llms-full.txt
Use this example as the pattern: https://docs.zooza.online/examples/location-map/

Tasks:
1. Build the page with an intro, a reserved-height map container with a skeleton, and the map widget embed (v2 loader).
2. Ask me for my widget key and region (Europe / UK / UAE).
3. List which map settings I should enable in Publish > Widget > Map for my use case.
4. Optionally scaffold one landing page per town with a registration widget filtered by place_ids.`}</AiPrompt>
