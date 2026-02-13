Review and fix all documentation files in the `docs/` directory.

## Instructions

1. Read every `.md` file in `docs/` (including subdirectories)
2. For each file, check and fix the following:

### Formatting
- Consistent heading hierarchy (h1 → h2 → h3, no skipped levels)
- Consistent use of blank lines before/after headings, code blocks, and lists
- Proper Markdown syntax (no broken links, images, or code fences)
- Consistent list style (all unordered lists use `-`, not mixed `*` and `-`)
- Proper indentation in nested lists and code blocks

### Styling
- Consistent use of bold, italic, and inline code (e.g. always backtick parameter names, API paths, code references)
- Consistent admonition style (use MkDocs Material admonitions properly)
- Code blocks have language specifiers (```json, ```bash, etc.)
- Consistent capitalization in headings (Title Case or Sentence case — pick whichever is dominant and make all match)

### Grammar
- Fix spelling errors
- Fix grammatical issues (subject-verb agreement, tense consistency, etc.)
- Fix punctuation (consistent use of periods in lists, Oxford commas, etc.)
- Ensure sentences are clear and concise

### Terminology consistency
- Use the same term for the same concept throughout all docs (e.g. don't mix "widget" and "component" for the same thing)
- Consistent naming of Zooza-specific concepts, product names, and features
- Consistent API terminology (endpoint, request, response, parameter, etc.)
- Flag any terminology inconsistencies found and normalize to the most common usage

## Process

- Use the task list to track progress file by file
- For each file: read it, identify all issues, then apply fixes
- After fixing all files, provide a summary of changes made across all docs
