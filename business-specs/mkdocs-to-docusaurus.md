# Migration: MkDocs → Docusaurus

**Date:** 2026-02-19
**Status:** Approved — ready for implementation
**Priority:** High

---

## 1. Background and Motivation

The Zooza API documentation site currently runs on **MkDocs + Material theme**, a Python-based static site generator. While functional, it has hit a ceiling in terms of flexibility, plugin ecosystem maturity, and out-of-the-box support for the things that matter most: search quality, SEO, and discoverability by LLMs.

**Docusaurus v3** is a React/Node.js-based documentation framework maintained by Meta, used in production by Supabase, Clerk, Stripe, and hundreds of other developer-facing products. It offers a significantly more capable foundation for building a professional, SEO-optimised, and LLM-friendly documentation site.

---

## 2. Problems with the Current Setup

| Problem | Impact |
|---------|--------|
| OpenAPI renderer instability — already on second renderer (`neoteroi-mkdocs` after `swagger-ui-tag` broke nested descriptions) | Developer hours lost; risk of recurrence |
| SEO requires manual JSON-LD injection via theme overrides (`head.html`, `metadata.html`) | Fragile; easy to break on theme upgrades |
| No versioning support | Cannot document multiple API versions simultaneously |
| No MDX / React component support | Cannot embed interactive elements (e.g. live API explorer) |
| Search is client-side lunr.js by default | Poor relevance; no analytics |
| Python dependency chain | Adds operational overhead; separate from front-end tooling |
| No built-in social card generation | Reduces shareability on LinkedIn, Twitter, etc. |
| No LLM-specific optimisation primitives | Missed opportunity for AI-era discoverability |

---

## 3. Goals

### Primary
- Replace MkDocs with Docusaurus v3 while preserving all existing content with no broken URLs.
- Achieve a professional, polished visual design consistent with Zooza brand identity.

### Secondary
- Maximise organic search ranking for developer-intent queries (e.g. "Zooza API authentication", "Zooza widget embed").
- Make documentation fully legible and indexable by LLMs (ChatGPT, Perplexity, Copilot, Gemini).
- Provide a stable, maintainable OpenAPI reference without renderer-switching risk.

### Out of Scope
- Rewriting documentation content (this spec covers platform migration only).
- Adding new documentation pages beyond what is required for migration.
- Changing the deployment host (SFTP to zooza.sk remains).

---

## 4. Proposed Architecture

### 4.1 Framework

**Docusaurus v3** (current stable: 3.x, React 18, Node.js 18+).

- Static output — same as current MkDocs build. No server required.
- MDX by default — all existing `.md` files are valid with zero changes.
- Plugin ecosystem: first-party plugins for sitemap, analytics; large community for OpenAPI.

### 4.2 OpenAPI Reference

**Decision: multi-page with `docusaurus-plugin-openapi-docs`**

This plugin converts `zooza_api_v1.yaml` into a full multi-page API reference at build time — one page per endpoint — with request/response schemas, code samples, and a built-in "Try It" console. It is the most widely adopted OpenAPI plugin for Docusaurus with active maintenance.

Multi-page generation is confirmed as the preferred approach because:
- Each endpoint becomes an individually indexable URL (SEO benefit)
- Individual pages are retrievable by LLMs without fetching the entire spec
- No browser-side JavaScript rendering — schemas parsed at build time (eliminates the nested-description failure mode that forced two renderer switches)

**Alternatives considered and rejected:**

| Option | Reason rejected |
|--------|----------------|
| `@scalar/docusaurus` | Single-page; harder for SEO; less Docusaurus-native |
| `redocusaurus` | Single-page; Redoc is slow to render in browser |
| Keep `neoteroi-mkdocs` | Would mean staying on MkDocs; misses all other Docusaurus benefits |

**URL impact:** The multi-page OpenAPI reference generates URLs like `/api/endpoints/list-courses/`. The existing `/api/endpoints/` URL will redirect to an OpenAPI overview page via `@docusaurus/plugin-client-redirects`.

### 4.3 Search

**Decision: Algolia — reconfigure existing index for Docusaurus**

Algolia is already indexing the site at `docs.zooza.online`, but the current crawler configuration is MkDocs-specific and uses a different record structure than Docusaurus expects.

