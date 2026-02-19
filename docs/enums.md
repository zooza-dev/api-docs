---
title: Enums reference
description: All enumeration values used across the Zooza API and widgets.
sidebar_position: 5
---

# Enums reference

## class_capacity

- **none**: Don't show availability
- **number**: Show numeric availability (e.g., 5/10)
- **text**: Status (e.g., "available")

## payment_method

- **card**: Pay by card
- **cash**: Pay in cash
- **transfer**: Bank transfer

## registration_display_mode

This will only be applied for courses where `registration_type=full2`.

- **default**: Customer will decide which option to choose.
- **full_course_only**: Only registration to a class will be enabled.
- **trials_only**: Only trial registration will be offered. Trials need to be enabled in course settings.
- **segments_only**: Only registration to blocks will be enabled. Blocks need to be set in the class settings.
- **trials_and_segments_only**: Customer can opt between trial or blocks.

## Supported languages

| Code | Language | Widgets | App |
|----|--------|-------|---|
| `en-EN` | English | Yes | Yes |
| `en-US` | English US | Yes | Yes |
| `fr-FR` | French | Yes | No |
| `sk-SK` | Slovak | Yes | Yes |
| `cz-CZ` | Czech | Yes | Yes |
| `de-DE` | German | Yes | Yes |
| `pl-PL` | Polish | Yes | No |
| `ro-RO` | Romanian | Yes | Partial |
| `it-IT` | Italian | Yes | No |
| `hu-HU` | Hungarian | Yes | No |
