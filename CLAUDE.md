# Zooza API Documentation

spec_prefix: DOC
project_type: static-api-docs

## Project Type
Docusaurus v3 documentation site for the Zooza platform.

## Tech Stack
- Docusaurus v3 (React/Node.js)
- `@scalar/docusaurus` — renders the `/v3` API reference at `/api/reference` from `static/zooza_api_v3.json`
- `@docusaurus/preset-classic` — includes sitemap, Mermaid diagrams, Prism syntax highlighting
- Algolia DocSearch for search

## Local Development
```bash
npm install
npm start              # dev server at localhost:3000
```

## Build
```bash
npm run build
```
Output goes to `dist/`.

Build pipeline (via `npm run build`):
1. `node scripts/check-api-wording.js` — fails if pages or the `/v3` document mention internals (gateway, api-v1,
   `/v1`, forwarding, `X-ZOOZA-API-KEY`/`X-ZOOZA-TOKEN`). "Payment gateway", "SMS gateway" and `/widgets/v1/` are allowed.
2. `node scripts/check-tool-catalogue.js` — fails if `api/llm/tools.yaml` points at an operation not in the document
3. `node scripts/build-llms-full.js` — generates `static/llms-full.txt`
4. `docusaurus build --out-dir dist` — builds the static site

## API reference (`/v3` only)
- The docs describe **only the `/v3` API**. The older REST API is never mentioned, not even as legacy. Developers
  never read about the gateway, api-v1 or forwarding (spec DOC-20261118-001).
- Source: `static/zooza_api_v3.json` — **generated** by `npm run api:generate` from `openapi/` (spec
  DOC-20261120-001, handoff zooza-api-gateway-to-api-docs-20261120-001). **Never edit it by hand**; change an input
  and regenerate. `npm run api:check` (and a PR workflow) fails if the file differs from a fresh generation.
- Inputs, merged in this order: `openapi/subset.json` (api-v1's subset, pinned in `subset.lock.json`; update only
  with `npm run api:update-subset -- <commit>`), `gateway.json` (gateway operations), `patch.json` (our prose,
  RFC 7386), `access.json` (exposure, groups, cost, tiers — owner-approved via `.github/CODEOWNERS`).
- Step 5, examples (spec DOC-20261122-001): `openapi/examples/` is the demo apps' recorded calls, vendored at a
  pinned commit (`npm run api:update-examples -- <commit>`, lock `examples.lock.json`; never edit by hand).
  `openapi/examples.json` picks which go into the reference; the generator checks each against its schema.
- Guides (`docs/api/guides/`) show calls only with `<ApiExample id="<flow>/<file>" />`, never pasted JSON. An unknown
  id or an operation missing from the document fails the build.
- Facts about behaviour come from api-v1 and the gateway in handoffs; the prose is ours.
- The gateway vendors the file at tags `v3-doc-YYYY.MM.DD-N` cut from `main` (`npm run api:tag`). Access changes
  ship in order: tag → gateway rollout → docs deploy.
- Rendered by Scalar at `/api/reference` (config in `docusaurus.config.js`; palette overrides in
  `src/css/custom.css`). Deep links: `/api/reference#tag/<tag-slug>/<METHOD>/<path>`, e.g.
  `/api/reference#tag/registrations/GET/registrations/{ID}`.
- Guide pages: `docs/api/` (overview, getting-started, authentication, access-and-rate-limits, errors, keys).
  Tier and cost numbers live only on `access-and-rate-limits`.
- Agent tool catalogue: `api/llm/tools.yaml` (curated `/v3` operations as tools; groups/costs come from the
  document's `x-zooza-access`).

## Branch Strategy
- Feature branches → `test` (auto-deploys to staging via GitHub Actions)
- **Do not merge `test` → `main` by hand.** The production workflow performs that
  merge itself — promoting to production means triggering the workflow, nothing more.

## Deployment
Cloudflare Pages project `api-docs` (Git integration with `zooza-dev/api-docs`)
builds and hosts the site. Cloudflare runs `npm run build` (output `dist`,
`NODE_VERSION=20`) on every push it watches — no build or upload happens in
GitHub Actions.
- **Production** — Pages production branch `main` → `https://docs.zooza.online`
  (CNAME `docs` → `api-docs-200.pages.dev` at Websupport, the DNS host for
  `zooza.online`). To release, trigger `deploy-production.yml`
  (`workflow_dispatch`): it only runs `git merge origin/test` on `main` and
  pushes; Cloudflare builds the pushed `main`.
- **Staging** — Pages preview build of the `test` branch →
  `https://test.api-docs-200.pages.dev`.

## Key Directories
- `docs/` — Markdown source files
- `src/` — React components, CSS, theme overrides
- `static/` — Static assets (images, generated `/v3` API document, llms.txt, agent-setup.md, robots.txt)
- `openapi/` — Inputs of the generated `/v3` document (subset + lock, gateway, patch, access, examples + lock)
- `scripts/` — Build and API scripts (`build-llms-full.js`, `generate-api-doc.js`, `update-subset.js`, `update-examples.js`, `tag-api-doc.js`, `check-api-wording.js`, `check-tool-catalogue.js`)
- `api/llm/tools.yaml` — agent tool catalogue
- `dist/` — Built output (gitignored)
- `.github/workflows/` — CI/CD pipelines

## Brand
- Primary: `#FA6900` (orange) / dark: `#FF8C42`
- Secondary: `#3aa39d` (teal)
- Font: DM Sans (Google Fonts)
- Border radius: 5px

## Algolia Search
Configured in `docusaurus.config.js` under `themeConfig.algolia`.
The existing Algolia crawler needs to be reconfigured for Docusaurus record structure
after the first staging deploy. Update `appId` and `apiKey` with real values.
