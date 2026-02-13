---
title: Concepts and glossary
description: Definitions for all Zooza-specific terminology used throughout the documentation.
---

# Concepts and glossary

This page defines the key terms and concepts used across Zooza. Many API field names differ from the labels shown in the Zooza app — this glossary maps both.

## Core entities

### Programme (course)

A programme is the top-level entity — what a business sells (e.g. "Beginners Swimming", "Yoga for Adults").

- **API field:** `course` / `course_id`
- The API uses the term **course**, while the Zooza app UI shows **programme**.

### Class (group)

A class is a scheduled instance of a programme, with a specific location, instructor, and capacity.

- **API field:** `schedule` / `schedule_id`
- Example: "Monday 9:00 AM at Main Hall — max 10 participants"

### Session (lesson/event/term)

A session is an individual occurrence within a class — one specific meeting.

- **API field:** `event` / `event_id`

### Place (location/venue)

A physical address or facility where sessions take place.

- **API field:** `place_id`

### Room

An optional subdivision of a place (e.g. "Studio A" within a sports centre).

- **API field:** `room_id`
- In widget URLs, rooms are encoded as `place_id` + `_` + `room_id` (e.g. `123_0` means place 123, no specific room).

### Blocks (segments)

Blocks are subdivisions of sessions within a class. They are used for partial registration or split payments — for example, splitting a year-long course into semesters.

- **Blocks** and **segments** are the same thing.
- Related enum: `registration_display_mode`

---

## Registration and booking concepts

### Registration types

| Type | Description |
|------|-------------|
| **Single event** | One-off session booking |
| **Full term** (`full2`) | Registration for the entire class duration. Most common for ongoing courses. |
| **Open registration** | Ongoing flexible attendance, pay per session |

<!-- TODO: requires clarification — are there other registration types beyond these three? -->

### Trials

Trials let clients experience a course before committing.

- Can be free or paid
- Can cover one or multiple sessions
- Available only for **full term** courses

### Make-up sessions

A make-up session is a replacement lesson — clients can attend a different session when they miss their regular one. Make-up sessions are managed through the [Profile widget](widgets/profile-widget.md).

### Payment schedules

| Type | API value | Description |
|------|-----------|-------------|
| One-time | `single_payment` | Single upfront payment |
| Periodic pre-paid | `in_advance` | Recurring payments billed in advance |
| By attendance | `by_attendance` | Pay per attended session |
| Pay as you go | `pay_as_you_go` | Per-session payment |

**Frequency values:** `monthly`, `quarterly`, `half_yearly`, `yearly`, `after_events`, `absolute`, `segments`

### Billing periods

Billing periods are organizational time periods for grouping courses (e.g. "Autumn 2024", "Summer Camps 2025"). They are visible to organizers only, not to customers.

<!-- TODO: requires clarification — how do billing periods affect API responses? -->

---

## Platform concepts

### Company

A company is the business running Zooza, identified by `company_id`. A single user can belong to multiple companies with different roles.

### API keys

Zooza uses **two distinct types of API keys** that are not interchangeable:

| Key type | Where to find it | Used for |
|----------|-----------------|----------|
| **Widget API key** | **Team & Settings > Publish** — displayed for each widget | Embedding widgets on your website |
| **REST API key** | Provided by Zooza support | Programmatic access via the REST API |

!!! warning
    A widget API key **cannot** be used for REST API calls, and vice versa. They serve completely different purposes.

### Widgets vs REST API

**Widgets** are pre-built embeddable components (registration forms, calendars, profiles, etc.) that you place on your website using a script tag. Widgets require no authentication — just your widget API key in the embed code.

**The REST API** gives you full programmatic access to Zooza data. Use it for:

- Admin and back-office applications
- Customer-facing websites that need custom UI (e.g. caching classes and courses, building custom customer journeys)
- Automated workflows and data synchronisation

The REST API requires authentication with three headers: `X-ZOOZA-API-KEY`, `X-ZOOZA-TOKEN`, `X-ZOOZA-COMPANY`. See the [authentication guide](api/authentication.md) for details.

### Widget group

A widget group is a set of widgets sharing the same widget API key. One group per domain is recommended.

---

## API regions

| Region | Base URL |
|--------|----------|
| Europe | `https://api.zooza.app` |
| UK | `https://uk.api.zooza.app` |
| UAE | `https://asia.api.zooza.app` |
