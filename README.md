# Zooza API Documentation

Documentation site for the [Zooza](https://zooza.online) platform — built with [Docusaurus v3](https://docusaurus.io/).

## Local development

```bash
npm install
npm run gen-api-docs
npm start
```

`gen-api-docs` generates the OpenAPI reference pages into `docs/api/reference/` (required on first run and after editing the YAML). The dev server runs at http://localhost:3000.

## Build

```bash
npm run build
```

Output goes to `dist/`. The build runs three steps automatically:
1. Regenerates `docs/api/reference/` from `static/zooza_api_v1.yaml`
2. Generates `static/llms-full.txt` (LLM-readable full-text index)
3. Builds the static site

## Updating the OpenAPI reference

Edit `static/zooza_api_v1.yaml`, then:

```bash
npm run gen-api-docs
```

This regenerates the MDX files in `docs/api/reference/`. Commit the updated files.

## Project structure

```
docs/                    Markdown documentation source
docs/api/reference/      Auto-generated OpenAPI pages (committed)
src/                     React components, CSS, theme overrides
static/                  Static assets: images, zooza_api_v1.yaml, llms.txt
scripts/                 build-llms-full.js — generates llms-full.txt at build time
dist/                    Built output (gitignored)
.github/                 CI/CD workflows
```

## Deployment

GitHub Actions deploys via SFTP:

| Target | Trigger | Path |
|--------|---------|------|
| Staging | Push to `test` branch | `/zooza.sk/sub/docs/staging/` |
| Production | Manual `workflow_dispatch` on `main` | `/zooza.sk/sub/docs/prod/` |

Production deploy merges `test` into `main` before building.

## Branch strategy

Work on feature branches, merge to `test` for staging review, then trigger production deploy from `main`.