**Required action:** Update the Algolia crawler configuration to use the Docusaurus-optimised template (Docusaurus ships a reference crawler config in its docs). This involves:
1. Updating the CSS selectors for content extraction (`.theme-doc-markdown` instead of MkDocs class names)
2. Using the Docusaurus record hierarchy (`lvl0`–`lvl5` heading levels)
3. Re-crawling the site after deployment

If the existing Algolia app/index can be reconfigured, a new index is not required. If access to the crawler config is limited, create a new index under the DocSearch programme (free for open documentation).

Docusaurus first-party integration: `@docusaurus/plugin-search-algolia`.

### 4.4 Theme and Brand Identity

**`@docusaurus/preset-classic`** with full Zooza brand application in `src/css/custom.css`.

#### Brand Colour Tokens (from `zooza_css/_shared/_presets.scss`)

| Role | Light mode | Dark mode | Usage |
|------|-----------|-----------|-------|
| Primary (orange) | `#FA6900` | `#FF8C42` | CTAs, links, active states |
| Primary darker | `#b36325` | `#C76521` | Hover states |
| Teal | `#3aa39d` | `#204e4c` | Secondary accent, info states |
| Teal lighter | `#A7DBD8` | `#5c9794` | Backgrounds, badges |
| Background (warm) | `#f2f5e5` | — | Page background |
| Surface gray | `#E0E4CC` | `#545550` | Borders, dividers |
| Dark text | `#4d4f46` | — | Body text |
| Code background | `#eef0f1` | `#2A2C28` | Inline code, code blocks |
| Success | `#0cc429` | — | Status indicators |
| Error | `#ff3000` | — | Error states |

**Font:** `DM Sans` (currently used in the Zooza design system). Load via Google Fonts or self-hosted. Apply as the primary sans-serif across all UI.

**Border radius:** `5px` (consistent with Zooza component library).

**Docusaurus CSS variable mapping** (in `src/css/custom.css`):
```css
:root {
  --ifm-color-primary: #FA6900;
  --ifm-color-primary-dark: #b36325;
  --ifm-color-primary-darker: #b36325;
  --ifm-color-primary-darkest: #7a4418;
  --ifm-color-primary-light: #fb8133;
  --ifm-color-primary-lighter: #fc9a5d;
  --ifm-color-primary-lightest: #fdb386;
  --ifm-font-family-base: 'DM Sans', system-ui, sans-serif;
  --ifm-background-color: #f2f5e5;
  --ifm-code-font-size: 95%;
  --docusaurus-highlighted-code-line-bg: rgba(250, 105, 0, 0.1);
}

[data-theme='dark'] {
  --ifm-color-primary: #FF8C42;
  --ifm-color-primary-dark: #C76521;
  --ifm-background-color: #1E1F1C;
  --ifm-code-background: #2A2C28;
}
```

#### Features enabled in classic preset:
- Light/dark mode toggle
- Responsive mobile layout
- Table of contents (right sidebar)
- Breadcrumbs
- Auto-generated social cards per page (Open Graph)
- **"Edit this page" disabled** — repo is public but maintained centrally; external contributions not invited.

### 4.5 Landing Page (Custom Hero)

**Decision: custom React landing page** — designed as a crossroads, not a marketing page. The goal is to orient first-time visitors quickly without using placeholder copy.

The page will use real content from the existing `index.md` (the two-path structure is already well-defined). Presented as a lightweight hero with two large pathway cards:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Zooza Developer Documentation                      │
│  Class management platform — API and widget guides  │
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │                     │  │                     │  │
│  │  Widgets            │  │  REST API           │  │
│  │                     │  │                     │  │
│  │  Embed booking,     │  │  Integrate your     │  │
│  │  calendar, and      │  │  backend directly   │  │
│  │  profile flows      │  │  with the Zooza     │  │
│  │  into any site      │  │  platform API       │  │
│  │                     │  │                     │  │
│  │  → Get started      │  │  → Get started      │  │
│  └─────────────────────┘  └─────────────────────┘  │
│                                                     │
│  Not sure which? → Read the Quickstart guide        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Implementation: `src/pages/index.js` as a React component. Card styling uses Zooza orange for the CTA links and teal for secondary accents. Clean, no hero image, no filler marketing copy — purely functional as a navigator.

Docs pages remain under `/docs/` prefix or routed at root depending on `routeBasePath` configuration.

### 4.6 SEO Architecture

Docusaurus handles SEO more comprehensively than MkDocs out of the box:

