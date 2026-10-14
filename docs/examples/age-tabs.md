---
title: Age-group tabs as the course selector
description: Turn the Zooza registration widget's programme list into a row of age tabs (3–4, 5–7, 8–10 …) read from programme metadata, so parents pick their child's age first and see only the matching classes.
sidebar_label: Age-group tabs
---

import AiPrompt from '@site/src/components/AiPrompt';

# Age-group tabs as the course selector

## The problem

Parents don't think in programme names. They think *"my daughter is six"*. A drama or sports school with one programme per age band wants the first thing on the form to be a simple row of ages, not a list of programme descriptions.

## What you'd have to build yourself

A custom selector that loads programmes, maps them to ages, loads the classes of the selected one, and then hands over to booking with the right ids. With Zooza you keep the widget's booking flow and only change how programmes are **displayed**.

## How it looks

![Age tabs 3–4, 5–7, 8–10, 11–13, 14–18 above a list of classes for the selected age, each showing its date range](/img/examples/age-tabs.png)

A row of tabs labelled by age: **3–4 · 5–7 · 8–10 · 11–13 · 14–18 years**. Selecting a tab highlights it and shows that age group's classes below. Each class tile shows only its date range and a **Choose** button. The tabs stay visible, so switching age is one click.

## Set-up in Zooza

Give each programme a public [metadata](../widgets/registration-widget.md#metadata_in) entry `age` with the label you want on the tab, for example `5-7`. Order the programmes in the admin from youngest to oldest, or pass them in order with [`course_ids`](../widgets/registration-widget.md#course_ids).

## The code

```html
<div class="lm-age" data-zooza-widget="registration" data-zooza-id="YOUR_API_KEY"></div>

<script>
  ( function () {
    'use strict';

    function esc( v ) {
      return String( v == null ? '' : v ).replace( /[&<>"']/g, function ( c ) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ c ];
      } );
    }

    function meta( course, key ) {
      var m = ( course.metadata || [] ).find( function ( x ) { return x.key === key; } );
      return m ? m.value : null;
    }

    window.ZOOZA = window.ZOOZA || {};
    window.ZOOZA.callback = window.ZOOZA.callback || {};

    // Optional: only the age-band programmes, in age order
    window.ZOOZA.course_ids = [ 201, 202, 203, 204, 205 ];

    // Keep every tab visible after a choice; the chosen one gets .selected
    window.ZOOZA.course_list_collapse_on_select = false;
    window.ZOOZA.course_list_columns = 4;

    // Each programme renders as a tab. The class hook makes it the select control.
    window.ZOOZA.callback.render_course_tile = function ( course ) {
      var age = meta( course, 'age' ) || course.name;
      return '<button type="button" class="zooza_courses_course_select lm-tab">' +
               '<span class="lm-tab__age">' + esc( age ) + '</span>' +
               '<span class="lm-tab__unit">years</span>' +
             '</button>';
    };

    // Class tiles: just the date range and the select button
    window.ZOOZA.callback.render_schedule_tile = function ( schedule ) {
      return '<p class="lm-dates">' + esc( schedule.get_date_formatted() ) + '</p>' +
             '<p class="lm-cap">' + esc( schedule.get_capacity_formatted() ) + '</p>' +
             '<button type="button" class="zooza_schedules_schedule_select">Choose</button>';
    };
  } )();
</script>
<script async src="https://api.zooza.app/widgets/v1/loader.js"></script>
```

```css
/* Turn the course grid into a tab strip */
.lm-age .zooza_courses_course { padding: 0; border: 0; background: none; }
.lm-tab {
  width: 100%; display: flex; flex-direction: column; align-items: center;
  padding: .8rem .5rem; border: 2px solid #e6dcef; border-radius: 14px;
  background: #fff; color: #5b2a86; font-weight: 800; cursor: pointer;
}
.lm-tab__age { font-size: 1.4rem; line-height: 1.1; }
.lm-tab__unit { font-size: .75rem; font-weight: 600; opacity: .7; }
.lm-age .zooza_courses_course.selected .lm-tab { background: #5b2a86; border-color: #5b2a86; color: #fff; }
.lm-dates { margin: 0; font-weight: 800; color: #5b2a86; }
.lm-cap { margin: .25rem 0 .6rem; color: #6a5f74; }
```

### Why it's built this way

- **The tab *is* the select control.** It carries `zooza_courses_course_select`, so the widget handles the click and loads that programme's classes. You write no click handlers.
- **[`course_list_collapse_on_select: false`](../widgets/registration-widget.md#course_list_collapse_on_select)** keeps all tabs on screen and adds `selected` to the active one, which is what a tab strip needs.
- **The age comes from metadata**, so staff change labels in Zooza without touching the website.
- Only public, documented members are used. There are no internal widget elements or DOM observers, so the example survives widget updates.

## Variations

- **Language versions:** run one page per language and filter its classes with [`labels_in`](../widgets/registration-widget.md#labels_in), for example `labels_in: ['english']`.
- **Variant under the age:** add a second metadata key (for example `track`: *stage* / *film*) and print it as a small line in the tab.
- **Multi-step:** add [`multi_step_form: true`](../widgets/registration-widget.md#multi_step_form) to put the tabs on step 1 on their own.

<AiPrompt task="Show age tabs instead of a course list">{`I want parents to pick their child's age first on my Zooza booking form.

Read: https://docs.zooza.online/examples/age-tabs/ and https://docs.zooza.online/widgets/registration-widget/

Tasks:
1. Ask me for my age bands and the metadata key holding them on each programme.
2. Configure course_list_collapse_on_select false and render_course_tile returning a tab with the zooza_courses_course_select class.
3. Add a simple render_schedule_tile with date range and capacity.
4. Write CSS that turns the course grid into a tab strip matching my site; escape all data in templates.`}</AiPrompt>
