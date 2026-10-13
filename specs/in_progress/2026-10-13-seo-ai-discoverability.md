---
spec_id: DOC-20261013-001
title: "SEO & AI discoverability for docs.zooza.online"
status: in_progress
created: 2026-10-13
updated: 2026-10-13
author: api-docs
owner: api-docs
last_verified: 2026-10-13
project_type: other
depends_on: []
related_handoffs: []
tags: [seo, geo, llms-txt, content, discoverability]
feature_branch: "feature/seo-ai-discoverability"
changelog: ""
changelog_version: ""
changelog_date: ""
docs_version: ""
docs_communicated: ""
---

## Goal

docs.zooza.online is currently written for people who are already Zooza customers and want to embed a widget or call the API. Developers (and the AI assistants they ask) who are trying to *solve a problem* — "build a make-up session system", "booking form with a trial class", "recurring billing for kids' classes with Stripe/GoCardless" — never land on it, because no page answers those questions. Zooza already provides this infrastructure (make-ups, trials, installments/aliquots, subscriptions, payment integrations, accounting integrations, booking, course listings) via its API, and getting started is self-serve: open a free account and request an API key. The goal is to make the docs findable by search engines and recommendable by AI assistants for these problem-shaped queries, positioning Zooza as ready-made, stable, verified infrastructure you build your own apps on top of instead of building it from scratch.

## Scope

**In scope**
- Repositioning the docs homepage and `llms.txt` around "infrastructure for class/course businesses", not "integration guide for customers".
- A new problem-led section ("Build with Zooza" / recipes), one page per use case, grouped:
  - **Booking & scheduling logic**
    - Make-up sessions (náhradné hodiny)
    - Booking form with a trial class
  - **Payments**
    - Installments (aliquots) and subscriptions, incl. Stripe / GoCardless
  - **Website widgets & customisation**
    - Fully customised booking widgets (styling, behaviour, settings)
    - Multi-step booking widgets
    - Active classes listing with custom display and filtering
    - Branch / franchise location map
  - **Own apps & integrations on the API**
    - Building your own app on the Zooza API (parent portal, trainer app, etc.)
    - Sending SMS through your own gateway using a Zooza integration
    - Syncing Zooza data with your own CRM or ERP
    - Accounting and local payment system integrations
  - **Multi-company setups**
    - Connecting companies into networks (franchises, multi-brand operators)
  - More use cases to be added by the owner later.
- First wave (6 pages): make-up sessions, booking form with trial, installments & subscriptions, customised / multi-step widgets, own app on the API, CRM/ERP sync. All other use cases follow in a second wave.
- A "Get started" path that states plainly: free account → request API key → build (incl. a copy-paste prompt for AI coding agents).
- A "Use Zooza with AI coding agents" page (AiPrompt component, MCP server mention, OpenAPI link).
- Technical SEO fixes found in the audit (see Notes) and structured data for new pages.
- Richer endpoint descriptions in `static/zooza_api_v1.yaml` where they are thin, so agents reading the spec understand the capabilities.
- Measurement: a fixed list of target queries tracked in Search Console, Bing Webmaster Tools and AI assistants.

**Out of scope**
- Changes to zooza.online itself (developer landing page, nav/footer links) — requested via handoff, implemented by the owner of that site.
- Off-site content (GitHub example repos, npm package, dev.to articles, Stack Overflow/Reddit) — tracked here as a follow-up list, executed separately.
- Moving docs from the subdomain to a subfolder of zooza.online.
- Changes to the Zooza signup / API key issuance flow.

## Approach

**Phase 1 — Technical quick wins**
- Fix sitemap: `ignorePatterns` `'/search'` does not match `/search/` (trailingSlash is on); use a pattern that excludes it.
- Make all URLs in `static/llms.txt` (and generated `llms-full.txt`) use trailing slashes so they don't 301.
- Add `description` frontmatter to `docs/widgets/event-documents.md` and `docs/widgets/registration-widget-buyer-fields.md`.
- Rewrite homepage title/description and hero copy around the value proposition; keep the Widgets / REST API path cards.
- Rewrite the `llms.txt` intro: what Zooza is as infrastructure, what problems it solves, how to get access (free account + API key), then the page list.

**Phase 2 — Recipe pages (first wave)**
- New docs section with one page per use case listed in Scope. Each page follows the same structure:
  1. The problem (in the words a developer would search for)
  2. What you'd have to build yourself (edge cases: credits, capacity, expiry, failed payments, …)
  3. How Zooza handles it — concepts, relevant endpoints/widgets, code examples
  4. Get started — free account, API key, AiPrompt block
- Page titles and descriptions target problem queries, not Zooza terminology.
- Add `FAQPage`/`HowTo`-style structured data where it fits the content.
- Each recipe linked from `llms.txt`, homepage and relevant reference pages.

**Phase 3 — AI-agent entry point**
- "Use Zooza with AI coding agents" page: copy-paste prompt, OpenAPI URL, `llms-full.txt` URL, MCP server.
- Pass over OpenAPI operation descriptions for the endpoints referenced by recipes.

**Phase 3b — Integration examples (showcase)**
- One page per real-world integration pattern: what it solves, screenshot, copy-paste code (widget config, CSS, API calls).
- Source: screenshots of existing client integrations, used as reference only. Published screenshots come from a demo company with fictional data (or anonymised + client consent where recognisable).