| Feature | MkDocs (current) | Docusaurus |
|---------|-----------------|------------|
| Sitemap | Plugin required | Built-in `@docusaurus/plugin-sitemap` |
| robots.txt | Manual static file | `@docusaurus/plugin-robots-txt` |
| Canonical URLs | Manual | Auto-generated |
| Open Graph tags | Not present | Auto-generated per page |
| Twitter card meta | Not present | Auto-generated |
| Social preview image | Not present | Auto-generated per page |
| Schema.org JSON-LD | Manual `head.html` override | `src/theme/Root.js` component |
| `<meta name="description">` | Per-page frontmatter | Per-page frontmatter |

Custom JSON-LD (TechArticle, BreadcrumbList) will be re-implemented as a `src/theme/Root.js` component — cleaner than the current `head.html` override and immune to theme upgrades.

### 4.7 LLM Optimisation

This is a first-class concern. The following strategy covers all major LLM indexing surfaces.

#### 4.7.1 `llms.txt` (primary LLM index)

The emerging `llms.txt` standard (llmstxt.org) places a machine-readable index at `https://docs.zooza.online/llms.txt`. It lists all important pages with one-line descriptions, enabling LLMs like ChatGPT browse mode, Perplexity, and custom RAG pipelines to efficiently index the site.

```
# Zooza API Documentation

> Zooza is a class management platform. This documentation covers
> the REST API and embeddable widgets for integrating Zooza into
> third-party websites and backends.

## Getting Started
- [Quickstart](https://docs.zooza.online/quickstart): Five-minute guide to widget embedding and first API call.
- [Concepts](https://docs.zooza.online/concepts): Glossary of Zooza terminology (programmes, classes, sessions, places, etc.).

## API Reference
- [API Overview](https://docs.zooza.online/api): When to use the API, integration decision flowchart.
- [Authentication](https://docs.zooza.online/api/authentication): Passwordless auth via email verification, PIN, or client_secret.
- [Error Handling](https://docs.zooza.online/api/errors): HTTP status codes, error response format, debugging tips.
- [OpenAPI Spec](https://docs.zooza.online/zooza_api_v1.yaml): Machine-readable OpenAPI 3.0 specification (full API contract).

## API Endpoints
- [Endpoints overview](https://docs.zooza.online/api/endpoints): Full REST API reference — all endpoints.

## Widgets
- [Widget Overview](https://docs.zooza.online/widgets): Installation (WordPress, Wix, embed), cookies, customer journeys.
- [Registration Widget](https://docs.zooza.online/widgets/registration-widget): Booking and class registration forms.
- [Calendar Widget](https://docs.zooza.online/widgets/calendar-widget): Class schedule and availability views.
- [Map Widget](https://docs.zooza.online/widgets/map-widget): Location-based venue and class search.
- [Profile Widget](https://docs.zooza.online/widgets/profile-widget): User account and booking management.
- [Video Widget](https://docs.zooza.online/widgets/video-widget): Video content embedding.
- [Checkout Widget](https://docs.zooza.online/widgets/checkout-widget): Purchase and checkout flows.

## Reference
- [Enums Reference](https://docs.zooza.online/enums): All API enum values with descriptions.
```

This file is committed to `static/llms.txt` and served statically. Updated manually when pages are added.

#### 4.7.2 `llms-full.txt`

**Decision: include all handwritten prose docs; reference the raw YAML; exclude auto-generated OpenAPI pages.**

Rationale: the generated per-endpoint MDX pages are structurally redundant with `zooza_api_v1.yaml`. Including all ~3,400 lines of YAML in `llms-full.txt` would make it unwieldy. The better pattern is:

- `llms-full.txt` contains full Markdown of all prose pages (index, concepts, quickstart, api/index, api/authentication, api/errors, enums, all 7 widget pages) — roughly 2,000–3,000 words of documentation.
- The raw YAML is referenced via URL in both `llms.txt` and at the top of `llms-full.txt`:

```
# Zooza API Documentation — Full Text

Machine-readable API spec (OpenAPI 3.0): https://docs.zooza.online/zooza_api_v1.yaml

---
[full prose content follows]
```

This keeps `llms-full.txt` concise and human-readable while ensuring LLMs with URL fetching can retrieve the full API contract in a single request.

Auto-generated at build time via a small Node.js script (`scripts/build-llms-full.js`) that concatenates the source Markdown files in documentation order.

