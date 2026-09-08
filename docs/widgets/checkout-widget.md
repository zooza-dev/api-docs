---
title: Checkout widget
description: The Zooza checkout widget — purchase flow for digital products, discount coupons, prepaid vouchers, and entrance tickets.
sidebar_position: 7
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

There are two ways to embed this widget, and both are fully supported. See [Choosing an embed method](./embed-methods.md) if you are not sure which one to use.

| Placeholder | Description | Example Value |
|---|---|---|
| `YOUR_API_KEY` | Replace with the API key found in the application under `Publish > Widget`. Appears twice in the direct embed, once in the head/body placeholder. | `abc123xyz` |
| `ZOOZA_API_URL` | Replace with the Zooza API URL for your region: Europe: `https://api.zooza.app`, UK: `https://uk.api.zooza.app`, UAE: `https://asia.api.zooza.app` | `https://api.zooza.app` |

<Tabs groupId="embed-method">
  <TabItem value="direct" label="Direct embed" default>

Place the following snippet directly into the `<body>` of your page, where you want the widget to appear.

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
if ( document.readyState !== 'loading' ) {
    async_load();
} else if ( document.addEventListener ) {
    document.addEventListener( 'DOMContentLoaded', async_load );
} else {
    document.attachEvent( 'onreadystatechange', function() {
        if ( document.readyState === 'complete' ) { async_load(); }
    } );
}
} )();
</script>
```

  </TabItem>
  <TabItem value="head-body" label="Head + body">

Place the loader in the `<head>` of your page:

```html
<script async src='ZOOZA_API_URL/widgets/v2/loader.js'></script>
```

Then place the placeholder in the `<body>`, where you want the widget to appear:

```html
<div data-zooza-widget='checkout' data-zooza-id='YOUR_API_KEY'></div>
```

Initialisation options can be set directly on the placeholder as [`data-zooza-*` attributes](./embed-methods.md#configuring-a-widget-on-the-placeholder).

  </TabItem>
</Tabs>

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Checkout`.

### URL

This will let Zooza know where your widget resides so that it can [redirect your customers](index.md#importance-of-a-url) to it when necessary.

### Use CSS

This will load default Zooza styling. By default this is turned on. Typically you only want to override couple of styles but if you want, you can turn this off and create your own styling from scratch. However we recommend downloading the default styling and go from there, instead of building everything from scratch.

You can download the default css from this URL:

`API_URL/widgets/v2/css/?widget=checkout`

## Initialisation options

### `product`

_Type: Integer, String_

Preselects which product the checkout sells. When this is not set, the widget renders a product selector and lets the customer choose.

| Value | Description | Example Value |
|---|---|---|
| `YOUR_PRODUCT_ID` | Id of the product to sell. | `123` |

<Tabs groupId="config-surface">
  <TabItem value="url" label="URL Query">

```plaintext
https://sample-site.com/checkout?product=YOUR_PRODUCT_ID
```

  </TabItem>
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='checkout'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-product='123'></div>
```

  </TabItem>
</Tabs>

### `currency`

_Type: String (Three letter ISO 4217 code)_

Sets the currency the checkout is presented in. The currency must be configured on the product.

| Value | Description | Example Value |
|---|---|---|
| `CODE` | Three letter ISO 4217 currency code. | `CZK` |

<Tabs groupId="config-surface">
  <TabItem value="url" label="URL Query">

```plaintext
https://sample-site.com/checkout?currency=CODE
```

  </TabItem>
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='checkout'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-currency='CZK'></div>
```

  </TabItem>
</Tabs>

:::note Paying an existing registration is not an embed option
`registration`, `r` and `payment_response` are runtime parameters — they identify a single transaction and arrive on a generated payment link. They are not embed-time configuration and should not be set on the placeholder.
:::
