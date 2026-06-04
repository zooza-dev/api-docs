---
id: registration-widget-buyer-fields
title: Buyer-Only Extra Fields
sidebar_label: Buyer-Only Extra Fields
---

# Buyer-Only Extra Fields in the Registration Widget

Certain extra-field columns in Zooza are **buyer-scoped** — they represent information about the person paying for the booking (the buyer), not about each individual attendee. The registration widget now collects these fields once on the buyer card and sends the values to all attendees' `buyer.extra_fields`, rather than asking for the same information once per attendee.

## Buyer-only columns

The following extra-field columns are always collected on the buyer card, regardless of the `get_extra_fields_from` and `get_basic_fields_from` course settings:

**Address columns**
- `address`
- `address_structured`

**Business / invoice columns**
- `business_name`
- `business_id` (IČO)
- `tax_id` (DIČ)
- `vat` (IČ DPH)
- `business_address`

All other extra-field columns (`dob`, `full_name`, `slots`, `identification_number`, `extra_field_1..15`, `citizenship`) continue to render per attendee and route to `customer.extra_fields` as before.

## Rendering behaviour

### Address fields
Address inputs (when active on the course) are shown **once** on the buyer card (person 0), above the business checkbox. They are not shown in any per-attendee section, regardless of `get_extra_fields_from`.

### Business fields — mandatory business mode
If **any** business column is configured as `active = true` **and** `mandatory = true` on the course, the business inputs are shown unconditionally on the buyer card. The "I'm buying as a company" checkbox is hidden. Each input still respects its own per-column `mandatory` flag — for example, `business_id` may be required while `vat` is optional.

### Business fields — optional business mode
If no business column is mandatory, the **"I'm buying as a company"** ("Nakupujem na firmu") checkbox is shown on the buyer card. Business inputs appear below the checkbox only when it is checked. Each input respects its own `mandatory` flag given the checkbox is checked.

## Payload routing

Values collected from the buyer card are sent in `buyer.extra_fields` on every person in the payload:

```json
{
  "persons": [
    {
      "buyer": {
        "extra_fields": [
          { "column_name": "business_id",   "value": "12345678" },
          { "column_name": "business_name", "value": "Acme s.r.o." }
        ]
      },
      "customer": { "extra_fields": [] }
    },
    {
      "buyer": {
        "extra_fields": [
          { "column_name": "business_id",   "value": "12345678" },
          { "column_name": "business_name", "value": "Acme s.r.o." }
        ]
      },
      "customer": { "extra_fields": [...per-attendee fields...] }
    }
  ]
}
```

Buyer extra fields collected once on person 0 are echoed verbatim to all other persons (`buyer.extra_fields` only — their per-person buyer `first_name`, `last_name`, etc. are not affected).

## Multi-attendee booking example

Course configured with: `get_basic_fields_from = 'all'`, `get_extra_fields_from = 'all'`, 3 attendees, `business_id` mandatory.

**What the form shows:**
- Person 0: name + email (per-person) + business inputs on buyer card (no checkbox, mandatory)
- Person 1: name + email (per-person) only — no business inputs
- Person 2: name + email (per-person) only — no business inputs

**Submitted payload:** `business_id`, `business_name`, etc. appear in `buyer.extra_fields` for persons 0, 1, and 2. Only `customer.extra_fields` differs per attendee.

## Mandatory validation

Mandatory buyer-only inputs are enforced client-side using the standard per-field validation flow. Leaving a mandatory business or address field empty blocks form submission and displays an error message next to the field on the buyer card.
