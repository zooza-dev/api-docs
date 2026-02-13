---
title: Zooza Profile Widget
description: This widget provides a customer zone or parent portal functionalities for business' website.
authors:
  - Martin Rapavý
date: 2025-10-05
updated: 2025-12-05
---

# Profile Widget

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

Place the following snippet directly into the `<body>` of your page, where you want the booking form to appear.

| Placeholder        | Description                                                                                  | Example Value                |
|--------------------|---------------------------------------------------------------------------------------------|------------------------------|
| `YOUR_API_KEY`     | Replace with the API key found in the application under `Publish > Widget`. Appears twice.  | `abc123xyz`                  |
| `ZOOZA_API_URL`    | Replace with the Zooza API URL for your region:<br>- Europe: `https://api.zooza.app`<br>- UK: `https://uk.api.zooza.app`<br>- UAE: `https://asia.api.zooza.app` | `https://api.zooza.app`      |


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
if ( window.attachEvent ) {
	window.attachEvent( 'onload', async_load );
} else {
	window.addEventListener( 'load', async_load, false );
}
} )();
</script>
```

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Profile`.

### URL

This will let Zooza know where your widget resides so that it can [redirect your customers](index.md#importance-of-a-url) to it when necessary.

### Transfer the website visitor to the form

This is useful if the registration form is not on the top of the page and users will need to scroll to see it. By default this is turned off.

### Show session number

Each session has automatic index assigned to it. If you want to display these indices to your customer for better orientation in the sessions, check this option.

### View payments

By checking this option, clients will be able to see the Payments tab in their profiles

### Classrooms into one location

When customers are selecting make-up sessions by default all rooms are listed separately. Turn this on to merge all classrooms under their respective locations.

### Reason for cancelling

If you want to collect reasons why users are cancelling their sessions, you can turn this on to prompt them.

|Value              | Description      |
|-------------------|------------------|
|Do not ask (default)        | Default option |
|Before the cancellation     | Before users will be able to cancel the session, they will need to provide a reason |
|After the cancellation     | Prompt for cancellation reason will appear only after the cancellation has been made, thus making this an optional choice |

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

If you want to replace any of the text used in the booking form, you can do that by providing your own custom translations. [See this reference](./registration-widget.md#translations) for more details.

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

|Property|Description|
|--------|-----------|
|`AVATAR_URL`| _String|Null_ Url to a user avatar picture|
|`USER_EMAIL`| _String_ email of logged in user|
|`USER_FIRST_NAME`| _String_ First name|
|`USER_LAST_NAME`| _String_ Last name|
|`USER_ID`| _String_ Zooza's User ID|

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

|Value|Description|Example|
|-----|-----------|-------|
|`YOUR_REDIRECT_URL`|Url where you want your customers to be redirected once they are logged out from Zooza| `https://zooza.online`|

## Example - Show user status in header

This example shows how events can be leveraged to build a user profile in the header of your website. This is specifically for Wordpress but general principles apply to any platform.

### header.php

In your header.php put some placeholder where user's name would be shown

```html
<div class="user_profile">
    <div class=""></div>
</div>
```

### functions.php

Drop this into your functions.php. This code sets up event listeners for widget's event and will listen to login and logout events. When this happens it will render user info in the header along with logout button.

```php
function zooza_user_status_widget() {
    ?>
    <script>
    document.addEventListener("DOMContentLoaded", function () {
        const profileContainer = document.querySelector('.user_profile');
        if (!profileContainer) return;

        // Helper: render user info
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

            // Attach logout click
            const logoutLink = profileContainer.querySelector('.zooza-logout-link');
            logoutLink.addEventListener('click', function (e) {
                e.preventDefault();
                const redirect_url = window.location.origin; // redirect home after logout
                const logoutEvent = new CustomEvent('zooza_user_force_logout', {
                    detail: { redirect_url }
                });
                document.dispatchEvent(logoutEvent);
            });
        }

        // Try to load from localStorage if available
        try {
            const stored = localStorage.getItem('zooza_user');
            if (stored) {
                const user = JSON.parse(stored);
                render_user(user);
            }
        } catch (err) {
            console.warn('Zooza user load failed:', err);
        }

        // Listen to Zooza events
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
