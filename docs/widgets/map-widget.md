---
title: Zooza Map Widget
description: Widget showing available locations and classes at these locations
authors:
  - Martin Rapavý
date: 2025-10-05
updated: 2025-12-05
---

# Map Widget

**This widget provides a map view of your locations. Upon selecting a location, its contact details are shown and available classes for this location are listed below the map. When a class is clicked, the customer is taken to the [Registration Form](./registration-widget.md).**

## Installation

### WordPress

When your WordPress plugin is installed, just head to `Settings > Zooza` and from dropdown of pages, select a page where you want the form to appear.

#### Shortcodes

You can also use shortcodes to place the form anywhere within the page. More configuration options for shortcodes is described below in their respective sections.

```plaintext
[zooza type="map"]
```

### Wix

In Wix editor, click on Zooza widget. In the `Settings` panel, enter the api key and as a widget choose `Map`.

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
     '/widgets/v2/?type=map&ref=' + encodeURIComponent( window.location.href );
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

These settings are managed within the Zooza's main application `Publish > Widget > Map`.

### URL

This will let Zooza know where your widget resides so that it can [redirect your customers](index.md#importance-of-a-url) to it when necessary.

### Show price

This will show or hide price in the listed classes.

### Use age filter

This enables or disables filtering of classes based on age.

### Search by ZIP code

Enable or disable searching with ZIP code as well as using an address.

### Show radius filter

This will show a slider that users can use to narrow down the search area by distance radius.

### Show use current location

This will show a button that would pinpoint the current user's location.

### Show navigate button

When enabled, this will show a button which would open the default map application with the destination of your location. This happens when a user clicks on a pin on the map.

### Navigate button label

If navigate button is shown, you can change its label

### Use CSS

This will load default Zooza styling. By default this is turned on. Typically you only want to override couple of styles but if you want, you can turn this off and create your own styling from scratch. However we recommend downloading the default styling and go from there, instead of building everything from scratch.

You can download the default css from this URL:

`API_URL/widgets/v2/css/?widget=map`
