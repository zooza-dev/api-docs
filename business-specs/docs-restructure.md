# Docs restructure: developer-friendly Zooza documentation

## Context

Zooza supports two integration paths — **Widgets** (embeddable UI) and **API** (custom applications). The current docs are functional but assume Zooza domain knowledge, have no onboarding path, and leave the API section nearly empty. This plan restructures the docs to be developer-friendly with clear terminology, quickstart guides, and runnable examples.

---

## Files to create

| File | Purpose |
|------|---------|
| `docs/concepts.md` | Glossary and domain model — all Zooza terminology defined in one place |
| `docs/quickstart.md` | Two-track quickstart: embed a widget + make your first API call |
| `docs/api/errors.md` | Error codes, troubleshooting, debugging tips |

## Files to modify

| File | Change |
|------|--------|
| `docs/index.md` | Rewrite as landing page with two-path decision guidance |
| `docs/api/index.md` | Rewrite from 4-line stub into API overview with integration types |
| `docs/api/authentication.md` | Move app-type content out, add cURL/JS examples |
| `mkdocs.yml` | Update nav to include new pages |

## Files unchanged

All widget pages, `enums.md`, `endpoints.md`, `overrides/`

---

## Execution order

| Step | File | Depends on |
|------|------|------------|
| 1 | `docs/concepts.md` | Nothing |
| 2 | `docs/api/index.md` | concepts.md |
| 3 | `docs/api/authentication.md` | api/index.md |
| 4 | `docs/api/errors.md` | Nothing |
| 5 | `docs/quickstart.md` | concepts.md, api/index.md, authentication.md |
| 6 | `docs/index.md` | All above |
| 7 | `mkdocs.yml` | All files exist |

---

## Step 1: Create `docs/concepts.md`

Glossary page that all other docs link to. Defines every Zooza-specific term.

### Structure

```
# Concepts and glossary

## Core entities

### Programme (course)
- Top-level entity — what a business sells (e.g. "Beginners Swimming")
- API field: `course` / `course_id`
- Note: API uses "course", the app UI shows "Programme"

### Timetable (class/group)
- Scheduled instance of a programme with location, instructor, capacity
- API field: `schedule` / `schedule_id`
- Example: "Monday 9AM at Main Hall — max 10"

### Session (lesson/event/term)
- Individual occurrence within a timetable
- API field: `event` / `event_id`

### Place (location/venue)
- Physical address/facility
- API field: `place_id`

### Room
- Optional subdivision of a place
- API field: `room_id`
- In widget URLs: `place_id` + `_` + `room_id` (e.g. `123_0` for no specific room)

### Blocks (segments)
- Subdivisions of sessions within a timetable
- Used for partial registration or split payments (e.g. semesters)
- "Blocks" and "segments" are the SAME thing
- Related enum: `registration_display_mode`

## Registration and booking concepts

### Registration types
- **Single event** — one-off session booking
- **Full term (`full2`)** — registration for the entire timetable duration. Most common for ongoing courses.
- **Open registration** — ongoing flexible attendance, pay per session
<!-- TODO: requires clarification — are there other registration types beyond these three? -->

### Trials
- Let clients experience a course before committing
- Can be free or paid, single or multiple sessions
- Available only for Full term courses

### Make-up sessions
- Replacement lessons — attend a different session when missing a regular one
- Managed through the Profile widget

### Payment schedules

| Type | API value | Description |
|------|-----------|-------------|
| One-time | `single_payment` | Single upfront payment |
| Periodic pre-paid | `in_advance` | Recurring payments billed in advance |
| By attendance | `by_attendance` | Pay per attended session |
| Pay as you go | `pay_as_you_go` | Per-session payment |

Frequency values: `monthly`, `quarterly`, `half_yearly`, `yearly`, `after_events`, `absolute`, `segments`

### Billing periods
- Organizational time periods for grouping courses (e.g. "Autumn 2024", "Summer Camps 2025")
- Visible to organizers only, not to customers
<!-- TODO: requires clarification — how do billing periods affect API responses? -->

## Platform concepts

### Company
- The business running Zooza, identified by `company_id`
- A user can belong to multiple companies with different roles

### Application types

**Widget type**
- API access scoped to a customer's perspective
- Only `X-ZOOZA-API-KEY` required (no company ID header)
- Most admin endpoints return `unauthorized`
- Used for: customer-facing features

**Application type**
- Full API access for admin operations
- Requires: `X-ZOOZA-API-KEY`, `X-ZOOZA-TOKEN`, `X-ZOOZA-COMPANY`
- Must be requested through Zooza support

### Widget group
- Set of widgets sharing the same API key
- One group per domain recommended

## API regions

| Region | Base URL |
|--------|----------|
| Europe | `https://api.zooza.app` |
| UK | `https://uk.api.zooza.app` |
| UAE | `https://asia.api.zooza.app` |
```

---

## Step 2: Rewrite `docs/api/index.md`

Transform from 4-line stub into proper API landing page. **Move** the Widget-vs-Application decision content from `authentication.md` (lines 14–43) here.

### Structure

```
# API overview

