# API renderer switch: swagger-ui-tag → neoteroi-mkdocs

## Context

The current API reference page (`docs/api/endpoints.md`) renders the OpenAPI spec via `mkdocs-swagger-ui-tag`, which embeds Swagger UI in an iframe. Swagger UI has a known, unfixed bug where deeply nested property descriptions are silently dropped from the rendered output — for example the `attendance` field description on line 557 of the spec, which documents all enum values, is not visible in the current output.

The replacement is `neoteroi-mkdocs`, which parses the OpenAPI YAML in Python at build time and generates native MkDocs Markdown. Because there is no browser-side JavaScript renderer, the `$ref` description problem cannot occur. Output inherits the Material theme fully — search, nav, and styling all work as for the rest of the site.

Key properties of the new renderer:
- Renders all property descriptions regardless of nesting depth
- Renders `example` (singular) and `examples` (plural, named) values from the spec as code blocks
- Auto-generates a JSON example from schema type/format/enum when no explicit example is defined
- Static output — no "try it" console, which is intentional
- Requires one CSS file added to `extra_css`

---

## Files to modify

| File | Change |
|------|--------|
| `requirements.txt` | Swap `mkdocs-swagger-ui-tag` for `neoteroi-mkdocs` |
| `mkdocs.yml` | Swap plugin, add `extra_css`, add required markdown extensions |
| `docs/api/endpoints.md` | Replace `<swagger-ui>` tag with `[OAD(...)]` directive |

## Files to create

| File | Purpose |
|------|---------|
| `docs/assets/neoteroi.mkdocsoad.css` | Neoteroi's stylesheet, copied from installed package |

---

## Execution order

| Step | File | Depends on |
|------|------|------------|
| 1 | `requirements.txt` | Nothing |
| 2 | `mkdocs.yml` | Step 1 installed |
| 3 | `docs/assets/neoteroi.mkdocsoad.css` | Step 1 installed |
| 4 | `docs/api/endpoints.md` | Steps 2–3 complete |

---

## Step 1: Modify `requirements.txt`

Remove `mkdocs-swagger-ui-tag`, add `neoteroi-mkdocs`.

```
mkdocs
mkdocs-material
mkdocs-mermaid2-plugin
neoteroi-mkdocs
pymdown-extensions
```

---

## Step 2: Modify `mkdocs.yml`

### Plugin section

Remove `swagger-ui-tag`, add `neoteroi.mkdocsoad`.

```yaml
plugins:
  - search
  - mermaid2
  - neoteroi.mkdocsoad
```

### Markdown extensions

Add `pymdownx.details` (required by neoteroi for collapsible sections). The others are already present.

```yaml
markdown_extensions:
  - admonition
  - attr_list
  - def_list
  - pymdownx.details
  - pymdownx.emoji:
      emoji_index: !!python/name:material.extensions.emoji.twemoji
      emoji_generator: !!python/name:material.extensions.emoji.to_svg
  - pymdownx.highlight:
      linenums: true
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:mermaid2.fence_mermaid_custom
  - pymdownx.tabbed:
      alternate_style: true
```

### Extra CSS

```yaml
extra_css:
  - assets/neoteroi.mkdocsoad.css
```

---

## Step 3: Create `docs/assets/neoteroi.mkdocsoad.css`

Copy the stylesheet from the installed package into the docs assets directory:

```bash
cp $(python -c "import neoteroi.mkdocs; import os; print(os.path.dirname(neoteroi.mkdocs.__file__))")/static/neoteroi.mkdocsoad.css docs/assets/neoteroi.mkdocsoad.css
```

This file must be committed to the repository so it is available in CI/CD builds.

---

## Step 4: Modify `docs/api/endpoints.md`

Replace the `<swagger-ui>` tag with the neoteroi OAD directive. The front matter is unchanged.

### Before

```markdown
---
title: Zooza API Reference
description: API reference for Zooza's REST API
authors:
  - Martin Rapavý
date: 2025-10-05
updated: 2025-12-05
---

<swagger-ui
            syntaxHighlightTheme="monokai"
            src="zooza_api_v1.yaml"/>
```

### After

```markdown
---
title: Zooza API Reference
description: API reference for Zooza's REST API
authors:
  - Martin Rapavý
date: 2025-10-05
updated: 2025-12-05
---

[OAD(./zooza_api_v1.yaml)]
```

---

## Verification

After running `mkdocs serve`, confirm:

1. The endpoints page loads without errors
2. The `attendance` field (spec line 557) shows its full description including all enum value explanations
3. Named examples on `schedule_id` and `schedule_groups` parameters render as code blocks
4. Auto-generated examples appear for endpoints with no explicit example defined
5. Site search indexes the endpoint content (it will, because output is native Markdown)

---

## Known risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Open issue #69: some request/response descriptions not rendered | Medium | Verify in local preview before deploying; fall back to Redoc if widespread |
| Open issue #81: `allOf` schemas not rendering correctly | Low — not used heavily in this spec | Audit spec for `allOf` usage before go-live |
| CSS file not committed → broken styles in CI | Low | Include the copy step in dev setup instructions |
| neoteroi visual output differs significantly from current layout | Expected | Review with stakeholders before deploying to production |

---

## Rollback

Revert `requirements.txt`, `mkdocs.yml`, and `docs/api/endpoints.md` to their previous state. The `docs/assets/neoteroi.mkdocsoad.css` file can be left in place or removed — it has no effect without the plugin.