#### 4.7.3 Semantic HTML

Docusaurus enforces clean heading hierarchy (one `<h1>` per page, proper nesting). Each page compiles to semantic HTML with `<article>`, `<nav>`, `<header>` — the structure LLMs prefer when scraping documentation.

#### 4.7.4 OpenAPI spec as a direct LLM resource

`zooza_api_v1.yaml` will be served at `https://docs.zooza.online/zooza_api_v1.yaml` (placed in `static/`). LLMs with URL access (ChatGPT browse, Claude, Gemini) can fetch the full API contract in one request. This URL is referenced explicitly in `llms.txt`.

#### 4.7.5 `robots.txt` — LLM crawlers allowed

All major LLM crawlers are explicitly permitted:

```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: *
Allow: /
```

---

## 5. URL Structure and Redirects

Current MkDocs URLs use `use_directory_urls: true`, producing paths like `/concepts/`, `/api/authentication/`, `/widgets/registration-widget/`.

Target: **zero URL breakage** for all prose documentation pages.

| Current URL | Post-migration URL | Change? |
|-------------|-------------------|---------|
| `/` | `/` | None |
| `/concepts/` | `/concepts/` | None |
| `/quickstart/` | `/quickstart/` | None |
| `/api/` | `/api/` | None |
| `/api/authentication/` | `/api/authentication/` | None |
| `/api/endpoints/` | `/api/endpoints/` → redirect to OpenAPI overview | Redirect only |
| `/api/errors/` | `/api/errors/` | None |
| `/widgets/` | `/widgets/` | None |
| `/widgets/registration-widget/` | `/widgets/registration-widget/` | None |
| `/widgets/calendar-widget/` | `/widgets/calendar-widget/` | None |
| `/widgets/map-widget/` | `/widgets/map-widget/` | None |
| `/widgets/profile-widget/` | `/widgets/profile-widget/` | None |
| `/widgets/video-widget/` | `/widgets/video-widget/` | None |
| `/widgets/checkout-widget/` | `/widgets/checkout-widget/` | None |
| `/enums/` | `/enums/` | None |
| _(new)_ `/api/endpoints/<operation>/` | — | New (generated by OpenAPI plugin) |

Redirect for `/api/endpoints/` is added via `@docusaurus/plugin-client-redirects`.

Note: Docusaurus default routes docs under `/docs/`. To preserve URLs without the `/docs/` prefix, set `routeBasePath: '/'` in the docs plugin config.

---

## 6. Migration Execution Plan

### Phase 1: Scaffold (1 day)
1. Initialise Docusaurus v3 project: `npx create-docusaurus@latest . classic --typescript` (or JS).
2. Configure `docusaurus.config.js`: site name (`Zooza Documentation`), URL (`https://docs.zooza.online`), base URL (`/`), `routeBasePath: '/'`.
3. Set navbar: logo, links to Widgets, API Reference, Quickstart.
4. Apply Zooza brand in `src/css/custom.css` (colour tokens, DM Sans font, border radius).
5. Disable `editUrl` (no "Edit this page" links).
6. Verify local dev server runs with correct URLs.

### Phase 2: Landing Page (0.5 days)
7. Build `src/pages/index.js` — crossroads hero with two pathway cards (Widgets / API) and Quickstart link.
8. Style with Zooza orange CTAs and teal accents; responsive grid for mobile.

### Phase 3: Content Migration (1–2 days)
9. Copy all `.md` files into Docusaurus `docs/` with same directory structure.
10. Add frontmatter to each file: `title`, `description`, `sidebar_position`.
11. Replace MkDocs-specific syntax (see Section 10, syntax replacement table).
12. Copy images to `static/img/`.
13. Configure `sidebars.js` to match current MkDocs `nav` structure.

### Phase 4: OpenAPI Integration (1 day)
14. Install `docusaurus-plugin-openapi-docs` and `docusaurus-theme-openapi-docs`.
15. Place `zooza_api_v1.yaml` in `static/`.
16. Configure plugin to generate pages under `docs/api/endpoints/`.
17. Run `docusaurus gen-api-docs all`.
18. Verify: nested schema descriptions, `allOf` schemas, request/response examples.
19. Add `@docusaurus/plugin-client-redirects` entry for `/api/endpoints/` → OpenAPI index.