(Intro: what the Zooza REST API lets you do)

## Two ways to integrate

Mermaid decision flowchart: "What are you building?" →
  Customer-facing website → Widgets
  Custom app / back-office → API

### Widget integration path
- Embed pre-built components, API key only, no server code
- Links to: widget overview, widget quickstart

### API integration path
- Full programmatic access, server-side auth with 3 headers
- Links to: authentication, API quickstart

## Base URLs
(Region table)

## Authentication summary
- Widget type: API key only
- Application type: API key + token + company ID
- Link to full auth guide

## Key concepts
Link to concepts.md for terminology

## Rate limiting
<!-- TODO: requires clarification — what are the rate limits? -->

## Versioning
<!-- TODO: requires clarification — versioning policy, current version is v1 -->

## Endpoints reference
Link to endpoints.md
```

---

## Step 3: Modify `docs/api/authentication.md`

### Changes

1. **Remove** lines 14–43 (app type decision content — moved to `api/index.md`). Replace with a one-line link: "For an overview of application types, see [API overview](index.md)."

2. **Add cURL and JavaScript examples** for each auth method:
   - Email verification → cURL + fetch example
   - PIN code verification → cURL + fetch example
   - Client secret → cURL + fetch example
   - Get company ID → cURL + fetch example

3. **Add a "Token lifecycle" section** at the end:
   <!-- TODO: requires more content — token expiry, refresh, invalidation behavior -->

4. **Add a "Required headers" summary table** at the top:
   | Header | Required for | Description |
   |--------|-------------|-------------|
   | `X-ZOOZA-API-KEY` | Both types | Identifies your application |
   | `X-ZOOZA-TOKEN` | Both types | Identifies the current user |
   | `X-ZOOZA-COMPANY` | Application only | Scopes to a specific company |

### Placeholders needed
- `<!-- TODO: add example — /login response body for email verification -->`
- `<!-- TODO: add example — /login response body for client_secret -->`
- `<!-- TODO: requires more content — token expiry, refresh, invalidation -->`

---

## Step 4: Create `docs/api/errors.md`

### Structure

```
# Error handling

## Response format
<!-- TODO: requires clarification — standard error JSON structure -->
(Placeholder example JSON)

## HTTP status codes
Table: 200, 400, 401, 403, 404, 422, 429, 500
<!-- TODO: requires clarification — verify which codes the API actually uses -->

## Common error scenarios

### Authentication errors
Table: symptom → cause → solution (4-5 common cases)

### Widget errors
<!-- TODO: requires more content — common widget integration errors -->

### Registration errors
<!-- TODO: requires more content — booking/registration validation errors -->

