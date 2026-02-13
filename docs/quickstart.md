---
title: Quickstart
description: Get started with Zooza — embed a widget or make your first REST API call.
---

# Quickstart

Zooza offers two integration approaches. Choose the one that fits your needs — or use both.

---

## Widgets quickstart

### Embed your first widget (5 min)

Widgets are pre-built Zooza components that you embed directly on your website. No authentication or server code required.

#### Prerequisites

- A Zooza account with at least one programme
- An HTTPS website to embed on

#### Step 1: Get your widget API key

1. Log into the [Zooza app](https://app.zooza.com).
2. Go to **Team & Settings > Publish**.
3. Click on your widget name to open the detail view.
4. Copy your **API key**.

![Publish screen in Zooza](assets/images/publish-widgets.png)

#### Step 2: Add the embed code

Paste this script into your HTML page where you want the registration form to appear. Replace `YOUR_API_KEY` with your actual widget API key, and `ZOOZA_API_URL` with your [region's base URL](concepts.md#api-regions).

```html
<script data-version="v1" data-widget-id="zooza" id="YOUR_API_KEY" type="text/javascript">
(function() {
  function async_load() {
    document.body.setAttribute("data-zooza-api-url", "ZOOZA_API_URL");
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src =
      document.body.getAttribute("data-zooza-api-url") +
      "/widgets/v1/?type=registration&ref=" +
      encodeURIComponent(window.location.href);
    var embedder = document.getElementById("YOUR_API_KEY");
    embedder.parentNode.insertBefore(s, embedder);
  }
  if (window.attachEvent) {
    window.attachEvent("onload", async_load);
  } else {
    window.addEventListener("load", async_load, false);
  }
})();
</script>
```

For the Europe region, `ZOOZA_API_URL` is `https://api.zooza.app`.

!!! tip "Other widget types"
    Change the `type=registration` parameter to embed different widgets: `calendar`, `profile`, `video`, `sales`, `map`.

![Embed code in Zooza](assets/images/widget-embed-code.png)

#### Step 3: Verify

Open your page in a browser. You should see a Zooza registration form displaying your programmes.

#### Next steps

- [Customise your widget](widgets/registration-widget.md) with filters and styling
- Explore other widgets: [Calendar](widgets/calendar-widget.md), [Map](widgets/map-widget.md), [Profile](widgets/profile-widget.md)
- Learn [Zooza terminology](concepts.md)

---

## REST API quickstart

### Make your first API call (10 min)

The REST API gives you full programmatic access to Zooza data — for admin tools, custom customer journeys, data caching, and more.

!!! warning "Different API keys"
    The REST API uses a **different API key** from widgets. A widget API key cannot be used for REST API calls.

#### Prerequisites

- A Zooza account with at least one programme
- Your **REST API key** and **client secret** — contact [Zooza support](mailto:support@zooza.com) to receive both
- cURL or Node.js installed

#### Step 1: Authenticate

Use your client secret to obtain a token:

=== "cURL"

    ```bash
    curl -X POST https://api.zooza.app/v1/login \
      -H "Content-Type: application/json" \
      -H "X-ZOOZA-API-KEY: your_api_key" \
      -d '{
        "login": "your_email@example.com",
        "verification_method": "client_secret",
        "client_secret": "your_client_secret"
      }'
    ```

=== "JavaScript"

    ```javascript
    const response = await fetch("https://api.zooza.app/v1/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ZOOZA-API-KEY": "your_api_key",
      },
      body: JSON.stringify({
        login: "your_email@example.com",
        verification_method: "client_secret",
        client_secret: "your_client_secret",
      }),
    });
    const data = await response.json();
    console.log("Token:", data.token);
    ```

<!-- TODO: add example — confirm response shape -->

Save the `token` from the response — you'll need it for all subsequent requests.

#### Step 2: Get your company ID

=== "cURL"

    ```bash
    curl -X GET https://api.zooza.app/v1/user \
      -H "X-ZOOZA-API-KEY: your_api_key" \
      -H "X-ZOOZA-TOKEN: your_token"
    ```

=== "JavaScript"

    ```javascript
    const response = await fetch("https://api.zooza.app/v1/user", {
      headers: {
        "X-ZOOZA-API-KEY": "your_api_key",
        "X-ZOOZA-TOKEN": "your_token",
      },
    });
    const data = await response.json();
    console.log("Companies:", data.user.companies);
    ```

Find your company in the `user.companies` array and note the `id`.

#### Step 3: Make an authenticated request

Now use all three headers to fetch your programmes:

<!-- TODO: add example — pick a simple GET endpoint like /v1/courses -->

=== "cURL"

    ```bash
    curl -X GET https://api.zooza.app/v1/courses \
      -H "X-ZOOZA-API-KEY: your_api_key" \
      -H "X-ZOOZA-TOKEN: your_token" \
      -H "X-ZOOZA-COMPANY: your_company_id"
    ```

=== "JavaScript"

    ```javascript
    const response = await fetch("https://api.zooza.app/v1/courses", {
      headers: {
        "X-ZOOZA-API-KEY": "your_api_key",
        "X-ZOOZA-TOKEN": "your_token",
        "X-ZOOZA-COMPANY": "your_company_id",
      },
    });
    const courses = await response.json();
    console.log("Courses:", courses);
    ```

You should see a list of your programmes (called "courses" in the API).

#### Next steps

- [Authentication guide](api/authentication.md) — all login methods explained
- [API endpoints](api/endpoints.md) — full reference
- [Error handling](api/errors.md) — status codes and troubleshooting
- [Concepts and glossary](concepts.md) — understand Zooza terminology
