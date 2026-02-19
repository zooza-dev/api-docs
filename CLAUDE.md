# Zooza API Documentation

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
1. `docusaurus gen-api-docs all` — regenerates `docs/api/reference/` from `static/zooza_api_v1.yaml`
2. `node scripts/build-llms-full.js` — generates `static/llms-full.txt`
3. `docusaurus build` — builds the static site

## OpenAPI Reference
- Spec: `static/zooza_api_v1.yaml`
- Generated pages: `docs/api/reference/` (committed to repo, regenerated at build)
- To regenerate after spec changes: `npm run gen-api-docs`

## Branch Strategy
- Feature branches → `test` (auto-deploys to staging via GitHub Actions)
- `test` → `main` (manual deploy to production via workflow_dispatch)

## Deployment
SFTP deployment via GitHub Actions:
- **Staging:** push to `test` → `/zooza.sk/sub/docs/staging/`
- **Production:** manual trigger on `main` → `/zooza.sk/sub/docs/prod/`

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
