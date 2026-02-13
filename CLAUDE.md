# Zooza API Documentation

## Project Type
MkDocs documentation site for the Zooza platform.

## Tech Stack
- MkDocs with Material theme
- Plugins: mermaid2 (diagrams), swagger-ui-tag (API docs)
- pymdown-extensions for enhanced Markdown

## Local Development
```bash
pip install -r requirements.txt
mkdocs serve
```

## Build
```bash
mkdocs build
```
Output goes to `dist/`.

## Branch Strategy
- Feature branches → `test` (auto-deploys to staging via GitHub Actions)
- `test` → `main` (manual deploy to production via workflow_dispatch)

## Deployment
SFTP deployment via GitHub Actions:
- **Staging:** push to `test` → `/zooza.sk/sub/docs/staging/`
- **Production:** manual trigger on `main` → `/zooza.sk/sub/docs/prod/`

## Key Directories
- `docs/` — Markdown source files
- `overrides/` — MkDocs Material theme overrides
- `dist/` — Built output (gitignored)
- `.github/workflows/` — CI/CD pipelines
