---
title: Block packages with selection limits
description: Sell a class in blocks grouped by category — technique, repertoire, choreography — and let customers pick a package that caps how many blocks of each category they can choose, built on the Zooza registration widget's block callbacks.
sidebar_label: Block packages
---

import AiPrompt from '@site/src/components/AiPrompt';

# Block packages with selection limits

## The problem

Some programmes aren't one class you join for a whole term. A dance school runs a season of short **blocks**: three technique blocks, two repertoire blocks, two choreography blocks. Students buy a **package** that defines the mix: *Starter* gets one of each, *Plus* gets two technique blocks, *Pro* gets two technique and two choreography blocks.

Parents need to see the blocks grouped so the choice makes sense, and the form has to stop them from choosing more than their package allows.

## What you'd have to build yourself

- Blocks with their own dates, price and capacity inside one class, plus pricing for any combination.
- Live availability per block, including blocks that free up later in the season.
- A booking form that handles several blocks in one order.
- The package rules on top.

Zooza already sells classes in [Blocks](../concepts.md#terms-in-other-languages) with per-block capacity and pricing. This example only adds the **grouping** and the **package limits**, using the registration widget's block callbacks.

## How it looks

![Block list grouped into Technique, Repertoire and Choreography with a Starter / Plus / Pro package switch; blocks over the package limit are greyed out](/img/examples/block-packages.png)

Above the list sits a package switch: **Starter · Plus · Pro**. Below it, blocks appear under three headings. When the parent reaches the limit for a category, the remaining blocks in it are greyed out with a short note. Deselecting a block enables them again. Switching package clears the selection.

## The code

```html
<div data-zooza-widget="registration" data-zooza-id="YOUR_API_KEY"
     data-zooza-registration-display-mode="segments_only"></div>

<script>
  ( function () {
    'use strict';

    // Category = first match in the block name (case-insensitive)
    var CATEGORIES = [
      { key: 'technique',    label: 'Technique',    match: 'technique' },
      { key: 'repertoire',   label: 'Repertoire',   match: 'repertoire' },
      { key: 'choreography', label: 'Choreography', match: 'choreo' },
    ];

    // How many blocks of each category each package allows
    var PACKAGES = {
      starter: { label: 'Starter', caps: { technique: 1, repertoire: 1, choreography: 1 } },
      plus:    { label: 'Plus',    caps: { technique: 2, repertoire: 1, choreography: 1 } },
      pro:     { label: 'Pro',     caps: { technique: 2, repertoire: 1, choreography: 2 } },
    };

    var state = { pkg: 'starter', el: null };

    function category_of( name ) {
      var lower = String( name || '' ).toLowerCase();
      var hit = CATEGORIES.find( function ( c ) { return lower.indexOf( c.match ) !== -1; } );
      return hit ? hit.key : '';
    }

    function tiles() {
      return state.el ? Array.from( state.el.querySelectorAll( '.zooza_segments_segment' ) ) : [];
    }

    function apply_caps() {
      var caps = PACKAGES[ state.pkg ].caps;
      var counts = {};
      tiles().forEach( function ( t ) {
        if ( t.classList.contains( 'selected' ) ) {
          counts[ t.dataset.lmCat ] = ( counts[ t.dataset.lmCat ] || 0 ) + 1;
        }
      } );
      tiles().forEach( function ( t ) {
        var cat = t.dataset.lmCat;
        var locked = cat && ! t.classList.contains( 'selected' ) && ( counts[ cat ] || 0 ) >= ( caps[ cat ] || Infinity );
        t.classList.toggle( 'lm-locked', !! locked );
      } );
    }

    function build_switch() {
      var nav = document.createElement( 'div' );
      nav.className = 'lm-packages';
      Object.keys( PACKAGES ).forEach( function ( key ) {
        var b = document.createElement( 'button' );
        b.type = 'button';
        b.textContent = PACKAGES[ key ].label;
        b.setAttribute( 'aria-pressed', String( key === state.pkg ) );
        b.addEventListener( 'click', function () {
          if ( key === state.pkg ) return;
          state.pkg = key;
          // Clear the selection through the widget's own controls,
          // so its price and form stay in sync
          state.el.querySelectorAll( '.zooza_segments_segment.selected a.zooza_button' )
            .forEach( function ( btn ) { btn.click(); } );
          nav.querySelectorAll( 'button' ).forEach( function ( x ) {
            x.setAttribute( 'aria-pressed', String( x === b ) );
          } );
          apply_caps();
        } );
        nav.appendChild( b );
      } );
      return nav;
    }

    window.ZOOZA = window.ZOOZA || {};
    window.ZOOZA.callback = window.ZOOZA.callback || {};

    window.ZOOZA.callback.segment_list_rendered = function ( params ) {
      var el = params.el;
      state.el = el;

      // Idempotent: remove what a previous render injected
      el.querySelectorAll( '.lm-packages, .lm-group' ).forEach( function ( n ) { n.remove(); } );

      var list = tiles();
      list.forEach( function ( tile, i ) {
        tile.dataset.lmCat = category_of( params.segments[ i ] && params.segments[ i ].name );
      } );

      el.insertBefore( build_switch(), el.firstChild );
      CATEGORIES.forEach( function ( c ) {
        var group = list.filter( function ( t ) { return t.dataset.lmCat === c.key; } );
        if ( ! group.length ) return;
        var heading = document.createElement( 'h4' );
        heading.className = 'lm-group';
        heading.textContent = c.label;
        el.appendChild( heading );
        group.forEach( function ( t ) { el.appendChild( t ); } );
      } );
      apply_caps();
    };

    var previous = window.ZOOZA.callback.on_segment_selected;
    window.ZOOZA.callback.on_segment_selected = function ( params ) {
      if ( typeof previous === 'function' ) previous( params );
      apply_caps();
    };
  } )();
</script>
<script async src="https://api.zooza.app/widgets/v1/loader.js"></script>
```

```css
.lm-packages { display: flex; gap: .5rem; margin-bottom: 1rem; }
.lm-packages button { border: 2px solid #5b2a86; background: #fff; color: #5b2a86; border-radius: 999px; padding: .45rem 1.1rem; font-weight: 700; }
.lm-packages button[aria-pressed="true"] { background: #5b2a86; color: #fff; }
.lm-group { margin: 1.25rem 0 .5rem; color: #5b2a86; }
.zooza_segments_segment.lm-locked { opacity: .45; }
.zooza_segments_segment.lm-locked a.zooza_button { display: none; }
.zooza_segments_segment.lm-locked::after { content: "Package limit reached"; display: block; font-size: .85rem; margin-top: .4rem; }
```

### Why it's built this way

- **[`segment_list_rendered`](../widgets/registration-widget.md#segment_list_rendered)** tags each tile with its category from the block name, then regroups the tiles under headings. `segments[ i ]` matches the i-th tile, so tagging happens before anything moves.
- **[`on_segment_selected`](../widgets/registration-widget.md#on_segment_selected)** fires after every select and deselect, so the limits are re-evaluated after each click.
- **Locked blocks only hide the widget's `a.zooza_button`.** Nothing about the booking changes, so price and availability still come from Zooza.
- **Switching package clicks the widget's own buttons** to deselect, so the widget's price and form stay correct.
- **The handler is idempotent** and chains any `on_segment_selected` handler that was already registered.

:::caution Limits are a front-end rule
The package limits live in your page, not in Zooza. If a package must also be enforced on payment, for example a different price per package, model it in Zooza as well: use separate programmes or price rules, and use this page for the guided selection.
:::

## Variations

- **Category from metadata instead of names:** use [`render_segment_tile`](../widgets/registration-widget.md#render_segment_tile) to print a badge per block, and keep the category list in your CMS keyed by block id.
- **Show "frees up on …" for full blocks:** read `segment.earliest_available_date` in `render_segment_tile`.
- **One package per page:** drop the switch and set `state.pkg` from the URL.

<AiPrompt task="Add block packages with limits to my booking form">{`My Zooza class is sold in blocks (registration_display_mode 'segments_only'). I want blocks grouped by category and package-based limits.

Read: https://docs.zooza.online/examples/block-packages/ and the block callbacks in https://docs.zooza.online/widgets/registration-widget/

Tasks:
1. Ask me for my block categories (and how to recognise them in block names) and my packages with per-category limits.
2. Implement segment_list_rendered (grouping + package switch, idempotent) and on_segment_selected (re-apply limits), chaining existing callbacks.
3. Only hide a.zooza_button on locked blocks; clear the selection by clicking the widget's own buttons.
4. Style it to match my site.`}</AiPrompt>
