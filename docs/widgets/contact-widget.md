---
title: Contact widget
description: The Zooza contact widget — a contact form for your website that turns every enquiry into a contact in Zooza, with campaign attribution, hidden fields and invisible spam protection.
sidebar_position: 8
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AiPrompt from '@site/src/components/AiPrompt';

# Contact widget

**Replace the generic contact form on your website with a Zooza contact form. Every enquiry becomes a contact in Zooza, together with the page it was sent from and the campaign that brought the visitor, so your team can follow it up.**

What the form contains — its fields, consents and what happens after it is sent — is set up in the Zooza app, in a **contact form configuration**. The embed code only decides where the form appears and, optionally, which configuration it shows. Changes you make to a configuration show up on your website straight away, without touching the embed code.

## Installation

### WordPress

The `[zooza]` shortcode does not support the contact widget. Paste the [embed code](#embed-code) into a **Custom HTML** block on the page instead.

### Embed code

Embed this widget with a placeholder element and the Zooza loader. The loader can sit in the `<body>` right after the placeholder, or in the `<head>` so the widget starts loading earlier. See [Choosing an embed method](./embed-methods.md) if you are not sure which one to use.

| Placeholder | Description | Example Value |
|---|---|---|
| `YOUR_API_KEY` | Replace with the API key found in the application under `Publish > Widget`. | `abc123xyz` |
| `ZOOZA_API_URL` | Replace with the Zooza API URL for your region: Europe: `https://api.zooza.app`, UK: `https://uk.api.zooza.app`, UAE: `https://asia.api.zooza.app` | `https://api.zooza.app` |

<Tabs groupId="embed-method">
  <TabItem value="body" label="Body only" default>

Place the placeholder and the loader in the `<body>` of your page, where you want the form to appear.

```html
<div data-zooza-widget='contact' data-zooza-id='YOUR_API_KEY'></div>
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

  </TabItem>
  <TabItem value="head-body" label="Head + body">

Place the loader in the `<head>` of your page:

```html
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

Then place the placeholder in the `<body>`, where you want the form to appear:

```html
<div data-zooza-widget='contact' data-zooza-id='YOUR_API_KEY'></div>
```

  </TabItem>
</Tabs>

This embed shows the configuration selected for the widget in the app, or your company's default one. To show a specific configuration on a page, add [`data-zooza-config-id`](#config_id) to the placeholder. Initialisation options and [hidden field values](#hidden-fields) are also set directly on the placeholder as `data-zooza-*` attributes.

The loader works out the API host for your region from its own `src`. In the rare case you need a different host, set it with `data-zooza-api-url` on the placeholder.

:::note Placeholder embed only
The contact widget has no legacy script snippet. Use the placeholder and loader shown above.
:::

:::warning One contact form per page
Place only one contact placeholder on a page. If a page contains more than one, the first renders the form and every other one shows the notice _"Only one contact form can be shown per page."_ along with a warning in the browser console.
:::

<AiPrompt task="Embed the contact widget into my site">{`I'm replacing the contact form on my website with the Zooza contact widget.

Read the full Zooza widget & API documentation first for context:
https://docs.zooza.online/llms-full.txt

Here is the embed snippet I need to install:

<div data-zooza-widget='contact' data-zooza-id='YOUR_API_KEY'></div>
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>

Tasks:
1. Find my current contact form and tell me exactly what to remove and where to place this snippet instead. Both lines can stay together in the <body>, or the loader <script> can move into <head> so the form starts loading earlier — recommend what fits my site.
2. Replace YOUR_API_KEY with the key from Publish > Widget in my Zooza app — ask me for it.
3. Set ZOOZA_API_URL to my region: Europe https://api.zooza.app, UK https://uk.api.zooza.app, UAE https://asia.api.zooza.app.
4. Make sure no page ends up with more than one contact placeholder.
5. Remind me that my website's domain must be allowed for the contact widget in Zooza (Publish > Widget > Contact form).`}</AiPrompt>

## Which form is shown

The widget decides which configuration to render in this order:

1. The [`config_id`](#config_id) set in the embed code, for example `data-zooza-config-id='12'`
2. The **Contact form configuration** selected in `Publish > Widget > Contact form`
3. Your company's **default configuration**

Every company has a default configuration. It can be edited, but not archived, so a contact placeholder without a `config_id` always has a form to show.

If `config_id` points to a configuration that does not exist or has been archived, the widget shows an error instead of falling back to the default. Archived configurations also stop accepting enquiries.

:::tip Getting the configuration's embed code
Open the configuration in `Settings > Contact forms`. Its **Embed code** card gives you the snippet with the configuration's id and its hidden field attributes already filled in.
:::

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Contact form`.

### URL

The page on your website where the contact form is placed. Its domain is automatically allowed to load the form (see [Additional domains](#additional-domains)).

### Contact form configuration

The configuration this widget shows when the embed code does not set a [`config_id`](#config_id). Leave it on **Company default** to show your default configuration. A configuration set in the embed code always takes precedence.

### Additional domains

The contact form only loads on websites you have allowed. These are always allowed:

- the domain of your widget
- the domain of the [URL](#url) set above

Add every other website where the form should load. Enter the domain without `https://` or a path, for example `example.com`. Subdomains such as `www.example.com` are covered automatically.

On any other domain the form does not load and the widget shows an error instead. The configuration in `Settings > Contact forms` shows where the form was last loaded and where it was last blocked, so you can spot a missing domain.

:::info Staging and local copies of your site
A staging site on a subdomain of an allowed domain, such as `staging.example.com`, is already covered. A staging site on a different domain, or a local development copy, is not — add its domain (for example `example.netlify.app` or `localhost`) if you want to test the contact form there.
:::

### Use CSS

This loads the default Zooza styling. By default this is turned on. The default styling is deliberately minimal: the form inherits your website's font and colours, and any CSS rule on your website overrides it. See [Styling](#styling).

You can download the default css from this URL:

`ZOOZA_API_URL/widgets/v1/css/?widget=YOUR_API_KEY&type=contact`

## Configuring the form

Contact form configurations are managed in `Settings > Contact forms`. Each configuration defines:

| Part | What it controls |
|---|---|
| Standard fields | First name, last name, email, phone and message — each can be turned on and made required |
| Custom fields | Your own fields, in the order you choose (see the types below) |
| Hidden fields | Custom fields the visitor does not see, filled in automatically (see [Hidden fields](#hidden-fields)) |
| Consents | Which of your contact form consents the visitor is asked to accept. Zooza's platform consents are always included |
| After submit | Show a message, or go to a web page |
| Attribution | Whether to remember where the visitor first came from (see [Attribution](#attribution)) |
| Handling | Contact owner, labels, extra notification emails, a to-do for each enquiry and an automatic reply to the visitor |

Custom fields are rendered according to their type:

| Type | Shown as |
|---|---|
| `text` | Single-line text input |
| `long_text` | Multi-line text area |
| `number` | Number input |
| `date` | Date input |
| `boolean` | Single checkbox |
| `select` | Drop-down list — one option |
| `multiselect` | Checkbox list — any number of options |

Custom field labels and options, consent texts and the success message are shown exactly as they are written in the configuration. If the success message is left empty, the widget shows a translated _"Thank you, we've received your message."_ instead. Standard field labels, buttons and validation messages come from the widget's own texts, which you can change with [`translations`](#translations).

The email field suggests a correction for common typos — a visitor who types `name@gmial.com` is offered _"Did you mean name@gmail.com?"_ with one click. Phone is a single input, with no separate country picker.

Required fields and mandatory consents are checked in the browser before the form is sent, and again by Zooza. Errors appear next to the field concerned so the visitor can fix them and send the form again.

## Hidden fields

A hidden field is a custom field that is not shown to the visitor. Its value is filled in automatically from the **value source** chosen for it in the configuration:

| Value source | Where the value comes from | Example |
|---|---|---|
| URL parameter | A query parameter of the page URL | Source name `ref` reads `https://example.com/contact?ref=newsletter` |
| Cookie | A cookie on your website | Source name `partner_id` reads the `partner_id` cookie |
| Embed code attribute | A `data-zooza-field-<source name>` attribute on the placeholder | Source name `location` reads `data-zooza-field-location` |
| Fixed value | The value entered in the configuration | Always `website` |

The embed code attribute lets you reuse one configuration on several pages and still tell the enquiries apart. For example, with a hidden field whose source name is `location`:

```html
<!-- on the London page -->
<div data-zooza-widget='contact'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-config-id='12'
     data-zooza-field-location='london'></div>

<!-- on the Paris page -->
<div data-zooza-widget='contact'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-config-id='12'
     data-zooza-field-location='paris'></div>
```

- Source names use lowercase letters, numbers, hyphens and underscores only, up to 40 characters. In the attribute name, hyphens and underscores are interchangeable: source name `promo_code` is read from `data-zooza-field-promo-code`.
- A cookie can only be read if it is set on your website's domain and is not `HttpOnly`.
- If the source has no value — the URL parameter is missing, the cookie is not set — the field is sent empty.

:::note The embed code cannot change the form
Embed code attributes and URL parameters only supply **values** for hidden fields that the configuration already defines. They cannot add fields, change which fields are required, change consents, or change where the visitor is sent after submitting. Those always come from the configuration in the Zooza app.
:::

## Attribution

Every enquiry records where it came from:

| Value | Source |
|---|---|
| `page_url` | The address of the page the form was sent from |
| `referrer` | The page the visitor came from, as reported by the browser |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | UTM parameters in the page URL |
| `fbclid` | Meta (Facebook) click id in the page URL |
| `gclid` | Google Ads click id in the page URL |

By default, campaign parameters are read from the URL of the page where the form is sent. Nothing is stored in the visitor's browser. This covers the common case where a campaign link leads straight to the page with the form.

### Remembering where the visitor first came from

When a visitor arrives on one page and sends the form on another, the campaign parameters are no longer in the URL. Turn on **Remember where the visitor first came from** in the configuration to keep them:

- The first time the widget loads with campaign parameters in the URL, it stores them in the visitor's `localStorage` under the key `zooza_contact_first_touch`. Only the campaign parameters listed above are stored — no personal data, page URL or referrer.
- Later visits with different campaign parameters do not overwrite them. The first campaign wins.
- They are kept for the number of days set in **Remember for (days)**: from 1 to 90, 30 by default. After that, the next campaign parameters replace them.

Campaign parameters are captured only on pages where the contact widget is embedded. If your campaign links point to a page without the form, add the form to that page, or link to the page with the form.

:::warning Consent
Storing campaign parameters in the visitor's browser is generally treated as marketing tracking. Turn this option on only if your website asks visitors for consent to it, for example through your cookie consent manager.
:::

## Spam protection

The contact widget works with Zooza's invisible spam protection. There is no CAPTCHA and nothing for you to set up.

- **Sending can take a moment.** A form sent very quickly after the page loads may pause briefly before it goes through. This is expected.
- **Don't reveal hidden elements.** The form contains elements that are hidden on purpose. Don't add CSS or scripts that make hidden inputs inside the widget visible.
- **Test with realistic enquiries.** An enquiry Zooza classifies as spam gets the same success message and [analytics events](#analytics) as a genuine one, but never appears among your contacts. If a test enquiry is missing, send one that reads like a real message.
- **Page caching is fine.** The widget fetches everything it needs each time the page loads.

## Initialisation options

### `config_id`

_Type: Number_

The id of the contact form configuration to show. When it is not set, the widget shows the configuration selected in the app or your company's default — see [Which form is shown](#which-form-is-shown).

| Value | Description | Example Value |
|---|---|---|
| `CONFIG_ID` | Id of a contact form configuration from `Settings > Contact forms` | `12` |

<Tabs groupId="config-surface">
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='contact'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-config-id='CONFIG_ID'></div>
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```javascript
<script>
    window.ZOOZA = {
        config_id: CONFIG_ID
    }
</script>
```

  </TabItem>
  <TabItem value="url" label="URL Query">

```plaintext
https://sample-site.com/contact?config_id=CONFIG_ID
```

  </TabItem>
</Tabs>

### `lang`

_Type: String (BCP 47 locale code)_

Language of the widget is defined by your Zooza account. You can change this language in `Settings > General > Language`. However, you can override widget's language by setting its `lang` property to one of [supported languages](../enums.md#supported-languages).

The language the form is displayed in is also sent with the enquiry, so the automatic reply to the visitor is sent in the same language.

| Value | Description | Example Value |
|---|---|---|
| `LANGUAGE_CODE` | [Language code](../enums.md#supported-languages) of your choice | `en-EN` |

<Tabs groupId="config-surface">
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='contact'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-lang='en-EN'></div>
```

  </TabItem>
  <TabItem value="url" label="URL Query">

```plaintext
https://sample-site.com/contact?lang=LANGUAGE_CODE
```

  </TabItem>
  <TabItem value="html" label="HTML">

```html
<html lang="LANGUAGE_CODE">
</html>
```

  </TabItem>
</Tabs>

:::info How display language is determined
The widget's language is determined in this order:

1. URL Query `lang` parameter
2. `lang` option, set on the placeholder or in `window.ZOOZA`
3. `lang` attribute of `html` tag
4. language set in the Zooza
:::

### `translations`

_Type: Object_

:::note JavaScript only
This option takes an object of custom strings. It cannot be set as a `data-zooza-*` attribute on the placeholder — HTML attributes are strings. Use a `<script>` block alongside the placeholder.
:::

Replaces the widget's own texts: buttons, standard field labels and validation messages. Custom field labels, options, consent texts and the success message are written in the configuration, so change them there instead.

| Key | Default text |
|---|---|
| `contact.submit` | Send |
| `contact.submitting` | Sending… |
| `contact.success_default` | Thank you, we've received your message. |
| `contact.error_required` | This field is required. |
| `contact.error_invalid_email` | Please enter a valid email address. |
| `contact.error_invalid_phone` | Please enter a valid phone number. |
| `contact.error_invalid_number` | Please enter a valid number. |
| `contact.error_invalid_date` | Please enter a valid date. |
| `contact.error_consent_required` | Please accept this to continue. |
| `contact.error_generic` | Something went wrong. Please try again. |
| `contact.email_did_you_mean` | Did you mean %1? |
| `contact.duplicate_notice` | Only one contact form can be shown per page. |
| `global.first_name` | First name label |
| `global.last_name` | Last name label |
| `global.email` | Email label |
| `global.phone` | Phone label |
| `global.note` | Message label |

```javascript
<script>
    window.ZOOZA = {
        translations: {
            'contact.submit' : 'Send enquiry',
            'global.note' : 'How can we help?',
        }
    }
</script>
```

:::note How to find a key
Enable [`print_debug`](#print_debug) and open your browser's console. Every text the widget displays is printed as `Text Key: contact.submit Translation: Send`.
:::

### `print_debug`

_Type: Bool_

Prints additional debug information to the browser's console. It is especially useful for finding translation keys.

<Tabs groupId="config-surface">
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='contact'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-print-debug='true'></div>
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```javascript
<script>
    window.ZOOZA = {
        print_debug: true|false
    }
</script>
```

  </TabItem>
</Tabs>

## Events and callbacks

The contact widget has no JavaScript callbacks or custom DOM events. To react to the form being shown or sent, use the [analytics events](#analytics), which the widget pushes to `window.dataLayer` whenever the page has one.

## Styling

The contact widget renders directly into your page (no iframe), and its default styling is built to be overridden:

- Every default rule has zero specificity, so any rule in your stylesheet wins — no `!important` needed.
- By default the form inherits the font and text colour of the surrounding page.
- The form is at most `660px` wide and centred in the placeholder.

### Theme variables

The quickest way to match your brand is to set CSS custom properties on `.zooza-contact-widget`, and style the submit button through its class:

```css
.zooza-contact-widget {
    --zooza-accent: #FA6900;
    --zooza-border-color: #d0d0d0;
    --zooza-radius: 5px;
    --zooza-font-family: 'DM Sans', sans-serif;
    --zooza-max-width: 100%;
}

.zooza-contact-button__primary {
    background: #FA6900;
    color: #fff;
}
```

| Variable | Default | Controls |
|---|---|---|
| `--zooza-font-family` | inherited | Font of the whole form |
| `--zooza-font-size` | `1em` | Base font size |
| `--zooza-line-height` | `1.4` | Line height |
| `--zooza-text-color` | `currentColor` | Text colour |
| `--zooza-accent` | `currentColor` | Submit button border, checkboxes and radio buttons, focus ring |
| `--zooza-border-color` | `currentColor` | Borders of inputs, buttons and messages |
| `--zooza-border-width` | `1px` | Input border width |
| `--zooza-radius` | `0.25em` | Corner radius of inputs and buttons |
| `--zooza-gap` | `1em` | Space between fields |
| `--zooza-field-gap` | `0.35em` | Space between a label and its input |
| `--zooza-control-padding` | `0.5em 0.75em` | Padding inside inputs and buttons |
| `--zooza-control-background` | `transparent` | Input background |
| `--zooza-muted-opacity` | `0.7` | Opacity of help texts, disabled controls and the loading state |
| `--zooza-error-color` | `currentColor` | Error messages |
| `--zooza-success-color` | `currentColor` | Success message |
| `--zooza-focus-ring` | `2px solid var(--zooza-accent)` | Focus outline |
| `--zooza-max-width` | `660px` | Maximum width of the form |

### Class names

Every element carries two classes: a shared one that is the same in all Zooza widgets built this way, and one scoped to the contact widget. Variants add a `__variant` suffix. Use the `zooza-contact-*` classes to style only the contact form.

| Element | Classes |
|---|---|
| Widget root | `.zooza-widget` `.zooza-contact-widget` |
| Form | `.zooza-form` `.zooza-contact-form` |
| Field wrapper | `.zooza-field` `.zooza-contact-field` |
| Label | `.zooza-label` `.zooza-contact-label` |
| Required marker | `.zooza-required` `.zooza-contact-required` |
| Text, number and date inputs | `.zooza-input` `.zooza-contact-input`, e.g. `.zooza-contact-input__date` |
| Message and long text | `.zooza-textarea` `.zooza-contact-textarea` |
| Drop-down | `.zooza-select` `.zooza-contact-select` |
| Checkbox list | `.zooza-fieldset__multiselect` `.zooza-contact-fieldset__multiselect` |
| Consents | `.zooza-agreements` `.zooza-contact-agreements`, each `.zooza-agreement` |
| Field error | `.zooza-error` `.zooza-contact-error` |
| Submit button | `.zooza-button__primary` `.zooza-contact-button__primary` |
| Messages | `.zooza-message__error`, `.zooza-message__success`, `.zooza-message__notice` |

The widget root also has a `data-status` attribute — `loading`, `ready`, `error` or `success` — which you can use to style each state:

```css
.zooza-contact-widget[data-status='success'] {
    padding: 2em;
    background: #f4faf9;
}
```

<AiPrompt task="Style the contact widget to match my site">{`I've embedded the Zooza contact widget (contact form) and now I want it to match my site's existing design.

Read the Zooza widget documentation for the contact widget's theme variables and class names:
https://docs.zooza.online/llms-full.txt

Tasks:
1. Inspect my site's current design tokens — primary colour, fonts, border radius, spacing — and how my existing forms and buttons look.
2. Write CSS that sets the --zooza-* custom properties on .zooza-contact-widget to match, and add rules on the zooza-contact-* classes only where the variables are not enough.
3. Do not use !important, and do not make any hidden inputs inside the widget visible.
4. Keep it accessible (visible focus, readable error colour) and responsive on mobile.

My brand: [describe your colours and fonts here, or point me at your stylesheet].`}</AiPrompt>

## Analytics

The contact widget triggers the following events for Google Tag Manager's DataLayer, Google Analytics (`gtag`) and Meta's Pixel (as a custom event). Nothing needs to be set up in Zooza — the events are sent to whichever of these tools are already on the page.

| Event | Description | Event data |
|---|---|---|
| `zooza_event_contact_form_view` | Triggered once when the form is displayed to the visitor | `zooza_contact_form_view`: true; `zooza_contact_form_id`: id of the configuration shown |
| `zooza_event_contact_form_submit_start` | Triggered when the visitor submits a form that passed validation, before it is sent | `zooza_contact_form_submit_start`: true; `zooza_contact_form_id` |
| `zooza_event_contact_form_submitted` | Triggered when the enquiry is accepted, before the success message is shown or the visitor is redirected | `zooza_contact_form_submitted`: true; `zooza_contact_form_id` |

Event data never contains the visitor's name, email, phone or message.

Use `zooza_event_contact_form_submitted` as your lead conversion. In Google Tag Manager, create a **Custom Event** trigger with that event name and use it for your GA4 or Google Ads conversion tag. Use `zooza_contact_form_id` to tell apart forms on different pages.

If the configuration redirects the visitor after submitting, the page changes right after the event is pushed. Tags that must fire on the conversion should use that trigger, not a later page view.

<AiPrompt task="Track contact form enquiries as conversions">{`I want to track enquiries sent through the Zooza contact widget on my website as lead conversions.

Read the Zooza widget documentation for the contact widget's analytics events:
https://docs.zooza.online/llms-full.txt

My setup: [Google Tag Manager / GA4 via gtag / Meta Pixel — describe what is on your site].

Tasks:
1. Tell me step by step how to use the zooza_event_contact_form_submitted event as a lead conversion in my setup (for GTM: a Custom Event trigger and the tags that use it).
2. Show me how to use zooza_contact_form_id to report enquiries per form.
3. If I use Meta Pixel, explain how to turn the zooza_event_contact_form_submitted custom event into a Lead conversion.`}</AiPrompt>
