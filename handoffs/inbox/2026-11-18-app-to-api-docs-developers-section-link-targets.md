---
handoff_id: app-to-api-docs-20261118-001
from: app
to: api-docs
status: in_discussion
created: 2026-11-18
updated: 2026-11-22
related_specs: [APP-20261118-001, APP-20261118-003, APP-20261118-004, APP-20261118-005, APP-20261118-006]
---

## Request

### What we need

The admin app is getting a new **Developers** section (overview pitch, API keys, widgets, MCP connector), and its
**Publish** page is being rebuilt for business users. Both will send readers to docs.zooza.online for the complete
widget and API documentation. The owner wants that connection to be strong and natural: the app sells and gets
people started, and the docs carry them the rest of the way.

Since the docs are being restructured for the same coordinated release, we need two things from you:

1. **Stable link targets** for the pages the app will link to. Each target should be a URL you commit to keeping
   (or redirecting) after the restructure. Topics:
   - docs home / "build on Zooza" landing;
   - API: getting started / quickstart (from key to first call), authentication and tokens (`/v3/token`), access
     levels and rate limits, API reference root;
   - widgets: overview, embed methods, each widget page (registration, profile, calendar, map, checkout, video,
     contact), the NPM package;
   - the examples we plan to feature on the Widgets page: branded booking tiles (`render_course_tile`), a
     catalogue/timetable filtered by metadata (`metadata_in`), multi-step trial booking;
   - AI assistants / MCP connector;
   - concepts / glossary (for the "what you don't have to build" tiles to deep-link into).
   Existing deep links in the app's programme-settings help (e.g. `/widgets/registration-widget/#translations`,
   `#preferred_currency`, `#metadata_in`, `#render_course_tile`, `/widgets/profile-widget/#translations`) should
   keep resolving, or tell us their new addresses.
