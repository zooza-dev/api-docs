---
title: Zooza Developer Docs
description: Documentation for implementing Zooza's widgets and APIs.
authors:
  - Martin Rapavý
date: 2025-10-05
updated: 2025-12-05
---

# Zooza developer docs

Zooza is a platform for managing courses, registrations, and payments. These docs cover everything you need to integrate Zooza into your website or build custom applications on top of the Zooza REST API. You can use widgets, the API, or both.

## Choose your integration path

!!! tip "Embed booking forms, calendars, and more — Widgets"
    Drop pre-built Zooza components onto your website with a script tag. No server code or authentication needed.

    [Get started with widgets](quickstart.md#widgets-quickstart){ .md-button }

!!! tip "Programmatic access to Zooza data — REST API"
    Build admin tools, custom customer journeys, cache data to your site, or automate workflows.

    [Get started with the API](quickstart.md#rest-api-quickstart){ .md-button }

## Learn the fundamentals

[**Concepts and glossary**](concepts.md)
:   Definitions for all Zooza-specific terms — programme, class, session, blocks, and more.

[**Quickstart guide**](quickstart.md)
:   Step-by-step instructions to embed your first widget or make your first API call.

## Widgets

[**Overview**](widgets/index.md)
:   How widgets work, embedding basics, and widget groups.

[**Registration widget**](widgets/registration-widget.md)
:   Allows users to register or book services directly from your website.

[**Calendar widget**](widgets/calendar-widget.md)
:   Displays available dates and times for your classes and sessions.

[**Map widget**](widgets/map-widget.md)
:   Shows locations where your services are available and lets customers search by location.

[**Profile widget**](widgets/profile-widget.md)
:   Lets users view and manage their personal information and bookings.

[**Video widget**](widgets/video-widget.md)
:   Embeds video content related to your services.

[**Checkout widget**](widgets/checkout-widget.md)
:   Handles purchases for digital products and service orders.

## API reference

[**API overview**](api/index.md)
:   Integration paths, base URLs, and how to decide between widgets and API.

[**Authentication**](api/authentication.md)
:   How to obtain API keys, tokens, and authenticate your requests.

[**Endpoints**](api/endpoints.md)
:   Full reference of available API operations.

[**Error handling**](api/errors.md)
:   HTTP status codes, error formats, and troubleshooting tips.

[**Enums reference**](enums.md)
:   All enumeration values used across the API.
