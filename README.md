# Zooza API Documentation

Documentation site for the Zooza platform, built with [MkDocs](https://www.mkdocs.org/) and [Material for MkDocs](https://squidfundamentals.github.io/mkdocs-material/).

## Local Development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Dev server

```bash
mkdocs serve
```

Starts a local server at `http://127.0.0.1:8000` with live reload.

### Build only

```bash
mkdocs build
```

Generates static files into `dist/`. This does not start a server — use `mkdocs serve` for local preview.

## Deployment

Deployment is handled via GitHub Actions using SFTP.

- **Staging:** Automatically deploys on push to `test` branch → `/zooza.sk/sub/docs/staging/`
- **Production:** Manual trigger via workflow_dispatch on `main` → `/zooza.sk/sub/docs/prod/`

## Branch Strategy

1. Create feature branches from `test`
2. Merge into `test` — triggers automatic staging deploy
3. Production deploy merges `test` into `main` and deploys (manual trigger)

## Project Structure

```
docs/           — Markdown source files
overrides/      — MkDocs Material theme overrides
dist/           — Built output (gitignored)
mkdocs.yml      — MkDocs configuration
requirements.txt — Python dependencies
```
