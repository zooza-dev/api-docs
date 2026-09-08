---
title: Profile widget
description: The Zooza profile widget — customer portal for booking history, payment management, and make-up session booking.
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AiPrompt from '@site/src/components/AiPrompt';

# Profile widget

**This is essentially a members only area, or a customer portal. It displays order/booking history as well as allows management of all bookings and payments.**

## Installation

### WordPress

When your WordPress plugin is installed, just head to `Settings > Zooza` and from dropdown of pages, select a page where you want the form to appear.

#### Shortcodes

You can also use shortcodes to place the form anywhere within the page. More configuration options for shortcodes is described below in their respective sections.

```plaintext
[zooza type="profile"]
```

### Wix

In Wix editor, click on Zooza widget. In the `Settings` panel, enter the api key and as a widget choose `Profile`.

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
<script data-version='v1' data-widget-id='zooza' id='YOUR_API_KEY' type='text/javascript'>
( function() {
function async_load(){
	document.body.setAttribute('data-zooza-api-url', 'ZOOZA_API_URL');
	var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true;
	s.src = document.body.getAttribute('data-zooza-api-url') +
	 '/widgets/v1/?type=profile&ref=' + encodeURIComponent( window.location.href );
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
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

Then place the placeholder in the `<body>`, where you want the widget to appear:

```html
<div data-zooza-widget='profile' data-zooza-id='YOUR_API_KEY'></div>
```

Initialisation options can be set directly on the placeholder as [`data-zooza-*` attributes](./embed-methods.md#configuring-a-widget-on-the-placeholder).

  </TabItem>
</Tabs>
<AiPrompt task="Embed the profile widget into my site">{`I'm integrating the Zooza profile widget (customer portal) into my website.

Read the full Zooza widget & API documentation first for context:
https://docs.zooza.online/llms-full.txt

Here is the embed snippet I need to install:

<script data-version='v1' data-widget-id='zooza' id='YOUR_API_KEY' type='text/javascript'>
( function() {
function async_load(){
	document.body.setAttribute('data-zooza-api-url', 'ZOOZA_API_URL');
	var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true;
	s.src = document.body.getAttribute('data-zooza-api-url') +
	 '/widgets/v1/?type=profile&ref=' + encodeURIComponent( window.location.href );
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

Tasks:
1. Tell me exactly where in my page to place this snippet (this is a logged-in members area).
2. Replace YOUR_API_KEY (it appears twice) with the key from Publish > Widget in my Zooza app — ask me for it.
3. Set ZOOZA_API_URL to my region: Europe https://api.zooza.app, UK https://uk.api.zooza.app, UAE https://asia.api.zooza.app.`}</AiPrompt>

<AiPrompt task="Style the profile widget to match my site">{`I've embedded the Zooza profile widget (customer portal) and now I want it to match my site's existing design.

Read the Zooza widget documentation for the available CSS hooks and the "Use CSS" option:
https://docs.zooza.online/llms-full.txt

Tasks:
1. Inspect my site's current design tokens — primary colour, fonts, border radius, spacing.
2. Write CSS that styles the portal (booking history, payment list, buttons) to match my brand.
3. Keep it accessible and responsive on mobile.

My brand: [describe your colours and fonts here, or point me at your stylesheet].`}</AiPrompt>

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Profile`.

### URL

This will let Zooza know where your widget resides so that it can [redirect your customers](index.md#importance-of-a-url) to it when necessary.

### Transfer the website visitor to the form

This is useful if the registration form is not on the top of the page and users will need to scroll to see it. By default this is turned off.

### Show session number

Each session has automatic index assigned to it. If you want to display these indices to your customer for better orientation in the sessions, check this option.

### View payments

By checking this option, clients will be able to see the Payments tab in their profiles.

### Classrooms into one location

When customers are selecting make-up sessions by default all rooms are listed separately. Turn this on to merge all classrooms under their respective locations.

### Reason for cancelling

If you want to collect reasons why users are cancelling their sessions, you can turn this on to prompt them.

| Value | Description |
|---|---|
| Do not ask (default) | Default option |
| Before the cancellation | Before users will be able to cancel the session, they will need to provide a reason |
| After the cancellation | Prompt for cancellation reason will appear only after the cancellation has been made, thus making this an optional choice |

When prompted to provide a cancellation reason, users will be shown a series of pre-defined options:

- Cancelling due to sickness
- Cancelling due to traveling
- Do not want to provide an answer

### Use CSS

This will load default Zooza styling. By default this is turned on. Typically you only want to override couple of styles but if you want, you can turn this off and create your own styling from scratch. However we recommend downloading the default styling and go from there, instead of building everything from scratch.

You can download the default css from this URL:

`API_URL/widgets/v1/css/?widget=YOUR_API_KEY&type=profile`

See [valid options](#embed-code) for `API_URL` and `YOUR_API_KEY` above.

## Initialisation options

### `translations`

_Type: Object_

:::note JavaScript only
This option takes an object of custom strings. It cannot be set as a `data-zooza-*` attribute on a head/body placeholder — HTML attributes are strings. Use a `<script>` block alongside the placeholder.
:::


If you want to replace any of the text used in the booking form, you can do that by providing your own custom translations. [See this reference](./registration-widget.md#translations) for more details.

<AiPrompt task="Customise the profile widget's text labels">{`I want to customise the text labels shown in my Zooza profile widget using the translations option.

Read the Zooza widget documentation for the translations option and how to find translation keys:
https://docs.zooza.online/llms-full.txt

Tasks:
1. Give me a window.ZOOZA script block with a translations object.
2. Override the labels I list below with my preferred wording, using the correct translation keys.
3. Tell me where to place this script relative to the widget embed snippet.

Labels I want to change:
- [e.g. a portal heading or button label]
- [add more here]

If you don't know a key, tell me to enable print_debug and read it from the browser console.`}</AiPrompt>

## Events

### `zooza_user_logged_in`

Event will fire immediately after the user has been logged into the system.

```javascript
document.addEventListener('zooza_user_logged_in', function (event) {
    console.log('User logged in:', event.detail);
});
```

`event.detail` will contain the following user object:

```javascript
{
    avatar: AVATAR_URL,
    email: USER_EMAIL,
    first_name: USER_FIRST_NAME,
    last_name: USER_LAST_NAME,
    user_id: USER_ID
}
```

| Property | Description |
|---|---|
| `AVATAR_URL` | _String\|Null_ Url to a user avatar picture |
| `USER_EMAIL` | _String_ email of logged in user |
| `USER_FIRST_NAME` | _String_ First name |
| `USER_LAST_NAME` | _String_ Last name |
| `USER_ID` | _String_ Zooza's User ID |

This object will be also stored in `LocalStorage()` under the key `zooza_user`.

### `zooza_user_logged_out`

Event will trigger when user will hit the logout button provided within the widget.

```javascript
document.addEventListener('zooza_user_logged_out', function (event) {
    console.log('User logged out:', event.detail);
});
```

`event.detail` will contain the following object:

```javascript
{
    logged_out: true,
}
```

### `zooza_user_force_logout`

You can provide your own logout button and force a logout from Zooza and redirect the user. To do so, dispatch the following event:

```javascript
const force_logout_event = new CustomEvent('zooza_user_force_logout', {
    detail: {
        redirect_url: YOUR_REDIRECT_URL
    }
});
document.dispatchEvent(force_logout_event);
```

| Value | Description | Example |
|---|---|---|
| `YOUR_REDIRECT_URL` | Url where you want your customers to be redirected once they are logged out from Zooza | `https://zooza.online` |

## Example — show user status in header

This example shows how events can be leveraged to build a user profile in the header of your website. This is specifically for WordPress but general principles apply to any platform.

### header.php

In your header.php put some placeholder where user's name would be shown:

```html
<div class="user_profile">
    <div class=""></div>
</div>
```

### functions.php

Drop this into your functions.php. This code sets up event listeners for the widget's events and will listen to login and logout events. When this happens it will render user info in the header along with a logout button.

```php
function zooza_user_status_widget() {
    ?>
    <script>
    document.addEventListener("DOMContentLoaded", function () {
        const profileContainer = document.querySelector('.user_profile');
        if (!profileContainer) return;

        function render_user(user) {
            if (!user) {
                profileContainer.innerHTML = '';
                return;
            }

            profileContainer.innerHTML = `
                <div class="zooza-user-info">
                    <strong>${user.first_name} ${user.last_name}</strong> <small>(${user.email})</small><br>
                    <a href="#" class="zooza-logout-link">Logout</a>
                </div>
            `;

            const logoutLink = profileContainer.querySelector('.zooza-logout-link');
            logoutLink.addEventListener('click', function (e) {
                e.preventDefault();
                const redirect_url = window.location.origin;
                const logoutEvent = new CustomEvent('zooza_user_force_logout', {
                    detail: { redirect_url }
                });
                document.dispatchEvent(logoutEvent);
            });
        }

        try {
            const stored = localStorage.getItem('zooza_user');
            if (stored) {
                const user = JSON.parse(stored);
                render_user(user);
            }
        } catch (err) {
            console.warn('Zooza user load failed:', err);
        }

        document.addEventListener('zooza_user_logged_in', function (event) {
            render_user(event.detail);
        });

        document.addEventListener('zooza_user_logged_out', function () {
            localStorage.removeItem('zooza_user');
            render_user(null);
        });
    });
    </script>
    <style>
        .user_profile {
            position: relative;
            display: inline-block;
            text-align: right;
            font-size: 14px;
        }
        .zooza-user-info small {
            color: #666;
        }
        .zooza-logout-link {
            color: #0073aa;
            text-decoration: none;
        }
        .zooza-logout-link:hover {
            text-decoration: underline;
        }
    </style>
    <?php
}
add_action('wp_footer', 'zooza_user_status_widget');
```
