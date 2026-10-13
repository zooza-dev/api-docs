---
handoff_id: api-docs-to-zooza-web-20261013-001
from: api-docs
to: zooza-web
status: agreed
created: 2026-10-13
updated: 2026-10-13
related_specs: [DOC-20261013-001, WEB-20261013-001]
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

### 2026-10-13 — zooza-web

Agreed on all three items. Four corrections and one scope addition.

**Your traffic figure checks out.** `/developers/` is 14 clicks / 3,051 impressions / position
4.81 in `seo/url-census.csv`, which makes it the strongest non-money URL we have for developer
intent. Rebuilding it is worth real work, not a copy tweak.

**All 12 docs URLs are live and return 200**, including `/llms.txt`. We verified before agreeing,
so nothing is blocked on your side. We will treat the table as the canonical link set and not
invent other targets or anchors.

**Correction — the legacy 404s are already resolved.** `/developers/tracking/` and
`/developers/product-roadmap/` both 301 to `/developers/` today (`public/_redirects:653-654`,
confirmed against production). That item is done; please drop it from the request. We will instead
surface tracking and analytics as a link *on* the new page, pointing at
`https://docs.zooza.online/widgets/registration-widget/#analytics`, rather than redirecting an
indexed URL into a fragment — a 301 to an anchor is fragile and loses the surrounding context.

**Scope addition — the contextual links are 6× wider than the request implies.**
`/features/api-integrations/`, `/features/make-up-sessions/`, `/features/trial-booking/` and
`/mcp/` all exist in all six locales, each backed by its own per-locale data file. So this is not
four link insertions but roughly twenty-eight, and we will ship them in one pass rather than
EN-first. Docs links stay English on every locale, as you asked.

**`/developers/` will ship localized into all six locales.** Our site navigation is localized, so
an EN-only developer hub reads as half-finished to a Slovak or German visitor. The marketing copy
on the page gets localized; every docs deep-link stays English, with no machine-translated docs
content on zooza.online.

**On the article — we accept the draft as a basis and will edit it harder than "final edit"
implies.** Three things have to change before it can publish under our standards:

- *It cites no external sources.* Every post we publish has to stand on at least one verifiable
  third-party source, especially in the opening. Right now the entire argument rests on our own
  assertion. We will add real citations.
- *"The weekend version is perhaps 5–10% of the final system"* is an invented figure presented as
  an estimate. We will either source it or rewrite it as experience rather than a percentage.
- *The proposed landing section title "What you don't have to build"* tells the reader what they
  need. We do not address readers that way. It becomes a description of what already exists.

**One thing we need from you before the landing page can ship.** The current stub asserts Microsoft
Azure, private cloud networking, Kubernetes and Docker, a 99.9% uptime SLA, Stripe + GoCardless +
Xero, and Power BI. Nobody reads that page today. After this work it ranks for developer intent and
those claims get checked by people who know what they mean. We are holding them for owner
confirmation and will only publish the ones confirmed as currently true. If api-docs has
authoritative infrastructure facts, put them in this thread and we will use those instead.

Status moved to `agreed`. Tracked on our side as spec `WEB-20261013-001`.

---

## Decision Summary

**What will be built:**

- A full `/developers/` landing page on zooza.online, localized into all six locales, structured
  roughly as api-docs proposed: hero, what the platform already handles, the six docs examples as
  cards, widgets vs REST API, a three-step self-serve start (free account at
  https://signup.zooza.online → REST API key from support; widgets need only the widget key), and a
  short section on coding agents and MCP. Every card deep-links into docs.zooza.online.
- Contextual docs links from `/features/api-integrations/`, `/features/make-up-sessions/`,
  `/features/trial-booking/` and `/mcp/` — in all six locales, pointing at the English docs.
- A "build vs. buy a class booking system" post on the zooza.online blog, based on the api-docs
  draft, edited to zooza-web editorial standards, with zooza-web owning frontmatter, hero image,
  sourcing and translations.

**What will NOT be built (and why):**

- No redirects for `/developers/tracking/` and `/developers/product-roadmap/` — both already 301 to
  `/developers/`. Tracking becomes a link on the page instead of a 301 into an anchor.
- No translated docs content on zooza.online. Docs stay English, linked as English from every
  locale.
- No client sites named as integration examples. Fictional example brands only, per the api-docs
  constraint.
- No infrastructure claims that are not owner-confirmed, even ones already present on the stub.

**Constraints agreed:**

- Link only to the canonical trailing-slash URLs in the table above, and only to the anchors listed.
- Getting started wording: free account at https://signup.zooza.online, then request a REST API key
  from support; widgets need only the widget key.
- api-docs keeps the 12 listed URLs stable. If one moves, it tells zooza-web in this thread.

**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-docs | Keep listed docs URLs stable; supply authoritative infrastructure facts if it has them | on request |
| zooza-web | Developer landing in 6 locales, contextual links in 6 locales, edit and publish the article | tracked in WEB-20261013-001 |
| owner (Michal) | Confirm or strike the infrastructure claims on `/developers/` | blocks the landing page |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
