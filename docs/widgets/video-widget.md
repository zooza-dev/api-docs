---
title: Video widget
description: The Zooza video widget — secure video and live stream playback for authenticated users.
sidebar_position: 6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Video widget

**This widget provides a secure way to play all videos and live streams that you provided for your customers either for free or against the payment. Video can only be played by logged in users.**

## Installation

### WordPress

When your WordPress plugin is installed, just head to `Settings > Zooza` and from dropdown of pages, select a page where you want the form to appear.

#### Shortcodes

You can also use shortcodes to place the form anywhere within the page. More configuration options for shortcodes is described below in their respective sections.

```plaintext
[zooza type="video"]
```

### Wix

In Wix editor, click on Zooza widget. In the `Settings` panel, enter the api key and as a widget choose `Video`.

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
     '/widgets/v2/?type=video&ref=' + encodeURIComponent( window.location.href );
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
<div data-zooza-widget='video' data-zooza-id='YOUR_API_KEY'></div>
```

Initialisation options can be set directly on the placeholder as [`data-zooza-*` attributes](./embed-methods.md#configuring-a-widget-on-the-placeholder).

  </TabItem>
</Tabs>

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Video`.

### URL

This will let Zooza know where your widget resides so that it can [redirect your customers](index.md#importance-of-a-url) to it when necessary.

### Use CSS

This will load default Zooza styling. By default this is turned on. Typically you only want to override couple of styles but if you want, you can turn this off and create your own styling from scratch. However we recommend downloading the default styling and go from there, instead of building everything from scratch.

You can download the default css from this URL:

`API_URL/widgets/v2/css/?widget=video`

## Initialisation options

These options select which content the widget embeds.

### `v`

_Type: Integer, String_

Id of the video to embed.

| Value | Description | Example Value |
|---|---|---|
| `YOUR_VIDEO_ID` | Id of the video. | `123` |

<Tabs groupId="config-surface">
  <TabItem value="url" label="URL Query">

```plaintext
https://sample-site.com/video?v=YOUR_VIDEO_ID
```

  </TabItem>
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='video'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-v='123'></div>
```

  </TabItem>
</Tabs>

### `type`

_Type: String_

Selects the mode the widget runs in. Use `live_stream` together with [`live_stream_id`](#live_stream_id) to embed a live stream rather than a recorded video.

| Value | Description | Example Value |
|---|---|---|
| `MODE` | Widget mode. | `live_stream` |

<Tabs groupId="config-surface">
  <TabItem value="url" label="URL Query">

```plaintext
https://sample-site.com/video?type=live_stream
```

  </TabItem>
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='video'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-type='live_stream'></div>
```

  </TabItem>
</Tabs>

### `live_stream_id`

_Type: Integer, String_

Id of the live stream to embed. Used when [`type`](#type) is set to `live_stream`.

| Value | Description | Example Value |
|---|---|---|
| `YOUR_STREAM_ID` | Id of the live stream. | `123` |

<Tabs groupId="config-surface">
  <TabItem value="url" label="URL Query">

```plaintext
https://sample-site.com/video?type=live_stream&live_stream_id=YOUR_STREAM_ID
```

  </TabItem>
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='video'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-type='live_stream'
     data-zooza-live-stream-id='123'></div>
```

  </TabItem>
</Tabs>

:::note `key` is not an embed option
`key` is a runtime authentication token, not embed-time configuration. Do not set it on the placeholder.
:::
