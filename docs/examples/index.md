---
title: Integration examples
description: Real-world patterns for building booking forms, trial sign-ups, branded course tiles and chatbot integrations on top of Zooza widgets and the REST API — with copy-paste code.
sidebar_label: Overview
---

# Integration examples

Each example below is a pattern that Zooza customers run on their own websites today. The brand, data and code are fictional, so you can copy them as a starting point. Every setting and callback they use is documented in the widget and API reference, and linked from each page.

All examples use the same made-up business, **Little Movers**, which runs weekly movement classes for children aged 1–6 in several cities.

## Booking & trials

- [Multi-step trial booking form](./multi-step-trial-booking.md): a step-by-step sign-up that only offers trial classes. Configuration only, no custom code.
- [Branded course and session tiles](./branded-booking-tiles.md): make the booking widget look like the rest of your site, starting with CSS and then replacing whole tiles with your own templates.

## Apps & integrations

- [Give your AI chatbot the logged-in client](./chatbot-logged-in-client.md): pass the client who is signed in to Zooza into your website chatbot, so it can greet them by name and look up their bookings safely.

## Before you start

1. Create a free account at [signup.zooza.online](https://signup.zooza.online).
2. Copy your widget key from **Team & Settings > Publish**. For REST API examples, [request a REST API key](../api/authentication.md#obtaining-your-rest-api-key).
3. Choose your region's API URL: Europe `https://api.zooza.app`, UK `https://uk.api.zooza.app`, UAE `https://asia.api.zooza.app`.
