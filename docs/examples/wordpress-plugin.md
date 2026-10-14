---
title: Package your widget customisation as a WordPress plugin
description: Ship Zooza widget customisations (styling, custom tiles, callbacks) as a small WordPress plugin with a shortcode — configurable per page, safe from page builders that strip inline scripts, and reusable across sites.
sidebar_label: WordPress plugin
---

import AiPrompt from '@site/src/components/AiPrompt';

# Package your widget customisation as a WordPress plugin

## The problem

Most activity businesses run WordPress, often with a page builder such as Elementor, Divi or WPBakery. You've written a nice customisation for the booking widget: custom tiles, brand styles, a few settings. Now you need to:

- put it on several pages with different settings (programme ids, columns, colours),
- let the site owner place it without editing code,
- survive page builders and content filters that **strip `<script>` tags** from page content and print the JavaScript as visible text,
- update it in one place.

## The pattern

A small plugin with one shortcode:

```
[little_movers_booking course_ids="201|202" columns="2" multistep="true"]
```

1. **The shortcode outputs only the placeholder `<div>`.** That's plain HTML, which no filter strips.
2. **It records the shortcode's settings** in PHP and doesn't print a script inside the content.
3. **In the footer (`wp_footer`) the plugin prints one `<script>`** that sets `window.ZOOZA` and registers your callbacks, followed by the Zooza loader. Footer output isn't filtered by page builders, and because the settings and callbacks are printed before the loader, they're registered before the widget starts.
4. **Your JavaScript and CSS live in the plugin as files**, enqueued normally and cached by the browser.

## The code

```
little-movers-booking/
├── little-movers-booking.php
└── assets/
    ├── booking.js      ← your render_* callbacks, reads window.LM_BOOKING
    └── booking.css
```

```php
<?php
/**
 * Plugin Name: Little Movers Booking
 * Description: Zooza registration widget with Little Movers styling. Shortcode: [little_movers_booking course_ids="1|2" columns="2" multistep="true"]
 * Version:     1.0.0
 * License:     GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

const LM_ZOOZA_API_URL = 'https://api.zooza.app';  // your region
const LM_ZOOZA_KEY     = 'YOUR_API_KEY';           // widget key from Publish > Widget

/** Settings collected from shortcodes on this page, printed in the footer. */
$GLOBALS['lm_booking_config'] = null;

add_shortcode( 'little_movers_booking', function ( $atts ) {
    $atts = shortcode_atts( [
        'course_ids' => '',
        'columns'    => '2',
        'multistep'  => 'false',
    ], $atts, 'little_movers_booking' );

    $ids = array_values( array_filter( array_map( 'intval', preg_split( '/[|,]/', $atts['course_ids'] ) ) ) );

    $GLOBALS['lm_booking_config'] = [
        'course_ids'          => $ids,
        'course_list_columns' => max( 1, min( 4, (int) $atts['columns'] ) ),
        'multi_step_form'     => $atts['multistep'] === 'true',
    ];

    wp_enqueue_style( 'lm-booking', plugins_url( 'assets/booking.css', __FILE__ ), [], '1.0.0' );

    // Only HTML in the content: survives KSES and page builders
    return '<div class="lm-booking" data-zooza-widget="registration" data-zooza-id="' . esc_attr( LM_ZOOZA_KEY ) . '"></div>';
} );

add_action( 'wp_footer', function () {
    $config = $GLOBALS['lm_booking_config'];
    if ( $config === null ) {
        return; // shortcode not on this page
    }

    // 1. Settings for the widget, before any script that reads them
    printf(
        "<script>window.ZOOZA = Object.assign( window.ZOOZA || {}, %s );</script>\n",
        wp_json_encode( array_filter( $config, fn( $v ) => $v !== [] ) )
    );

    // 2. Your callbacks (render_course_tile, render_schedule_tile, …)
    printf( "<script src=\"%s\"></script>\n", esc_url( plugins_url( 'assets/booking.js?ver=1.0.0', __FILE__ ) ) );

    // 3. The Zooza loader last
    printf( "<script async src=\"%s\"></script>\n", esc_url( LM_ZOOZA_API_URL . '/widgets/v1/loader.js' ) );
} );
```

`assets/booking.js` is any of the callback scripts from the other examples, for example [branded tiles](./branded-booking-tiles.md) or [age tabs](./age-tabs.md). Make it **merge** into `window.ZOOZA.callback` instead of replacing it:

```javascript
( function () {
    window.ZOOZA = window.ZOOZA || {};
    window.ZOOZA.callback = window.ZOOZA.callback || {};
    if ( ! window.ZOOZA.callback.render_course_tile ) {
        window.ZOOZA.callback.render_course_tile = function ( course ) { /* … */ };
    }
} )();
```

### Why it's built this way

- **Page builders strip inline scripts** in content. Shortcode output that contains only a `<div>` is safe, and `wp_footer` output isn't filtered.
- **One placeholder plus one loader** follows the standard [embed](../widgets/embed-methods.md). Shortcode attributes become [initialisation options](../widgets/registration-widget.md#initialisation-options), so editors can change programmes or columns per page.
- **Settings are JSON-encoded with `wp_json_encode`** and attributes are escaped, so editor input can't break the page.
- **Assets are versioned files**, so browsers cache them and you update everything by releasing a new plugin version.

:::tip Already using the Zooza WordPress plugin?
The official Zooza plugin places the widget with `[zooza type="registration"]`. You can keep it for the embed and use your own plugin **only** for styling and callbacks. In that case, skip the placeholder in your shortcode and print just the settings and `booking.js` in the footer.
:::

## Variations

- **Settings page:** add an admin page under *Settings* that lists the shortcode attributes for editors.
- **Several widgets per site:** register one shortcode per use case (`[lm_trial_booking]`, `[lm_parent_zone]`) that share the same assets.
- **Multisite / franchise:** read the widget key from a site option, so each franchise site uses its own Zooza company.

<AiPrompt task="Wrap my Zooza customisation in a WordPress plugin">{`I have custom JavaScript/CSS for the Zooza registration widget and I want to ship it as a WordPress plugin with a shortcode.

Read: https://docs.zooza.online/examples/wordpress-plugin/ and https://docs.zooza.online/widgets/registration-widget/

Tasks:
1. Ask me for my widget key, region, and which shortcode attributes editors need.
2. Create the plugin: shortcode outputs only the placeholder div; settings and scripts are printed in wp_footer (settings → my callbacks → Zooza loader).
3. Move my JS/CSS into versioned asset files; make the JS merge into window.ZOOZA.callback.
4. Escape all attributes and JSON-encode settings.`}</AiPrompt>
