---
title: Checkout widget
description: The Zooza checkout widget — purchase flow for digital products, discount coupons, prepaid vouchers, and entrance tickets.
sidebar_position: 7
---

import AiPrompt from '@site/src/components/AiPrompt';

# Checkout widget

**This widget provides a way to purchase digital products and services such as Videos or eBooks, discount coupons, prepaid coupons or Entrance vouchers or other various services.**

## Installation

### WordPress

When your WordPress plugin is installed, just head to `Settings > Zooza` and from dropdown of pages, select a page where you want the form to appear.

#### Shortcodes

You can also use shortcodes to place the form anywhere within the page. More configuration options for shortcodes is described below in their respective sections.

```plaintext
[zooza type="checkout"]
```

### Wix

In Wix editor, click on Zooza widget. In the `Settings` panel, enter the api key and as a widget choose `Checkout`.

### Embed code

Place the following snippet directly into the `<body>` of your page, where you want the booking form to appear.

| Placeholder | Description | Example Value |
|---|---|---|
| `YOUR_API_KEY` | Replace with the API key found in the application under `Publish > Widget`. Appears twice. | `abc123xyz` |
| `ZOOZA_API_URL` | Replace with the Zooza API URL for your region: Europe: `https://api.zooza.app`, UK: `https://uk.api.zooza.app`, UAE: `https://asia.api.zooza.app` | `https://api.zooza.app` |

```javascript
<script data-version='v2' data-widget-id='zooza' id='YOUR_API_KEY' type='text/javascript'>
( function() {
function async_load(){
    document.body.setAttribute('data-zooza-api-url', 'ZOOZA_API_URL');
    var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true;
    s.src = document.body.getAttribute('data-zooza-api-url') +
     '/widgets/v2/?type=checkout&ref=' + encodeURIComponent( window.location.href );
    var embedder = document.getElementById( 'YOUR_API_KEY' );
    embedder.parentNode.insertBefore( s, embedder );
}
if ( window.attachEvent ) {
    window.attachEvent( 'onload', async_load );
} else {
    window.addEventListener( 'load', async_load, false );
}
} )();
</script>
```

<AiPrompt task="Embed the checkout widget into my site">{`I'm integrating the Zooza checkout widget into my website.

Read the full Zooza widget & API documentation first for context:
https://docs.zooza.online/llms-full.txt

Here is the embed snippet I need to install:

<script data-version='v2' data-widget-id='zooza' id='YOUR_API_KEY' type='text/javascript'>
( function() {
function async_load(){
    document.body.setAttribute('data-zooza-api-url', 'ZOOZA_API_URL');
    var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true;
    s.src = document.body.getAttribute('data-zooza-api-url') +
     '/widgets/v2/?type=checkout&ref=' + encodeURIComponent( window.location.href );
    var embedder = document.getElementById( 'YOUR_API_KEY' );
    embedder.parentNode.insertBefore( s, embedder );
}
if ( window.attachEvent ) {
    window.attachEvent( 'onload', async_load );
} else {
    window.addEventListener( 'load', async_load, false );
}
} )();
</script>

Tasks:
1. Tell me exactly where in my page to place this snippet.
2. Replace YOUR_API_KEY (it appears twice) with the key from Publish > Widget in my Zooza app — ask me for it.
3. Set ZOOZA_API_URL to my region: Europe https://api.zooza.app, UK https://uk.api.zooza.app, UAE https://asia.api.zooza.app.`}</AiPrompt>

<AiPrompt task="Style the checkout widget to match my site">{`I've embedded the Zooza checkout widget and now I want it to match my site's existing design.

Read the Zooza widget documentation for the available CSS hooks and the "Use CSS" option:
https://docs.zooza.online/llms-full.txt

Tasks:
1. Inspect my site's current design tokens — primary colour, fonts, border radius, spacing.
2. Write CSS that styles the checkout flow (product list, coupon field, the pay button) to match my brand.
3. Keep it accessible and responsive on mobile.

My brand: [describe your colours and fonts here, or point me at your stylesheet].`}</AiPrompt>

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Checkout`.

### URL

This will let Zooza know where your widget resides so that it can [redirect your customers](index.md#importance-of-a-url) to it when necessary.

### Use CSS

This will load default Zooza styling. By default this is turned on. Typically you only want to override couple of styles but if you want, you can turn this off and create your own styling from scratch. However we recommend downloading the default styling and go from there, instead of building everything from scratch.

You can download the default css from this URL:

`API_URL/widgets/v2/css/?widget=checkout`