### Phase 5: SEO and LLM Layer (1 day)
20. Configure `@docusaurus/plugin-sitemap`.
21. Configure `@docusaurus/plugin-robots-txt` with LLM-crawler allow rules.
22. Implement `src/theme/Root.js` for Schema.org JSON-LD (TechArticle, BreadcrumbList).
23. Write `static/llms.txt`.
24. Write `scripts/build-llms-full.js`; integrate into `npm run build` via `prebuild` script.
25. Verify `llms-full.txt` is generated to `static/` before Docusaurus build runs.

### Phase 6: Algolia Reconfiguration (0.5 days)
26. Update Algolia crawler configuration to use Docusaurus record structure:
    - Content selector: `.theme-doc-markdown`
    - Heading hierarchy: `lvl0` = navbar section, `lvl1`–`lvl5` = `h1`–`h5`
27. Trigger re-crawl after staging deployment.
28. Verify search results in staging.

### Phase 7: CI/CD Update (0.5 days)
29. Update both GitHub Actions workflows: swap Python/MkDocs for Node.js/Docusaurus.
30. Configure build output to `dist/` (set `outDir: 'dist'` in `docusaurus.config.js`) to keep SFTP destination paths unchanged.
31. Update `CLAUDE.md` and `README.md`.

### Phase 8: QA (1 day)
32. Audit every URL — 0 regressions vs current site (use a crawl tool or manual checklist).
33. Mobile responsiveness test.
34. Light and dark mode test.
35. OpenAPI reference: nested schema descriptions, `allOf` rendering, try-it console.
36. `llms.txt` and `llms-full.txt` completeness and formatting.
37. Lighthouse audit — target ≥90 Performance, ≥95 SEO, ≥90 Accessibility.
38. Algolia search: verify results and hierarchy.
39. Social card preview (Open Graph image).

### Phase 9: Deploy
40. Deploy to `test` branch → staging.
41. Manual sign-off (URLs, search, visual).
42. Deploy to `main` → production.

---

## 7. File Structure (Post-Migration)

```
api-docs/
├── docs/                             # Documentation Markdown (same content, updated frontmatter)
│   ├── index.md
│   ├── concepts.md
│   ├── quickstart.md
│   ├── enums.md
│   ├── api/
│   │   ├── index.md
│   │   ├── authentication.md
│   │   ├── errors.md
│   │   └── endpoints/               # Auto-generated by OpenAPI plugin (gitignored)
│   │       ├── index.mdx
│   │       └── <operation>.mdx      # One file per API endpoint
│   └── widgets/
│       ├── index.md
│       ├── registration-widget.md
│       ├── calendar-widget.md
│       ├── map-widget.md
│       ├── profile-widget.md
│       ├── video-widget.md
│       └── checkout-widget.md
├── src/
│   ├── css/
│   │   └── custom.css               # Zooza brand tokens (colours, DM Sans, border-radius)
│   ├── pages/
│   │   └── index.js                 # Custom crossroads landing page
│   └── theme/
│       └── Root.js                  # Global Schema.org JSON-LD injection
├── static/
│   ├── img/                         # Images (from docs/assets/images/)
│   ├── zooza_api_v1.yaml            # OpenAPI spec (also served as a direct URL)
│   ├── llms.txt                     # LLM index (manually maintained)
│   └── llms-full.txt                # Auto-generated by prebuild script
├── scripts/
│   └── build-llms-full.js           # Concatenates prose Markdown into llms-full.txt
├── docusaurus.config.js             # Main config
├── sidebars.js                      # Sidebar/navigation structure
├── package.json
├── .github/workflows/
│   ├── deploy-staging.yml           # Updated: Node.js + npm run build
│   └── deploy-production.yml        # Updated: Node.js + npm run build
└── business-specs/                  # Unchanged
```

---

## 8. Dependencies

```json
{
  "dependencies": {
    "@docusaurus/core": "^3.x",
    "@docusaurus/preset-classic": "^3.x",
    "@docusaurus/plugin-client-redirects": "^3.x",
    "@docusaurus/plugin-sitemap": "^3.x",
    "docusaurus-plugin-openapi-docs": "^latest",
    "docusaurus-theme-openapi-docs": "^latest"
  },
  "devDependencies": {
    "@docusaurus/module-type-aliases": "^3.x"
  }
}
```