## Debugging tips
- Browser DevTools for widgets
- Log full response bodies
- Check API region matches account
- Verify application type matches endpoints
```

---

## Step 5: Create `docs/quickstart.md`

Two-track guide with estimated completion times.

### Structure

```
# Quickstart

## Prerequisites
- Zooza account with at least one programme
- API key from Settings > Registration forms
- HTTPS website (for widgets) or cURL/Node.js (for API)

## Embed your first widget (5 min)

### Step 1: Get your API key
(Navigate to Settings > Registration forms)

### Step 2: Add the embed code
(Registration widget embed snippet with Europe URL pre-filled,
clear placeholder instructions)

### Step 3: Verify
(Open page, confirm form appears)

### Next steps
Links to customization, filtering, analytics

---

## Make your first API call (10 min)

### Step 1: Get your credentials
(API key + client secret from support)

### Step 2: Authenticate
(cURL + JavaScript tabs showing /v1/login with client_secret)
<!-- TODO: add example — confirm response shape -->

### Step 3: Get your company ID
(cURL + JavaScript tabs showing /v1/user)

### Step 4: Make an authenticated request
<!-- TODO: add example — pick a simple GET endpoint like /v1/courses -->
(cURL + JavaScript tabs)

### Next steps
Links to auth guide, endpoints, errors, concepts
```

---

## Step 6: Rewrite `docs/index.md`

### Structure

```
# Zooza developer docs

(One-paragraph intro: what Zooza is, what these docs cover)

## Choose your integration path

Two admonition boxes:

!!! tip "Add booking to my website → Use widgets"
    [Get started](quickstart.md#embed-your-first-widget)

!!! tip "Build a custom application → Use the API"
    [Get started](quickstart.md#make-your-first-api-call)

## Learn the fundamentals
- Concepts and glossary
- Quickstart guide

## Widgets
(Definition list of all 6 widgets — keep existing descriptions, cleaned up)
Link to widget overview

## API reference
- API overview
- Authentication
- Endpoints
- Error handling
- Enums reference
```

---

## Step 7: Update `mkdocs.yml`

### New nav

```yaml
nav:
  - Home: index.md
  - Concepts: concepts.md
  - Quickstart: quickstart.md
  - Widgets:
      - Overview: widgets/index.md
      - Registration widget: widgets/registration-widget.md
      - Calendar widget: widgets/calendar-widget.md
      - Map widget: widgets/map-widget.md
      - Profile widget: widgets/profile-widget.md
      - Video widget: widgets/video-widget.md
      - Checkout widget: widgets/checkout-widget.md
  - API reference:
      - Overview: api/index.md
      - Authentication: api/authentication.md
      - Endpoints: api/endpoints.md
      - Error handling: api/errors.md
  - Enums reference: enums.md
```

Changes: added Concepts, Quickstart, Error handling; sentence case throughout.

---

## All placeholders summary

| File | Placeholder | Type |
|------|-------------|------|
| `concepts.md` | Other registration types? | Requires clarification |
| `concepts.md` | Billing periods in API responses? | Requires clarification |
| `api/index.md` | Rate limits? | Requires clarification |
| `api/index.md` | Versioning policy? | Requires clarification |
| `authentication.md` | /login response for email verification | Requires example |
| `authentication.md` | /login response for client_secret | Requires example |
| `authentication.md` | Token expiry/refresh behavior | Requires more content |
| `errors.md` | Error JSON structure | Requires clarification |
| `errors.md` | Actual HTTP status codes used | Requires clarification |
| `errors.md` | Widget integration errors | Requires more content |
| `errors.md` | Registration validation errors | Requires more content |
| `quickstart.md` | client_secret response shape | Requires example |
| `quickstart.md` | Simple GET endpoint example | Requires example |

---

## Verification

1. Run `mkdocs serve` and verify all pages render
2. Click every internal link across all pages
3. Verify mermaid diagrams render in api/index.md
4. Check that all `<!-- TODO -->` placeholders are visible in source but don't break rendering
5. Verify nav structure matches expected hierarchy
