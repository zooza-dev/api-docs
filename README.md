# Zooza API Documentation

Documentation site for the [Zooza](https://zooza.online) platform — built with [Docusaurus v3](https://docusaurus.io/).

---

## Quick start

```bash
npm install
npm run gen-api-docs   # generate MDX pages from the API spec (first run only)
npm start              # docs site at http://localhost:3000
```

---

## Project structure

```
api/                         Multi-file OpenAPI source (what you edit)
  shared/                    Shared schemas, parameters, and error responses
  integration/               Integration API spec
    openapi.yaml             Entry point
    paths/                   One file per resource group
    components/              Schemas and path parameters
  llm/                       LLM API spec (same structure)
docs/                        Markdown documentation source
docs/api/reference/          Auto-generated OpenAPI MDX pages (committed)
src/                         React components, CSS, theme overrides
static/                      Static assets + bundled API YAML files
scripts/                     build-llms-full.js
dist/                        Built output (gitignored)
.github/                     CI/CD workflows
.claude/commands/            Claude Code custom skills
```

---

## Working on the API spec

The source of truth for the API is the multi-file spec in `api/`. Never edit the bundled files in `static/` directly.

### 1. Preview locally (fast iteration)

Renders the spec with Redoc — no Docusaurus build needed. Best for rapid design work.

```bash
npm run api:preview:integration
npm run api:preview:llm
```

Integration API opens at `http://localhost:3001`, LLM API at `http://localhost:3002`.

### 2. Lint

Validates the spec against the project ruleset (defined in `.redocly.yaml`).

```bash
npm run api:lint                  # lint both specs
npm run api:lint:integration      # lint one spec
npm run api:lint:llm
```

Run this before committing any spec changes.

### 3. Bundle → preview in Docusaurus

Collapses the multi-file spec into a single YAML, then run the Docusaurus dev server to see the final production look.

```bash
npm run api:bundle                # writes to static/zooza_integration_v1.yaml etc.
npm run gen-api-docs              # regenerates docs/api/reference/ from the bundled YAML
npm start                         # http://localhost:3000
```

### 4. Build pipeline summary

```
api:bundle          multi-file api/ → static/*.yaml
gen-api-docs        static/*.yaml → docs/api/reference/*.mdx
build-llms-full     generates static/llms-full.txt
docusaurus build    compiles the full static site → dist/
```

`npm run build` runs all four steps automatically.

---

## Using the `/api-design` skill

The `/api-design` skill is a Claude Code command that enforces the API style guide when designing new endpoints.

**When to use it:** any time you want to add or modify an endpoint — run it before writing YAML.

**How to invoke:**

Open this repo in Claude Code, then type:

```
/api-design
```

Then describe what you want to build. Examples:

- *"Design a GET /users/{user_id} endpoint for the Integration API"*
- *"Review my registrations.yaml path file for style guide violations"*
- *"Add a POST /courses endpoint with these fields: ..."*

The skill will:
1. Read the old spec (`static/zooza_api_v1.yaml`) to cross-reference terminology
2. Check the existing new spec for context
3. Produce complete YAML ready to paste into the correct path file
4. Flag the `openapi.yaml` registration lines needed

**Key conventions the skill enforces:**

| Rule | Value |
|------|-------|
| Field names | `snake_case` |
| IDs | `integer` |
| Datetimes | ISO 8601 UTC — `2026-03-05T10:00:00Z` |
| Dates | `2026-03-05` |
| `operationId` | `camelCase` — `listRegistrations`, `getCourse` |
| Error responses | Always use shared refs from `api/shared/responses/errors.yaml` |
| Pagination response | `{data: [...], meta: {total, page, page_size, next_cursor}}` |
| Single resource response | `{data: {...}}` |

---

## Deployment

GitHub Actions deploys via SFTP:

| Target | Trigger | Path |
|--------|---------|------|
| Staging | Push to `test` branch | `/zooza.sk/sub/docs/staging/` |
| Production | Manual `workflow_dispatch` on `main` | `/zooza.sk/sub/docs/prod/` |

Production deploy merges `test` into `main` before building.

## Branch strategy

Work on feature branches → merge to `test` for staging review → trigger production deploy from `main`.