Notes:
- `@docusaurus/plugin-sitemap` and `@docusaurus/plugin-mermaid` are included in `@docusaurus/preset-classic` — no separate install.
- `robots.txt` generated by `@docusaurus/plugin-robots-txt` (separate install).
- Algolia search via `@docusaurus/plugin-search-algolia` (included in preset, configured via `themeConfig.algolia`).
- No Python dependency. Node.js 18+ required.

---

## 9. CI/CD Changes

Both GitHub Actions workflows change from Python/MkDocs to Node.js/Docusaurus:

**Before:**
```yaml
- uses: actions/setup-python@v4
  with: { python-version: '3.12' }
- run: pip install -r requirements.txt
- run: mkdocs build
```

**After:**
```yaml
- uses: actions/setup-node@v4
  with: { node-version: '20' }
- run: npm ci
- run: npm run build
```

Build output: configured to `dist/` via `outDir: 'dist'` in `docusaurus.config.js`. SFTP deployment paths remain unchanged.

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenAPI plugin fails to render some nested schemas | Medium | High | Verify against current known issues before committing; `docusaurus-plugin-openapi-docs` has better schema handling than both previous renderers |
| URL changes cause 404s for external links | Low | High | Full URL audit before go-live; `plugin-client-redirects` for any unavoidable changes |
| Algolia reconfiguration disrupts search during migration | Medium | Medium | Keep current Algolia index live on production until new index is verified on staging |
| Docusaurus build time increases with multi-page OpenAPI generation | Medium | Low | Acceptable at current spec size (128KB YAML); add npm cache to CI |
| MkDocs-specific syntax not fully caught during migration | Medium | Medium | Use syntax checklist below; test every page in local dev before staging deploy |

**MkDocs syntax replacement checklist:**

| MkDocs syntax | Docusaurus equivalent |
|---------------|-----------------------|
| `!!! note "Title"` | `:::note[Title]` |
| `!!! warning` | `:::warning` |
| `!!! tip` | `:::tip` |
| `!!! info` | `:::info` |
| `=== "Tab label"` | `<Tabs><TabItem value="x" label="Tab label">` |
| ```` ```mermaid ```` fence | Same syntax — enabled via `@docusaurus/plugin-mermaid` in preset |
| `[OAD(./zooza_api_v1.yaml)]` neoteroi directive | Replaced by OpenAPI plugin auto-generation |
| `{{ page.meta.title }}` template variables | Not used in Docusaurus; use frontmatter `title:` |
| `site_name` in `mkdocs.yml` | `title` in `docusaurus.config.js` |

---

## 11. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Lighthouse SEO score | Unknown | ≥95 |
| Lighthouse Accessibility | Unknown | ≥90 |
| Lighthouse Performance | Unknown | ≥85 |
| Pages indexed in Google Search Console | Unknown | All documentation pages |
| `llms.txt` live | No | Yes, before production deploy |
| `llms-full.txt` live | No | Yes, auto-generated at build |
| OpenAPI nested schema descriptions | Functional (neoteroi) | Fully functional (build-time parsed) |
| Zero broken URLs vs current site | N/A | 100% |
| Algolia search operational | Partial (needs reconfiguration) | Fully operational on new index |

---

## 12. Decisions Log

All open questions from the initial draft have been resolved:

| # | Question | Decision |
|---|----------|----------|
| 1 | Landing page: docs page or custom hero? | **Custom React landing page** — crossroads layout with two pathway cards (Widgets / API). Uses real content, no filler copy. Falls back gracefully if content is sparse. |
| 2 | "Edit this page" links? | **Disabled.** Repo is public but centrally maintained. `editUrl` set to `undefined` in config. |
| 3 | Algolia setup? | **Reconfigure existing index.** Existing Algolia setup at `docs.zooza.online` needs crawler config updated for Docusaurus record structure. New index only if access is limited. |
| 4 | Brand colours? | **Extracted from `zooza_css/_shared/_presets.scss`.** Primary `#FA6900`, teal `#3aa39d`, font DM Sans, border-radius 5px. Full token mapping in Section 4.4. |
| 5 | OpenAPI single-page or multi-page? | **Multi-page.** One page per endpoint for SEO and LLM retrievability. |
| 6 | `llms-full.txt` include OpenAPI YAML? | **No.** Include all prose pages; reference YAML URL at top of file. YAML is better consumed directly as a machine-readable spec. Auto-generated at build time. |
