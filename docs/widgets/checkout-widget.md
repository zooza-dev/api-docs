---
title: Checkout widget
description: The Zooza checkout widget — sells your products, including entry passes with a payment plan, and takes the buyer through payment.
sidebar_position: 7
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AiPrompt from '@site/src/components/AiPrompt';

# Checkout widget

**Sell your products directly on your website. The checkout widget shows a product with its options — for example an entry pass with a choice of pack size and payment plan — collects the buyer's details, consents and payment method, creates the order and takes the buyer through payment.**

Which product the widget sells is decided by the URL of the page it is on, so one checkout page can sell every product: link to it with [`?product=`](#product) and the widget shows that product. The [profile widget](./profile-widget.md) links into the checkout this way.

:::info Replaces the v2 checkout
This widget is loaded from `/widgets/v1/` and replaces the [legacy v2 checkout widget](./checkout-widget-v2.md). Existing v2 embeds keep working, but are no longer developed. See [Migrating from the v2 checkout](#migrating-from-the-v2-checkout).
:::

## Installation

### WordPress

The WordPress plugin's checkout page setting and the `[zooza type="checkout"]` shortcode still embed the [legacy v2 checkout](./checkout-widget-v2.md). To use this widget on WordPress, paste the [embed code](#embed-code) into a **Custom HTML** block on the page instead.

### Embed code

Embed this widget with a placeholder element and the Zooza loader. The loader can sit in the `<body>` right after the placeholder, or in the `<head>` so the widget starts loading earlier. See [Choosing an embed method](./embed-methods.md) if you are not sure which one to use.

| Placeholder | Description | Example Value |
|---|---|---|
| `YOUR_API_KEY` | Replace with the API key found in the application under `Publish > Widget`. | `abc123xyz` |
| `ZOOZA_API_URL` | Replace with the Zooza API URL for your region: Europe: `https://api.zooza.app`, UK: `https://uk.api.zooza.app`, UAE: `https://asia.api.zooza.app` | `https://api.zooza.app` |

<Tabs groupId="embed-method">
  <TabItem value="body" label="Body only" default>

Place the placeholder and the loader in the `<body>` of your page, where you want the checkout to appear.

```html
<div data-zooza-widget='checkout' data-zooza-id='YOUR_API_KEY'></div>
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

  </TabItem>
  <TabItem value="head-body" label="Head + body">

Place the loader in the `<head>` of your page:

```html
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>
```

Then place the placeholder in the `<body>`, where you want the checkout to appear:

```html
<div data-zooza-widget='checkout' data-zooza-id='YOUR_API_KEY'></div>
```

  </TabItem>
</Tabs>

The product to sell is not part of the embed code — it comes from the [page URL](#url-parameters). The placeholder accepts the [`lang`](#lang) and [`translations`](#translations) options as `data-zooza-*` attributes.

The loader works out the API host for your region from its own `src`. In the rare case you need a different host, set it with `data-zooza-api-url` on the placeholder.

:::warning One checkout per page
Place only one checkout placeholder on a page. If a page contains more than one, only the first one shows the checkout; the others stay empty.
:::

<AiPrompt task="Embed the checkout widget into my site">{`I'm adding the Zooza checkout widget to my website.

Read the full Zooza widget & API documentation first for context:
https://docs.zooza.online/llms-full.txt

Here is the embed snippet I need to install:

<div data-zooza-widget='checkout' data-zooza-id='YOUR_API_KEY'></div>
<script async src='ZOOZA_API_URL/widgets/v1/loader.js'></script>

Tasks:
1. Help me create a dedicated checkout page and tell me exactly where to place this snippet on it. Both lines can stay together in the <body>, or the loader <script> can move into <head> so the widget starts loading earlier — recommend what fits my site.
2. Replace YOUR_API_KEY with the key from Publish > Widget in my Zooza app — ask me for it.
3. Set ZOOZA_API_URL to my region: Europe https://api.zooza.app, UK https://uk.api.zooza.app, UAE https://asia.api.zooza.app.
4. Show me how to link to this page for a specific product with ?product=PRODUCT_ID, and how to add ?return_url= so buyers come back to my site after paying.
5. Make sure the page contains only one checkout placeholder.`}</AiPrompt>

## How the checkout works

1. **Product.** The widget shows the product from the [`product`](#product) URL parameter, with its description and price. If the product has options — such as an entry pass offered in several packs, each with its payment plans — the buyer picks one; the first offer is preselected. Without a `product` parameter, the buyer first [chooses a product from a list](#without-a-product).
2. **Buyer details.** Email, first name, last name and phone, all required. A free product asks for the email only.
3. **Price.** The total is calculated by Zooza for the chosen option, including what is paid now and what follows on a payment plan, and any discount.
4. **Payment method.** Card, online bank transfer or cash, depending on what the product allows. If only one method is available, it is preselected.
5. **Consents.** The agreements set up for checkout in the Zooza app. Agreements the buyer has already accepted are not shown again.
6. **Order.** When the buyer submits, the widget creates the order. Depending on the payment method, the buyer then pays by card directly in the widget, is sent to the payment gateway, or — for a free product or cash — goes straight to the thank-you screen.
7. **Thank you.** After a successful payment the buyer sees a thank-you screen with a **Continue** button, which leads to the [`return_url`](#return_url) or, without one, to your [profile widget](./profile-widget.md).

### What it can sell

Any product that is available and enabled for the checkout in the Zooza app, including:

- entry passes, with a choice of pack and payment plan
- entrance vouchers and prepaid credit
- services
- digital products such as documents and videos
- free products, where the buyer only leaves an email

Products that are unavailable, or not enabled for the checkout, are not shown — linking to one shows an error.

:::note No coupon field
The checkout has no field for entering a discount or voucher code.
:::

### Without a product

If the page is opened without a `product` parameter, the widget shows a list of all products available in the checkout. When the buyer picks one, the page reloads with `?product=` set to that product, keeping any other parameters such as `return_url`.

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Checkout`.

### URL

The page on your website where the checkout widget is placed. Zooza uses it to [link your customers](index.md#importance-of-a-url) to the checkout — for example, the profile widget builds its buy links from it.

### Use CSS

This loads the default Zooza styling. By default this is turned on. The default styling is deliberately minimal: the checkout inherits your website's font and colours, and any CSS rule on your website overrides it. See [Styling](#styling).

You can download the default css from this URL:

`ZOOZA_API_URL/widgets/v1/css/?widget=YOUR_API_KEY&type=checkout`

## URL parameters

The checkout reads what to sell, and where to send the buyer afterwards, from the URL of the page it is on. These parameters cannot be set on the placeholder.

### `product`

_Type: Integer_

The product to sell. Without it, the widget shows a [list of products](#without-a-product).

| Value | Description | Example Value |
|---|---|---|
| `PRODUCT_ID` | Id of the product to sell. | `123` |

```plaintext
https://sample-site.com/checkout?product=PRODUCT_ID
```

### `return_url`

_Type: String (URL)_

Where the **Continue** button on the thank-you screen leads. The buyer is not redirected automatically — they continue when they click the button. Without it, the button leads to your [profile widget](./profile-widget.md).

The URL must start with `http://` or `https://` and be on the same domain as the checkout page or as your profile widget. Any other value is ignored. Remember to URL-encode it.

| Value | Description | Example Value |
|---|---|---|
| `URL` | Page to continue to after a successful order. | `https://sample-site.com/thank-you` |

```plaintext
https://sample-site.com/checkout?product=123&return_url=https%3A%2F%2Fsample-site.com%2Fthank-you
```

The `return_url` is remembered while the buyer is away at the payment gateway, so it still applies when they come back.

### `currency`

_Type: String (Three letter ISO 4217 code)_

Sets the currency the checkout is presented in. Supported values are `EUR`, `CZK`, `RON`, `GBP`, `PLN` and `HUF`; any other value is ignored. Without it, the currency of your company's region is used.

```plaintext
https://sample-site.com/checkout?product=123&currency=CZK
```

### `lang`

_Type: String_

The language of the widget. It can also be set on the placeholder as `data-zooza-lang`. Without it, the language of your page (`<html lang>`) is used.

<Tabs groupId="config-surface">
  <TabItem value="url" label="URL Query">

```plaintext
https://sample-site.com/checkout?product=123&lang=en
```

  </TabItem>
  <TabItem value="data" label="Data attribute">

```html
<div data-zooza-widget='checkout'
     data-zooza-id='YOUR_API_KEY'
     data-zooza-lang='en'></div>
```

  </TabItem>
</Tabs>

### `translations`

Overrides individual texts of the widget. Set it in `window.ZOOZA` before the loader runs:

```html
<script>
window.ZOOZA = {
    translations: {
        'checkout.your_order': 'Your pass'
    }
};
</script>
```

:::note Set by Zooza during payment
`r` and `payment_response` are added to the URL by the checkout itself — `r` identifies a payment in progress and `payment_response` carries the result back from the payment gateway. Do not add them to your links.
:::

## Migrating from the v2 checkout

To move a page from the [legacy v2 checkout](./checkout-widget-v2.md) to this widget:

1. Replace the embed code on the page with the [v1 embed code](#embed-code). If you already use the placeholder embed, it is enough to change `/widgets/v2/loader.js` to `/widgets/v1/loader.js`.
2. Keep your links — `?product=` and `?currency=` work the same way. You can now add [`return_url`](#return_url).
3. Rewrite your custom CSS. The v1 checkout uses [new class names](#class-names), so CSS written for the v2 checkout no longer applies.
4. On WordPress, replace the `[zooza type="checkout"]` shortcode with the embed code in a **Custom HTML** block, and clear the checkout page in the plugin settings so the plugin does not add the v2 checkout as well.

## Styling

The checkout widget renders directly into your page (no iframe), and its default styling is built to be overridden:

- Every default rule has zero specificity, so any rule in your stylesheet wins — no `!important` needed.
- By default the checkout inherits the font and text colour of the surrounding page.
- The checkout is at most `660px` wide and centred in the placeholder.

### Theme variables

The quickest way to match your brand is to set CSS custom properties on `.zooza-checkout-widget`, and style the buttons through their class:

```css
.zooza-checkout-widget {
    --zooza-accent: #FA6900;
    --zooza-border-color: #d0d0d0;
    --zooza-radius: 5px;
    --zooza-font-family: 'DM Sans', sans-serif;
}

.zooza-checkout-button__primary {
    background: #FA6900;
    color: #fff;
}
```

The checkout uses the same theme variables as the [contact widget](./contact-widget.md#theme-variables), for example `--zooza-font-family`, `--zooza-accent`, `--zooza-border-color`, `--zooza-radius`, `--zooza-gap` and `--zooza-max-width`.

### Class names

Every element carries two classes: a shared one that is the same in all Zooza widgets built this way, and one scoped to the checkout widget. Variants add a `__variant` suffix. Use the `zooza-checkout-*` classes to style only the checkout.

| Element | Classes |
|---|---|
| Widget root | `.zooza-widget` `.zooza-checkout-widget` |
| Section | `.zooza-section` `.zooza-checkout-section`, e.g. `.zooza-checkout-section__summary`, `__products`, `__buyer`, `__totals`, `__payment-methods`, `__payment` |
| Section heading | `.zooza-heading` `.zooza-checkout-heading`, e.g. `.zooza-checkout-heading__summary` |
| Order summary | `.zooza-summary` `.zooza-checkout-summary` |
| Price totals | `.zooza-totals` `.zooza-checkout-totals` |
| Buttons | `.zooza-button__primary` `.zooza-checkout-button__primary` |
| Field error | `.zooza-error` `.zooza-checkout-error` |

The product options and the payment method chooser still use the older `zooza_*` class names (for example `.zooza_service_option`). Scope any rules for them under `.zooza-checkout-widget`.

The widget root also has a `data-status` attribute — `loading`, `listing`, `data`, `payment`, `thank_you` or `error` — which you can use to style each step:

```css
.zooza-checkout-widget[data-status='thank_you'] {
    padding: 2em;
    background: #f4faf9;
}
```

<AiPrompt task="Style the checkout widget to match my site">{`I've embedded the Zooza checkout widget and now I want it to match my site's existing design.

Read the Zooza widget documentation for the checkout widget's theme variables and class names:
https://docs.zooza.online/llms-full.txt

Tasks:
1. Inspect my site's current design tokens — primary colour, fonts, border radius, spacing — and how my existing forms and buttons look.
2. Write CSS that sets the --zooza-* custom properties on .zooza-checkout-widget to match, and add rules on the zooza-checkout-* classes only where the variables are not enough.
3. Do not use !important.
4. Keep it accessible (visible focus, readable error colour) and responsive on mobile.

My brand: [describe your colours and fonts here, or point me at your stylesheet].`}</AiPrompt>
