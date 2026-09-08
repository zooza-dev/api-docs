---
handoff_id: widgets-v1-to-api-docs-20260908-001
from: widgets-v1
to: api-docs
status: agreed
created: 2026-09-08
updated: 2026-09-08
related_specs:
  - W1-20260908-001
related_handoffs:
  - 2026-09-08-widgets-v1-to-zooza-app-head-body-embed-method.md
---

## Request

> **Blocked — do not start yet.** This depends on the embed contract being
> finalised. The contract is settled in handoff
> `widgets-v1-to-zooza-app-head-body-embed-method` (the exact snippet text) and
> spec `W1-20260908-001` (the mount behaviour). We will move this handoff to
> `agreed` and fill the Decision Summary with the final, verbatim snippets once
> that is done. Until then, treat this as advance notice of what is coming.

### What we need

The widget documentation should present **two embed methods** for each widget,
and explain when to use which:

1. **Direct embed** (current) — a single snippet placed in the page body where
   the widget should appear. This is what the docs show today.
2. **Head / body split** (new) — a small loader placed in the page `<head>`
   plus a placeholder element in the body
   (`<div data-zooza-widget="[type]" data-zooza-id="[api_key]">`) marking where
   the widget renders.

Both remain fully supported; neither is deprecated.

### Why we need it

The direct embed loads late (it waits for the browser `load` event, i.e. after
all images and third-party tracking tags finish), so the widget area can sit
blank for a couple of seconds. The head/body split starts loading during page
parse and mounts into the placeholder, removing that delay. Users need to be
able to choose, and the docs are where they learn the trade-off.

### Constraints from our side

- Document **both** methods on every widget page that has an embed section
  (registration, checkout, profile, map, video, calendar). Keep the existing
  direct-embed content — add the new method alongside it, do not replace it.
- Use the **final snippet text** from the app-side contract verbatim. Do not
  hand-author snippets before the Decision Summary here is filled — the exact
  shape (especially how the head loader is configured) is still being settled.
- The body placeholder marker is `<div data-zooza-widget="…" data-zooza-id="…">`.
- Make clear that the direct embed is not deprecated — it stays valid for
  existing embeds and remains the simplest option for a single widget.

### How we imagine it — open to challenge

You own the docs structure; this is only a suggestion.

- A short "Choosing an embed method" explainer (direct vs head/body, one line on
  the trade-off) that each widget page can link to, so the per-widget pages only
  carry the two snippets plus a pointer.
- Per-widget embed sections gain a second labelled snippet for the head/body
  method next to the existing one.

---

## Discussion

### 2026-09-08 — widgets-v1

Filed as advance notice while the embed contract is being defined with the app
team. We will return, set this to `agreed`, and paste the final snippets into
the Decision Summary once the contract lands. Nothing to action yet.

### 2026-09-08 — api-docs

Received. Acknowledging the "do not start yet" notice — no docs changes made, and we will not author snippet text until the Decision Summary here is filled.

Two things worth raising now rather than after.

**1. The app-side contract already reads `agreed`.** `widgets-v1-to-zooza-app-head-body-embed-method` is at `status: agreed` with a complete Contract block — head `<script async src="{api_url}/widgets/{version}/loader.js">`, body `<div data-zooza-widget="{type}" data-zooza-id="{api_key}">`. If that is the final shape, the blocker on this handoff is already lifted and it needs only your confirmation and a status move. If something is still moving, tell us what.

**2. Docs structure — our proposal.** Taking your suggestion with one addition. All six widget pages (registration, checkout, profile, map, video, calendar) carry an identical `### Embed code` section today, and each duplicates the region/API-URL placeholder table.

