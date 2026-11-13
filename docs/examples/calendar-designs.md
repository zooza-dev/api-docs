---
title: Calendar and timetable designs
description: Three no-code timetable designs with the Zooza calendar widget — a colourful week view with filters, a classic month calendar with cancelled sessions, and a single-venue timetable with level badges — configured in the admin and styled with CSS.
sidebar_label: Calendar designs
---

import AiPrompt from '@site/src/components/AiPrompt';

# Calendar and timetable designs

## The problem

A timetable answers the question parents ask most: *"What's on, when, and is there space?"*. It has to show live availability, react when a class fills up or a session is cancelled, and send the parent to booking with one click. And it should look like the rest of your site.

## What you'd have to build yourself

A data feed of classes and sessions, availability that updates with every booking, cancelled sessions, filters by venue, programme and instructor, and links into booking. The Zooza [calendar widget](../widgets/calendar-widget.md) does this without a server. If you need a timetable that search engines can index, or a fully custom layout, build it from the REST API instead, as in [Weekly timetable with filters](./filtered-timetable.md).

## The embed

```html
<div data-zooza-widget="calendar" data-zooza-id="YOUR_API_KEY"></div>
<script async src="https://api.zooza.app/widgets/v2/loader.js"></script>
```

Most of the design decisions below are **settings** in **Publish > Widget > Calendar**, so the same embed gives three very different timetables.

## Variant A: colourful week view with filters

![Little Movers week view: filter drop-downs for venue, programme and instructor, Monday to Saturday columns with tiles showing time, class, venue, instructor and availability text such as "Spots available" or "Last spot available", and a colour legend by age group](/img/examples/calendar-week-movers.png)

The default **abstract week view** shows every running and upcoming class in a Monday-to-Saturday grid, without specific dates. That's ideal for "our regular weekly timetable".

| Setting | Value |
|---|---|
| [Customize sessions shown in calendar](../widgets/calendar-widget.md#customize-sessions-shown-in-calendar) | System (default) |
| [Availability](../widgets/calendar-widget.md#availability) | Text information: *"Last spot available"* |
| [Show instructor](../widgets/calendar-widget.md#show-instructor) | On |
| [Show course filtering](../widgets/calendar-widget.md#show-course-filtering) | On, filter by location, course and instructor |
| [Show filter button](../widgets/calendar-widget.md#show-filter-button) | On, so the filters stay tucked away until needed |
| [Use link to registration](../widgets/calendar-widget.md#use-link-to-registration) | On, so a tile opens the booking form |

Colour-code the tiles by age group by adding a class from the programme name in [`event_tile_render`](../widgets/calendar-widget.md#event_tile_render):

```html
<script>
  window.ZOOZA = window.ZOOZA || {};
  window.ZOOZA.callback = window.ZOOZA.callback || {};

  window.ZOOZA.callback.event_tile_render = function ( data, html ) {
    // Tip: console.log( data ) once to see every field you can use
    var text = html.replace( /<[^>]+>/g, ' ' );
    var group = /Baby/.test( text ) ? 'babies' : /Tiny|Mini/.test( text ) ? 'toddlers' : 'kids';
    return '<div class="lm-tile lm-tile--' + group + '">' + html + '</div>';
  };
</script>
```

```css
.lm-tile { border-left: 5px solid #ff8a6b; border-radius: 12px; }
.lm-tile--babies { border-left-color: #ffc83d; }
.lm-tile--kids   { border-left-color: #5b2a86; }
```

## Variant B: classic month calendar

![Studio Nord month calendar for November 2026: a seven-column grid with dates, small session labels like "16:15 Piano F." and "18:00 Jazz", one session crossed out as cancelled, and today highlighted](/img/examples/calendar-month-nord.png)

For one-off lessons, workshops and anything with specific dates, switch to the **classic calendar view** and show cancelled sessions, so parents see the gap instead of wondering.

| Setting | Value |
|---|---|
| Customize sessions shown in calendar | **Custom selection** → *Session dates in current classes*, *Dates for future classes*, *Cancelled sessions*, *Classic calendar view* |
| Availability | Do not show (private lessons) |
| [Use link for more information](../widgets/calendar-widget.md#use-link-for-more-information) | On, so a tile opens the programme page on your site |

Keep the styling quiet. Square corners, hairlines and one accent colour match an editorial site. Download the default stylesheet as described in [Use CSS](../widgets/calendar-widget.md#use-css) and override only colours, borders and fonts, scoped to your page:

```css
.nord-schedule div.zooza {
  font-family: inherit;
  color: #1d1d1b;
}
/* Then copy the grid and tile selectors you need from the default stylesheet
   and override only their colours, borders and radius, e.g. hairline #dcd9cf
   borders, square corners and #2f6f5e for links. */
```

## Variant C: one venue, with level badges

![Splash Academy timetable for Bayside Pool: stage filters on the left, and day-by-day rows on the right with time, class name, a Stage badge, length, lane and coach, a Book button, and one class marked "Full · join waitlist"](/img/examples/calendar-list-splash.png)

A swim school publishes one timetable per pool. Each pool page embeds the calendar limited to that venue with [`place_id`](../widgets/calendar-widget.md#place_id), and adds a level badge to every tile:

```html
<div data-zooza-widget="calendar" data-zooza-id="YOUR_API_KEY"
     data-zooza-place-id="BAYSIDE_PLACE_ID"></div>

<script>
  window.ZOOZA = window.ZOOZA || {};
  window.ZOOZA.callback = window.ZOOZA.callback || {};

  window.ZOOZA.callback.event_tile_render = function ( data, html ) {
    var stage = html.replace( /<[^>]+>/g, ' ' ).match( /Stage\s+\d/ );
    var badge = stage ? '<span class="splash-level">' + stage[ 0 ] + '</span>' : '';
    return badge + html;
  };
</script>
```

```css
.splash-level {
  display: inline-block;
  margin-bottom: .25rem;
  padding: .1rem .5rem;
  border-radius: 6px;
  background: #dff2fa;
  color: #0b2e59;
  font-size: .75rem;
  font-weight: 800;
}
```

The illustration shows a compact day-by-day layout. The calendar widget renders its own week or month grid. For a list layout that you fully control, build it from the REST API as in [Weekly timetable with filters](./filtered-timetable.md), and keep the calendar widget for pages where the built-in grid is enough.

## Tips

- **[`filter_courses`](../widgets/calendar-widget.md#filter_courses) and [`course_id`](../widgets/calendar-widget.md#course_id)** give a programme page its own small timetable.
- **[Hide information about current class](../widgets/calendar-widget.md#hide-information-about-current-class)** skips the class summary when a tile opens the booking form, which shortens the path to booking.
- **[Import your own sessions](../widgets/calendar-widget.md#import-your-own-sessions)** to show events from another system in the same calendar.

<AiPrompt task="Design my class timetable with the calendar widget">{`I want a class timetable on my website using the Zooza calendar widget.

Read: https://docs.zooza.online/examples/calendar-designs/ and https://docs.zooza.online/widgets/calendar-widget/

Tasks:
1. Ask me: weekly regular classes (week view) or dated sessions (classic calendar)? One venue or all? Show availability?
2. List the exact settings to choose in Publish > Widget > Calendar.
3. Write the embed (v2 loader) with place_id / course_id if needed.
4. If I want colour coding or badges, write an event_tile_render callback that only wraps or prepends to the html it receives, plus scoped CSS.`}</AiPrompt>