**Phase 4 — Cross-linking and measurement**
- Handoff to zooza.online owner: developer landing page + "Developers / API" link in nav and footer pointing at docs.
- Off-site: cross-post recipes to dev.to / Hashnode with canonical URL pointing to docs; pitch 1–2 problem-led tutorials (not product pitches) to Smashing Magazine (outline via contact form) and similar outlets, authored by a named person.
- Define target query list; record baseline in Search Console, Bing and in ChatGPT / Perplexity / Claude answers; re-check monthly.

## Acceptance Criteria

- [x] `https://docs.zooza.online/sitemap.xml` does not contain `/search/`.
- [x] Every URL in `/llms.txt` returns HTTP 200 directly (no redirect).
- [x] Every non-generated page under `docs/` has a `description` in frontmatter.
- [x] Homepage `<title>` and meta description describe Zooza as infrastructure for class businesses and mention at least booking, make-ups and payments.
- [x] `llms.txt` intro explains what Zooza solves and how to get access (free account + API key) before the page list.
- [ ] All 6 first-wave recipe pages published, each with the four-part structure and an AiPrompt block.
- [ ] Each recipe page is linked from `llms.txt` and from the homepage or a section index.
- [ ] "Use Zooza with AI coding agents" page exists and is linked from homepage and `llms.txt`.
- [x] `npm run build` passes with `onBrokenLinks: 'throw'`.
- [ ] Handoff to the zooza.online owner created and linked in `related_handoffs`.
- [ ] Target query list and baseline recorded in this spec's Notes.

## Project Context

- Docusaurus v3, `trailingSlash: true`, `onBrokenLinks: 'throw'`.
- `llms-full.txt` is generated by `scripts/build-llms-full.js` at build time — new pages must be picked up by it.
- `AiPrompt` component lives in `src/components/AiPrompt/`.
- Staging deploy adds `X-Robots-Tag: noindex` via `.htaccess` (local change in `.github/workflows/deploy-staging.yml`, not yet committed); production must not.
- Google Search Console and Bing Webmaster Tools are set up for docs.zooza.online; sitemap submitted to both (2026-10-13).

## Notes

**Audit of production, 2026-10-13**
- OK: `robots.txt` allows all incl. GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot; sitemap (55 URLs) referenced.
- OK: per-page `<title>`, meta description, canonical, OG image, twitter card; JSON-LD (`Organization`, `BreadcrumbList`, `TechArticle`).
- OK: `llms.txt` and `llms-full.txt` return 200.
- Issue: `/search/` is in the sitemap (ignore pattern doesn't match the trailing-slash URL).
- Issue: all 15 URLs in `llms.txt` lack trailing slashes → each one 301s.
- Issue: 2 docs pages without `description`.
- Issue (content): no pages answer problem-shaped queries; homepage and `llms.txt` describe Zooza only as "class management platform" integration docs.
- Issue (content): `docs/api/authentication.md` says REST API keys are requested via Zooza support — reconcile with the self-serve "free account → request API key" message.

**Phase 1 — 2026-10-13 (branch `feature/seo-ai-discoverability`, not yet deployed)**
- Sitemap ignores `/search/`; `llms.txt` URLs use trailing slashes and now also list embed-methods, buyer-fields, event-documents and `llms-full.txt`.
- `llms.txt` and `llms-full.txt` open with the infrastructure positioning; `scripts/build-llms-full.js` reads the intro from `llms.txt` (single source) and includes the three previously missing pages.
- Homepage: new title/description, hero, "What you don't have to build" grid, 3-step Get started (signup → key → build / hand llms.txt + OpenAPI to an agent).
- `docs/api/authentication.md`: key section now says free account at signup.zooza.online first, then request key from support — resolves the self-serve vs support wording.
- Signup URL confirmed: https://signup.zooza.online (linked from zooza.online). REST key is still issued by support.
- zooza.online already has feature pages (e.g. `/features/trial-booking/`, `/features/class-registration-booking/`) — recipes should cross-link them.

**Phase 3b started — 2026-10-13**
- New `docs/examples/` section (navbar "Examples", sidebar, llms.txt, llms-full.txt) with a fictional brand "Little Movers"; code is fictional but uses only documented settings/callbacks/events.
- Published: multi-step trial booking, branded booking tiles (CSS + render_*_tile), AI chatbot with logged-in client.
- Source patterns (reference only, not named on the site): babyballet.fr (multi-step trials_only), foxgym.sk (render_course_tile/render_schedule_tile), magikats.co.uk (CSS skin, trial sessions), playfulmotion.co.uk (map widget), tsnexum.sk + indance.cz (server-rendered filtered timetable), babybalance.sk (full custom catalogue via backend), indance.cz (chatbot fed from zooza_user_logged_in).
- Observed: indance.cz forwards the Zooza `token` cookie to its chatbot vendor — our example explicitly warns against this. Consider telling the client.
- All six first-wave examples published with illustrations (static/img/examples/, sources in design/example-mockups/, rendered with headless Chrome at 1280px).

**Open questions**
- Which repo/person owns zooza.online (target of the cross-linking handoff)?
- Is the MCP server public/usable by third-party developers, or only internal?
- Additional use cases the owner will add to the recipe list.