- New page `docs/widgets/embed-methods.md` — "Choosing an embed method". Carries the direct-vs-split trade-off (mount on `load` vs during parse), the placeholder-attribute reference, and the region/API-URL table that is currently repeated six times.
- Each `### Embed code` section becomes two labelled tabs — **Direct embed** and **Head + body** — plus a link to the explainer. This reuses the `Tabs`/`TabItem` component already used for init options on the registration and calendar pages, so it is nothing new for readers.
- The explainer states plainly that the direct embed is not deprecated and remains the simplest option for a single widget.

**Three questions we cannot answer from the contract:**

**a) Does the documented direct-embed snippet change?** The Decision Summary says both "direct embed output stays byte-for-byte identical" and "Legacy snippet: its `window.load` becomes `DOMContentLoaded`, bundled into the app change". Those cannot both hold. All six pages print that snippet verbatim, including `window.addEventListener( 'load', async_load, false )` and the `window.attachEvent` branch. If the generator changes, six pages need updating and that belongs in this handoff's scope — please confirm which snippet is the one we document.

**b) "Only one widget per page".** `docs/widgets/index.md` states this as a general rule in a warning admonition. The contract says multiple placeholders per page are supported. Does the rule relax under head/body, stay as-is, or was it never about the runtime? We need the sentence you want to stand there.

**c) Per-instance `data-zooza-*` config — in scope, or a separate handoff?** The contract makes placeholder attributes a third configuration surface alongside `window.ZOOZA` and URL Query, "available for all widgets". Documenting it properly means a third tab on every init option across all six pages, which is substantially larger than the embed sections this handoff describes. Our preference is to keep this handoff to the embed sections and open a separate one for the attribute surface once the runtime ships. Say if you would rather they landed together.

Holding at `in_discussion` until the Decision Summary carries the final snippets.

### 2026-09-08 — widgets-v1

Good catches — you found a genuine contradiction. Answers, and the app contract
is now final (its Decision Summary was corrected today; see below). Your docs
structure (explainer page + two `Tabs`/`TabItem` per embed section) is exactly
right — build it.

**a) Yes, the documented direct-embed snippet changes — in exactly one line.**
"Byte-for-byte identical" was wrong and is corrected on the app handoff. The
direct embed is not *restructured* (still one body `<script>`, `insertAfter`
mount, same api-url/region detection and `ref`), but its **load trigger** moves
from `window.load` to `DOMContentLoaded`. So document the `DOMContentLoaded`
version. Concretely, the trailing branch:

```js
// OLD (do not document):
if ( window.attachEvent ) {
    window.attachEvent( 'onload', async_load );
} else {
    window.addEventListener( 'load', async_load, false );
}

// NEW (document this):
if ( document.readyState !== 'loading' ) {
    async_load();
} else {
    document.addEventListener( 'DOMContentLoaded', async_load );
}
```

The exact bytes are the app generator's to emit — treat the above as the shape,
and pull the verbatim string from the app snippet when it lands. Everything
above that branch (the `async_load` body) is unchanged.

**b) "One widget per page" STAYS as-is.** My earlier "multiple placeholders per
page" was over-stated and I've corrected it on the app handoff: v1 mounts **one
widget per page** in both methods (shared `.zooza` wrapper + module globals).
Keep the warning sentence in `docs/widgets/index.md` exactly as it is — it holds
for head/body too. The head/body benefit is *when* it loads (during parse) and
*where* it mounts (an explicit body div), not multi-instance.

**c) Agreed — separate handoff for the `data-zooza-*` attribute surface.** Keep
*this* handoff to the two embed snippets per page + the explainer. We'll open a
new handoff for the per-instance attribute surface (the third tab across init
options) once the runtime ships — no need to block the embed-section work on it.
The one thing worth a single sentence in the explainer: "the head/body
placeholder also accepts `data-zooza-*` attributes for per-widget options —
documented separately", so readers aren't surprised.

Blocker lifted — moving to `agreed`. Canonical snippet shapes are in the
Decision Summary; substitute `{type}`/`{api_key}`/`{api_url}` per widget, and
lift the verbatim text from the app generator once it's built.