2. **A hosted setup file for AI coding agents.** This is a plain Markdown file at a stable URL that a developer's
   coding agent (Claude Code, Cursor, …) can read to integrate with Zooza correctly. The app's "Copy prompt for
   your AI agent" buttons will be a short prompt that points to this file plus the reader's non-secret context
   (API base URL, key's `client_id`, access level, widget id).

### Why we need it

- If the app hard-codes today's URLs, the restructure breaks every link on release day. If it links only to the
  docs home, the "strong connection" the owner asked for is lost.
- Competitors already do the AI agent part: SimplyBook.me's API page opens with "Using a coding agent?" and a
  prompt pointing to a hosted setup file. Clerk and Stripe do similar. A pointer to a hosted file goes stale less
  often than pasting a long prompt.

### Constraints from our side

- **No secrets, anywhere.** The setup file must never ask the agent to request a client secret in chat. The app
  never puts a secret in the prompt.
- **Same names.** Concept names on the app pages follow the API and docs (handoff api-v1-to-app-20261118-002), so
  please flag any renames in the restructure.
- **Only what exists.** The app shows webhooks, sandbox, setup/import tools and SDK as "coming". If the docs
  describe any of them as live (or the reverse), tell us so we stay consistent.
- The app keeps every docs URL in a single module, so a list of final URLs (even late) is enough for us. We can
  swap them right before release.

### How we imagine it — open to challenge

- A short table in your reply: topic → final URL. Anchors are welcome where a section is a natural landing spot.
- The agent setup file covers:
  1. what Zooza is in two lines;
  2. how to authenticate (`POST /v3/token`) with the secret read from a git-ignored `.env`;
  3. one read-only first call to verify;
  4. "ask before any write", since keys act on live data and there is no sandbox yet;
  5. where the reference and widget docs are.
  Possibly also `llms.txt` for the whole site, if you already plan one.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

---

### 2026-11-18 — api-docs

Yes to both. We're restructuring the API section for the same release (spec `DOC-20261118-001`), so here are the
targets we commit to, with redirects if anything ever moves. We accept your constraints: no secrets anywhere, the
same names, and only what exists.

**What changes on our side (owner, 2026-11-18):** the docs describe only the `/v3` API. The older REST API and its
`X-ZOOZA-API-KEY` auth disappear from the docs entirely, with no legacy section. Widgets are unaffected.

**Stable link targets**

| Topic | URL |
|---|---|
| Docs home / build on Zooza | `/` |
| API overview | `/api` |
| Getting started (key → first call) | `/api/getting-started` |
| Authentication and tokens (`POST /v3/token`) | `/api/authentication` |
| Access levels and rate limits | `/api/access-and-rate-limits` |
| Company scope | `/api/access-and-rate-limits#company-scope` |
| Errors | `/api/errors` |
| Key management / security practices | `/api/keys`, `/api/keys#security` |
| API reference root | `/api/reference` |
| A resource in the reference | `/api/reference#tag/registrations` (also `programmes`, `classes`, `sessions`, …) |
| One operation | `/api/reference#tag/registrations/GET/registrations/{ID}` (the format our reference uses; we'd rather you link the resource level) |
| AI agent setup file | `/agent-setup.md` |
| AI assistants / MCP | `/ai-assistants` |
| Concepts / glossary | `/concepts` |
| Widgets overview / embed methods | `/widgets`, `/widgets/embed-methods` (unchanged) |
| Each widget | `/widgets/registration-widget`, `/widgets/profile-widget`, `/widgets/calendar-widget`, `/widgets/map-widget`, `/widgets/checkout-widget`, `/widgets/video-widget`, `/widgets/contact-widget` (unchanged) |
| NPM package | not documented on the site yet. Which package do you mean (name on npm)? We'll add a page or section and give you the URL |
| Featured examples | `/examples/branded-booking-tiles`, `/examples/filtered-timetable`, `/examples/multi-step-trial-booking` (unchanged) |

Your existing deep links (`/widgets/registration-widget/#translations`, `#preferred_currency`, `#metadata_in`,
`#render_course_tile`, `/widgets/profile-widget/#translations`) aren't touched by this restructure and keep
resolving. `/examples/filtered-timetable` stays at its URL, but its code moves to `/v3` with a bearer token.
`/examples/custom-catalogue` does the same.

**Agent setup file.** We'll host `/agent-setup.md` as plain Markdown, covering your five points:

1. what Zooza is, in two lines;
2. `POST /v3/token` with the secret read from a git-ignored `.env`;
3. `GET /v3/me` as the read-only first call;
4. "ask before any write", because keys act on live data and there's no sandbox;
5. where the reference and widget docs are.

It never asks the agent to request a secret. Your prompt can pass the non-secret context (base URL, `client_id`,
access level, widget id). The file will say to treat those as given and to read the secret from the environment
only. `/llms.txt` already exists and will be updated to the `/v3` API.

**Consistency check.** Webhooks, sandbox, setup/import tools and an SDK are "coming" in our docs too, or not
mentioned. We'll flag any difference before release.

**Status:** moving to `in_discussion`. If the table works for you, reply and we'll move this to `agreed`. We'll send
the final list again right before release, in case an anchor changes during writing.

### 2026-11-22 — app

Sorry for the slow reply. Your table works for us. Below is the full list of links the app uses, each with the
target we'd take from your table. **Please confirm each one, or correct it, and tell us whether it is live on
`docs.zooza.online` today.** We switch `lib/classes/docs_links.js` to these and ship them with the Developers
section, so a link to a page that doesn't exist yet would break on release. If a page isn't live yet, give us a
date or the URL to use until then.

| App link key | Where it shows in the app | Today (interim) | Proposed final |
|---|---|---|---|
| `home` | Developers overview, docs CTA | `/` | `/` |
| `concepts` | overview | `/concepts/` | `/concepts` |
| `api_overview` | overview, API card | `/api/` | `/api` |
| `api_quickstart` | API keys quick start ("read the getting started") | `/quickstart/#rest-api-quickstart` | `/api/getting-started` |
| `api_authentication` | API keys "Read the docs" | `/api/authentication/` | `/api/authentication` |
| `api_token` | quick start, "get a token" step | `/api/authentication/#via-client-secret-server-to-server` | `/api/authentication` + **which anchor** for `POST /v3/token` with a client secret? |
| `api_rate_limits` | API keys rate limit help | `/api/#rate-limiting` | `/api/access-and-rate-limits` |
| — (new) | company scope help on the key form | — | `/api/access-and-rate-limits#company-scope` |
| — (new) | key management / security | — | `/api/keys`, `/api/keys#security` |
| `api_errors` | error help | `/api/errors/` | `/api/errors` |
| `api_reference` | API card, quick start | `/api/reference/` | `/api/reference` |
| `widgets_overview` | Developers → Widgets | `/widgets/` | `/widgets` |
| `widgets_quickstart` | Publish | `/quickstart/#widgets-quickstart` | **?** is there a widgets getting-started now, or `/widgets`? |
| `widgets_install` | Publish | `/widgets/#installation-options` | `/widgets/embed-methods`? |
| `widgets_embed_methods` | Developers → Widgets | `/widgets/embed-methods/` | `/widgets/embed-methods` |
| `widgets_npm` | Developers → Widgets, NPM block | `/widgets/#installation-options` | **?** see the NPM answer below |
| `widget_registration` … `widget_contact` (7) | per-widget docs links | `/widgets/<name>-widget/` | unchanged, as you said |
| `examples` | overview | `/examples/` | **?** is there an index page? |
| `example_branded_tiles`, `example_filtered_timetable`, `example_trial_booking` | overview | as today | unchanged |
| `example_custom_catalogue` | overview | `/examples/custom-catalogue/` | unchanged? It's missing from your table, but you mention it moving to `/v3`. |
| `ai_assistants` | overview, MCP page | `/ai-assistants/` | `/ai-assistants` |
| `mcp` | Developers → MCP connector | `/ai-assistants/#zooza-mcp-server` | `/ai-assistants` + **which anchor** for the MCP server? |
| `agent_setup` | API keys "Copy for LLM" prompt, overview | `/ai-assistants/#for-coding-agents` | `/agent-setup.md` |
| `llms_txt` | overview | `/llms.txt` | `/llms.txt` |

**Trailing slash.** Your table has none, and today's links all have one. Which form is canonical, and does the
other redirect?

**The NPM package you asked about.** The Developers → Widgets page shows install commands for
`@zooza/widgets-react`, `@zooza/widgets-vue`, `@zooza/widgets-svelte`, `@zooza/widgets-wc` (web component) and
`@zooza/widgets-core` (framework-free), currently v0.1.1. We need one URL for "how to install and use the
NPM packages": a page or a section under `/widgets`. Until it exists we keep the block linking to `/widgets`.

**Agent setup file:** your five points match what our "Copy for LLM" prompt expects. The prompt passes the base
URL, `client_id`, access level and widget id, and tells the agent to read the secret from `.env`. Please tell us
when `/agent-setup.md` is live.

Once you've confirmed, we'll move this to `agreed`.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:**
**What will NOT be built (and why):**
**Constraints agreed:**
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| app      | Keep all docs links in one module; swap to final URLs before release | release |
| api-docs | Stable link targets; hosted agent setup file | release |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
