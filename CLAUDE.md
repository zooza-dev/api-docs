# Zooza API Documentation

spec_prefix: DOC
project_type: static-api-docs

## Project Type
Docusaurus v3 documentation site for the Zooza platform.

## Tech Stack
- Docusaurus v3 (React/Node.js)
- `docusaurus-plugin-openapi-docs` — generates multi-page API reference from OpenAPI YAML
- `@docusaurus/preset-classic` — includes sitemap, Mermaid diagrams, Prism syntax highlighting
- Algolia DocSearch for search

## Local Development
```bash
npm install
npm run gen-api-docs   # generate OpenAPI reference pages (first time only)
npm start              # dev server at localhost:3000
```

## Build
```bash
npm run build
```
Output goes to `dist/`.

Build pipeline (via `npm run build`):
1. `npm run api:bundle` — bundles `api/integration/openapi.yaml` → `static/zooza_integration_v1.yaml` and `api/llm/openapi.yaml` → `static/zooza_llm_v1.yaml`
2. `docusaurus gen-api-docs all` — regenerates `docs/api/reference/` from `static/zooza_api_v1.yaml`
3. `node scripts/build-llms-full.js` — generates `static/llms-full.txt`
4. `docusaurus build --out-dir dist` — builds the static site

## OpenAPI Reference
- Reference spec (feeds `gen-api-docs`): `static/zooza_api_v1.yaml`
- Published spec sources: `api/integration/` and `api/llm/` (with `api/shared/`), bundled into `static/` by `npm run api:bundle`
- Generated pages: `docs/api/reference/` (committed to repo, regenerated at build)
- To regenerate after spec changes: `npm run gen-api-docs`

## Branch Strategy
- Feature branches → `test` (auto-deploys to staging via GitHub Actions)
- **Do not merge `test` → `main` by hand.** The production workflow performs that
  merge itself — promoting to production means triggering the workflow, nothing more.

## Deployment
SFTP deployment via GitHub Actions (both jobs run the full `npm run build`):
- **Staging** (`deploy-staging.yml`) — on push to `test` (path-filtered to `docs/`,
  `src/`, `static/`, `scripts/`, `docusaurus.config.js`, `sidebars.js`,
  `package.json`, `package-lock.json`), or manual dispatch.
  Deploys `dist/` → `/zooza.online/sub/staging-docs/`
- **Production** (`deploy-production.yml`) — `workflow_dispatch` only. Checks out
  `main`, runs `git merge origin/test` and pushes `main`, then builds and deploys
  `dist/` → `/zooza.online/sub/docs/`

Note: changes outside the staging path filter (e.g. `CLAUDE.md`, `handoffs/`,
`specs/`) do not trigger a staging deploy.

## Key Directories
- `docs/` — Markdown source files
- `docs/api/reference/` — Auto-generated OpenAPI MDX pages
- `src/` — React components, CSS, theme overrides
- `static/` — Static assets (images, YAML spec, llms.txt, robots.txt)
- `scripts/` — Build scripts (`build-llms-full.js`)
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