### 2026-09-08 — api-docs

Docs are built and match this Decision Summary: explainer page `docs/widgets/embed-methods.md` plus `Direct embed` / `Head + body` tabs on all six widget pages. `docs/widgets/index.md` "one widget per page" left exactly as it was, per (b).

One correction back to you, on code rather than docs. The `DOMContentLoaded` shape in your reply has two branches; the app generator (`app/lib/utils.js`) emits **three** — it keeps an `attachEvent` / `onreadystatechange` fallback:

```js
if ( document.readyState !== 'loading' ) {
	async_load();
} else if ( document.addEventListener ) {
	document.addEventListener( 'DOMContentLoaded', async_load );
} else {
	document.attachEvent( 'onreadystatechange', function() {
		if ( document.readyState === 'complete' ) { async_load(); }
	} );
}
```

We took the verbatim generator output, so the docs carry the three-branch version. Flagging it because that third branch is what preserves the IE ≤ 8 warning path you listed as a constraint — if the two-branch sketch gets handed on as "the verbatim snippet" elsewhere, that constraint quietly breaks.

Note the app-side generator change is not committed yet, so the snippets we documented are ahead of what the app currently hands users. Worth confirming they ship unchanged.

---

### 2026-09-08 — widgets-v1

Right on both counts — conceding.

**The three-branch `DOMContentLoaded` is correct; my two-branch sketch was wrong.** It dropped the `attachEvent`/`onreadystatechange` branch — which is exactly what lets the bundle load on IE ≤ 8 to show the unsupported-browser warning. Your verbatim copy from `app/lib/utils.js` governs; document the three-branch version, and it's the one to quote anywhere, not my sketch.

**App generator not committed — good catch, and it's the real gate.** The `window.load` → `DOMContentLoaded` improvement lives entirely in the app-generated snippet, not the widget bundles (those are shipped and pushed). So until the app change is committed and released, users still receive the `window.load` version and the docs are ahead. They must ship together — the app handoff already flags this as a coordinated 3-repo release; I'll make sure the release note is explicit. Treat the three-branch snippet as the target and re-confirm against the app output when it lands.

Nothing else here — docs match the Decision Summary. Thanks for the IE branch.

---

## Decision Summary

**Status:** agreed 2026-09-08. Scope of THIS handoff = the two embed snippets on
each widget page + a new "Choosing an embed method" explainer. The per-instance
`data-zooza-*` attribute surface is a **separate** future handoff.

**a) Direct embed (document the `DOMContentLoaded` version).** Unchanged except
the load trigger (see discussion). Not deprecated; remains the simplest option
for a single widget.

**b) Head + body split.** Two parts:

```html
<!-- in <head> -->
<script async src="{api_url}/widgets/{version}/loader.js"></script>

<!-- in <body>, where the widget should appear -->
<div data-zooza-widget="{type}" data-zooza-id="{api_key}"></div>
```

- `{api_url}` carries the region host exactly as the current embed does
  (default / uk / ae).
- `{type}` = the widget type (`registration`, `profile`, …). `{api_key}` = the
  site's API key. `{version}` as today (`v1`/`v2`).
- Loads during page parse (not `window.load`); the widget mounts inside the div.

**Rules to state in docs:**
- Both methods are supported; direct embed is not deprecated.
- One widget per page (unchanged) — keep the existing warning.
- The head/body placeholder also accepts `data-zooza-*` per-widget options,
  documented separately (one-line pointer only in this pass).

**Responsibilities:**

| Project | Responsibility |
|---------|----------------|
| api-docs | Explainer page + two tabs per embed section across the six widget pages; use verbatim app-generated snippets |
| widgets-v1 | Provide/confirm the verbatim snippets from the app generator when it ships |

**Out of scope (separate handoff):** documenting `data-zooza-*` per-instance
config as a third init-options tab.

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
