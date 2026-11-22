# Zooza API Documentation

Documentation site for the [Zooza](https://zooza.online) platform, built with [Docusaurus v3](https://docusaurus.io/).
It covers the `/v3` API, the widgets and the AI assistants.

---

## Quick start

```bash
npm install
npm start              # docs site at http://localhost:3000
```

---

## Project structure

```
docs/                        Markdown documentation source
  api/                       /v3 guide pages (overview, getting started, auth, limits, errors, keys)
static/
  zooza_api_v3.json          The generated /v3 document (never edit by hand: npm run api:generate)
  agent-setup.md             Setup file for AI coding agents, served at /agent-setup.md
  llms.txt                   Index for LLMs (llms-full.txt is generated at build)
openapi/                     Inputs of the /v3 document: api-v1 subset (pinned), gateway operations, patch, access
api/llm/tools.yaml           Agent tool catalogue: curated /v3 operations as named tools
scripts/                     Build and API scripts
src/                         React components, CSS, theme overrides
.github/workflows/           /v3 document check on pull requests; production promotion
dist/                        Built output (gitignored)
```

---

## The API reference

The reference at `/api/reference` is rendered by [Scalar](https://scalar.com) from `static/zooza_api_v3.json`.
We **generate** that file, and the gateway serves the same file at `/v3/openapi.json` (spec DOC-20261120-001).
It is the published reference and also the gateway's routing, authorization and rate-limit table.

| Input (`openapi/`) | What it holds | Who changes it |
|---|---|---|
| `subset.json` + `subset.lock.json` | api-v1's subset, pinned by commit | `npm run api:update-subset -- <commit>` (reads `../api-v1`) |
| `gateway.json` | `POST /token`, `GET /me`, the gateway's responses, headers and schemas | us, from facts the gateway sends |
| `patch.json` | prose, examples, tags (RFC 7386 merge patch) | us |
| `access.json` | which operations `/v3` exposes, access group, cost, tiers, token limits | API owner's approval (`CODEOWNERS`) |

- **Never edit `static/zooza_api_v3.json` by hand.** Change an input and run `npm run api:generate`. A pull request
  fails if the file isn't exactly what the generator makes (`npm run api:check`).
- **Opening an operation** to partners is one entry in `access.json`. An entry the subset doesn't have fails the
  generator, and so does anything the gateway would refuse at start-up.
- **Releasing** to the gateway: `npm run api:tag` on an up-to-date `main` cuts `v3-doc-YYYY.MM.DD-N`; push the tag
  and tell the gateway. For access changes: tag, then the gateway's rollout, then the docs deploy.
- **Deep links** use Scalar anchors: `/api/reference#tag/<tag-slug>/<METHOD>/<path>`, for example
  `/api/reference#tag/registrations/GET/registrations/{ID}`.

The docs describe only the `/v3` API. Pages never mention how it's built (no gateway, api-v1, `/v1`, forwarding)
or the retired `X-ZOOZA-API-KEY`/`X-ZOOZA-TOKEN` auth. `npm run api:check-wording` enforces this, and so does
the build.

## The agent tool catalogue

`api/llm/tools.yaml` names a small set of `/v3` operations as tools for AI agents (`list_programmes`,
`search_registrations`, `update_registration`, …). Each entry points at one real operation. Access groups and point
costs are read from the document, never copied. `npm run api:check-tools` validates the catalogue and prints it
with groups and costs. The build fails if a tool points at an operation that no longer exists.

---

## Build pipeline

`npm run build` runs:

```
check-api-wording     pages + /v3 document must not mention internals or the retired API
check-tool-catalogue  api/llm/tools.yaml must match operations in the document
build-llms-full       generates static/llms-full.txt
docusaurus build      compiles the site → dist/
```

## Deployment

Cloudflare Pages (project `api-docs`, Git integration) builds and hosts the site:

| Target | Trigger | URL |
|--------|---------|-----|
| Staging | Push to `test` | https://test.api-docs-200.pages.dev |
| Production | `Deploy to Production` workflow (merges `test` into `main`) | https://docs.zooza.online |

## Branch strategy

Work on feature branches → merge to `test` for staging review → trigger the production workflow. Don't merge
`test` into `main` by hand.
