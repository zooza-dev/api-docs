---
handoff_id: widgets-v1-to-api-docs-20260915-001
from: widgets-v1
to: api-docs
status: agreed
created: 2026-09-15
updated: 2026-09-15
related_specs: [W1-20260908-001, W1-20260914-001, W1-20260914-002]
---

## Request

### What we need

Update the widget embed documentation to show **only** the **placeholder + loader** embed — the definitive shape from W1-20260908-001 — and remove the **legacy inline-script** snippet from the embed/quickstart pages. Document the two placements:

**Body only**
```html
<div data-zooza-widget="{type}" data-zooza-id="{API_KEY}"></div>
<script async src="{api_url}/widgets/{version}/loader.js"></script>
```

**Head + body (loads faster)**
```html
<!-- in <head> -->
<script async src="{api_url}/widgets/{version}/loader.js"></script>

<!-- in <body>, where the widget should appear -->
<div data-zooza-widget="{type}" data-zooza-id="{API_KEY}"></div>
```

Where:
- `{type}` = the widget type: `registration`, `profile`, `contact` (v1) and `calendar`, `checkout`, `video`, `map` (v2). Use the type verbatim on the placeholder (the loader maps `registration` → `registration_new` internally for v1).
- `{version}` = `v1` for registration/profile/contact, `v2` for calendar/checkout/video/map.
- `{api_url}` = the region host (e.g. `https://api.zooza.app`), carried by the loader `src`.
- Per-instance options are `data-zooza-*` attributes on the placeholder (naming rule: config key with `_` → `-`, e.g. `data-zooza-filter-courses`, `data-zooza-multi-step-form`; contact uses `data-zooza-config-id`, optional). The full attribute surface is in the earlier handoff `2026-09-08-widgets-v1-to-api-docs-placeholder-data-attributes`.

### Why we need it

The docs still show the old inline `<script data-widget-id="zooza" id="…">…</script>` embed. That shape is superseded by the placeholder + loader model (one shape across v1 and v2), which starts loading during HTML parse instead of waiting for `window.load`. New users should only ever see the current embed.

### Constraints from our side

- **Don't tell readers the legacy embed is broken or must be replaced.** It remains a permanent runtime fallback — existing embeds on customer sites keep working. This is about removing it from the *instructions for new embeds*, not deprecating existing ones. A short "if you have an older `<script id=…>` embed it still works; no action needed" note is welcome but optional.
- The snippet shapes and attribute names above are the widgets-v1 contract — please reproduce them exactly.

### How we imagine it — open to challenge

Wherever the embed snippet appears (quickstart, per-widget embed sections), replace the inline-script example with the two placeholder + loader blocks and the method choice. You own the docs structure and wording.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-09-15 — api-docs
Agreed, with one deviation on the legacy snippet (product owner decision).

Constraints acknowledged: the legacy embed is never described as broken or needing replacement, and the snippet shapes and attribute names match the contract above.

What the docs now show, on all six widget pages (registration, profile, calendar, checkout, video, map), the quickstart, and the "Choosing an embed method" page:
- **Body only** (default tab): placeholder followed by `<script async src="{api_url}/widgets/{version}/loader.js">`.
- **Head + body**: loader in `<head>`, placeholder in `<body>`.
- The "Embed with your AI agent" prompts hand out the body-only snippet and mention the head option.
- The widget-type → loader-version mapping (`registration`/`profile` → v1; `calendar`/`checkout`/`video`/`map` → v2) is documented on the embed-methods page and in the quickstart.

**Deviation:** the inline `<script data-widget-id="zooza" id=…>` snippet is not removed. It stays as a third tab, **Legacy script**, with a note saying it remains fully supported and existing embeds keep working, but it is no longer maintained or developed, and new capabilities (`data-zooza-*` placeholder attributes) are only available with the placeholder embed. It is never the default and is never presented as the recommended path for new embeds.

Not covered: there is no contact widget page in api-docs today, so `contact` is not documented yet.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:** api-docs presents the placeholder + loader as the embed for new integrations, in two placements: Body only (default) and Head + body. This applies to every widget page, the quickstart, the embed-methods page and the AI-agent prompts. The legacy inline script stays available as a clearly labelled, non-default "Legacy script" tab.
**What will NOT be built (and why):** The legacy snippet is not fully removed. The product owner wants it documented as a supported legacy option (fully supported, not further maintained or developed) so existing integrators can still find it. A contact widget page is not part of this handoff.
**Constraints agreed:** The docs never call the legacy embed broken or say it must be replaced. Snippet shapes and `data-zooza-*` attribute names follow the widgets-v1 contract exactly. Type → version mapping: registration/profile/contact → v1; calendar/checkout/video/map → v2.
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| widgets-v1 | Owns the embed shape / mount contract (above) | — |
| api-docs   | Docs lead with placeholder + loader (Body only default, Head + body); legacy inline snippet kept as a labelled "Legacy script" tab | Done 2026-09-15 |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
