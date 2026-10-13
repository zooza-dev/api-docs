---
handoff_id: api-docs-to-zooza-web-20261013-001
from: api-docs
to: zooza-web
status: open
created: 2026-10-13
updated: 2026-10-13
related_specs: [DOC-20261013-001]
---

## Request

### What we need

1. **A real developer landing page on zooza.online.** `/developers/` is a stub today, but it already ranks well: 3,051 impressions at average position 4.8 (from `seo/url-census.csv`). After this work, a developer or an AI assistant landing there should understand in under a minute that:
   - Zooza is ready-made infrastructure for children's activity businesses (booking, trials, make-ups, payment plans and subscriptions, integrations),
   - they can build their own website, forms and apps on the widgets and REST API,
   - getting started is self-serve (free account, then an API key),
   - concrete examples with code exist.

   It should then send them to the right place on docs.zooza.online.
2. **Contextual links from relevant zooza.online pages to the matching docs pages**, at least:
   - `/features/api-integrations/` → docs overview and integration examples,
   - `/features/make-up-sessions/` → docs "How make-up sessions work",
   - `/features/trial-booking/` → the multi-step trial booking example,
   - `/mcp/` → the docs "AI assistants & MCP" page,
   - localized variants where they exist.
3. **A "build vs. buy a class booking system" article** on the zooza.online blog. It should be aimed at developers and technical owners weighing a custom build, honest about trade-offs, and link to the docs examples. A full English draft is ready in the api-docs repo: `drafts/2026-10-13-build-vs-buy-class-booking-system.md`.

### Why we need it

- docs.zooza.online was repositioned on 2026-10-13 (spec DOC-20261013-001) from "integration docs for existing customers" to "infrastructure you can build on". It now has problem-led pages and examples, but it's a young subdomain with almost no inbound links.
- zooza.online has the domain authority and an already-ranking `/developers/` URL. Linking the two is the cheapest way to get the new docs indexed and trusted by Google and AI assistants.
- Without it, the developer intent ("build make-up system", "class booking API", "booking form with trial") keeps landing on a stub.

### Constraints from our side

- Link targets must be the canonical trailing-slash URLs listed below. They are stable, so please don't link to anchors other than the ones listed.
- The docs are English only. On localized pages, link to the English docs. Don't machine-translate docs content onto zooza.online.
- The public positioning on docs uses fictional example brands only. Please don't name client sites as integration examples without the client's consent.
- Getting started must say: free account at https://signup.zooza.online → request a REST API key from support. Widgets only need the widget key.

**Docs URLs to link to:**

| Page | URL |
|---|---|
| Docs home (developer pitch) | https://docs.zooza.online/ |
| Integration examples | https://docs.zooza.online/examples/ |
| Multi-step trial booking | https://docs.zooza.online/examples/multi-step-trial-booking/ |
| Branded booking tiles | https://docs.zooza.online/examples/branded-booking-tiles/ |
| Location map | https://docs.zooza.online/examples/location-map/ |
| Filtered timetable | https://docs.zooza.online/examples/filtered-timetable/ |
| Custom catalogue | https://docs.zooza.online/examples/custom-catalogue/ |
| AI chatbot with logged-in client | https://docs.zooza.online/examples/chatbot-logged-in-client/ |
| How make-up sessions work | https://docs.zooza.online/make-up-sessions/ |
| AI assistants & MCP | https://docs.zooza.online/ai-assistants/ |
| REST API overview | https://docs.zooza.online/api/ |
| llms.txt | https://docs.zooza.online/llms.txt |

### How we imagine it — open to challenge

- `/developers/` structure, mirroring the docs homepage:
  1. hero ("Build on Zooza instead of from scratch"),
  2. "What you don't have to build" (6 capabilities),
  3. the 6 examples as cards,
  4. Widgets vs REST API,
  5. 3-step get started,
  6. a short AI section (coding agents + MCP).

  Every card deep-links into docs. Keep the existing localized slugs.
- Resolve the legacy `/developers/tracking/` and `/developers/product-roadmap/` (both 404) with redirects. Tracking could go to https://docs.zooza.online/widgets/registration-widget/#analytics.
- Build-vs-buy article: api-docs writes the English draft (problem-first and practical, following the brand voice in `sdd-workflow/docs/brand/positioning.md`). zooza-web owns the final edit, frontmatter, hero image and any translations.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:**
**What will NOT be built (and why):**
**Constraints agreed:**
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-docs | Keep listed docs URLs stable; draft build-vs-buy article | |
| zooza-web | Developer landing, contextual links, publish article | |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
