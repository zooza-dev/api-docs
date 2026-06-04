---
id: event-documents
title: Event Document Display
sidebar_label: Event Documents
---

# Event Document Display in the Profile Widget

The profile widget (`widget_profile.js`) now surfaces session-attached documents to participants — including image galleries with a lightbox, prep-material timing indicators, and bulk download.

## Overview

When an administrator attaches documents to a session from the Zooza back-office, participants see those documents in two places within the profile widget:

1. **Inline next to each session** in the programme public summary.
2. **In the dedicated Files tab** (Súbory) — continues to work as before.

## What the widget renders

### File list

For each session, the widget renders a list of all files the participant is entitled to see (based on `visibility` × payment status). Files not accessible to the participant are not displayed at all (no teaser or locked placeholder).

Each file entry shows:
- The filename as a link.
- An **"Available from [date]"** notice when `file_available === false` and `available_from` is set — no download link is shown until the file is released.
- A thumbnail grid for image files (detected by filename extension).

### Image gallery (lightbox)

Image attachments are rendered as a **thumbnail grid**. Clicking a thumbnail opens a full-size lightbox with:
- Previous / next navigation across the session's images.
- Close button.
- Lazy loading — thumbnails are only fetched when the gallery is opened or scrolled into view, keeping page load fast even for pages with many sessions.

The widget builds image URLs from `files_events.id` (the junction row ID):

| Purpose | URL parameter |
|---|---|
| Small thumbnail | `t=event_file_thumbnail&item={files_events_id}` |
| Full-size image | `t=event_file&item={files_events_id}` |
| Session zip download | `t=event_files_zip&event={event_id}` |

All URLs use the same `key/o/c` Zooza-token auth parameters as the existing per-file download mechanism. Box credentials are never exposed to the embedded page.

### Bulk download

A **Download all** link per session points to `t=event_files_zip&event={event_id}` and delivers a zip archive of all the participant's entitled files for that session.

## Availability timing

Document availability is server-authoritative. The API returns:

- `file_available` (boolean) — whether the file is currently accessible.
- `available_from` (datetime, nullable) — when the file will become available.

The widget reads these fields directly and does **not** compute availability client-side from the event date.

| `file_available` | `available_from` | Widget renders |
|---|---|---|
| `true` | any | File link / thumbnail |
| `false` | set | "Available from {date}" notice; no download link |
| `false` | null | "Will be published in time" (existing generic text) |

## Entitlement

The `visibility` tier on each `files_events` row controls who can see the file:

| `visibility` | Who can see it |
|---|---|
| `all` | Any registered participant (including unpaid) |
| `paid` | Paid participants only |

Non-entitled files are fully hidden — the widget renders only what the API returns for the requesting participant's session.

## API contract (for integration)

The profile widget reads document data from the registration session payload. The API (endpoint `GET /widget/registration/...`) includes file data per event in the `files` array on each `course_event`. Each element has:

```json
{
  "id": 42,
  "file_id": 7,
  "event_id": 123,
  "file_name": "handout.pdf",
  "visibility": "all",
  "availability": "before",
  "file_available": true,
  "available_from": null
}
```

| Field | Type | Description |
|---|---|---|
| `id` | integer | `files_events` junction row ID — used to construct thumbnail/download URLs |
| `file_id` | integer | ID in the `files` table |
| `event_id` | integer | The session this document is attached to |
| `file_name` | string | Original filename (determines if treated as image) |
| `visibility` | string | `all` or `paid` |
| `availability` | string | `before`, `at_session`, or `after_session` |
| `file_available` | boolean | Whether the file is currently accessible to this participant |
| `available_from` | datetime \| null | Exact UTC timestamp when the file becomes available |

## Image detection

The widget detects image files by filename extension (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`). Non-image files render as plain download links without a thumbnail.
