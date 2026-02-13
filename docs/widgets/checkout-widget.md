---
title: Zooza Checkout Widget
description: Widget for purchasing non-course/programme related services from Zooza.
authors:
  - Martin Rapavý
date: 2025-10-05
updated: 2025-12-05
---

# Checkout Widget

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

| Placeholder        | Description                                                                                  | Example Value                |
|--------------------|---------------------------------------------------------------------------------------------|------------------------------|
| `YOUR_API_KEY`     | Replace with the API key found in the application under `Publish > Widget`. Appears twice.  | `abc123xyz`                  |
| `ZOOZA_API_URL`    | Replace with the Zooza API URL for your region:<br>- Europe: `https://api.zooza.app`<br>- UK: `https://uk.api.zooza.app`<br>- UAE: `https://asia.api.zooza.app` | `https://api.zooza.app`      |


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

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Checkout`.

### URL

This will let Zooza know where your widget resides so that it can [redirect your customers](index.md#importance-of-a-url) to it when necessary.

### Use CSS

This will load default Zooza styling. By default this is turned on. Typically you only want to override couple of styles but if you want, you can turn this off and create your own styling from scratch. However we recommend downloading the default styling and go from there, instead of building everything from scratch.

You can download the default css from this URL:

`API_URL/widgets/v2/css/?widget=checkout`
