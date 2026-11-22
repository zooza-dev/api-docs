---
handoff_id: api-docs-to-app-20261119-001
from: api-docs
to: app
status: agreed
created: 2026-11-19
updated: 2026-11-20
related_specs: [DOC-20261119-001]
related_handoffs:
  - 2026-11-18-app-to-api-docs-developers-section-link-targets.md
---

## Request

### What we need

We want developers reading docs.zooza.online to be able to chat with Zooza (Fin first, then a person) and report
problems without a Zooza login. Many integrators are agencies or freelancers who never log in to the app: the
company owner creates the API key and hands over the credentials. Our spec is `DOC-20261119-001`, still an idea.

After this:

1. **We can boot the same Intercom workspace on the docs for anonymous visitors**, with the app's settings left as
   they are. We need the app ID (we assume `drkz8pug`, as in `right_pane_help.js`), and confirmation that the workspace
   lets visitors without a JWT open the messenger.
2. **Docs conversations can be told apart from app conversations.** We agree an attribute name and value, e.g.
   `source: "docs"`, plus `current_url` (the same name the app uses). Support can then route and report on them.
3. **Someone owns the Intercom side for developers**, which is admin configuration, not code:
   - docs.zooza.online (or `llms-full.txt`) as a Fin content source;
   - Fin guidance for secrets: if someone pastes a `client_secret` or a token, tell them to revoke the key and never
     repeat it;
   - routing docs conversations to whoever answers API questions;
   - optionally, a ticket type for API bugs with `request_id`, operation, time, region, and expected versus actual.

   If that isn't the app team, tell us who, and we'll take it up with them.

### Why we need it

- The footer's only support route today is `mailto:support@zooza.online`. "Ask your client to file a ticket in the
  app" loses the `request_id` and the technical detail on the way.
- Fin can answer most developer questions straight from the docs, which now cover every page and every error code.
- What Fin can't answer shows us where the docs or the API document fall short.

### Constraints from our side

- The docs have no Zooza session, so visitors are anonymous: no JWT, no user or company identity.
- **Click to load:** nothing from Intercom loads, and no cookie is set, until the visitor opens the chat. This avoids
  a consent banner on the docs.
- No secrets in the docs. The app ID is public (it's in the app's client code); anything else must be safe to put in
  a public page.
- Your support pane, its JWT boot and its attributes stay exactly as they are.

### How we imagine it — open to challenge

- Same workspace, same app ID. Docs visitors boot as visitors with `custom_attributes: { source: "docs",
  current_url, docs_env }`, where `docs_env` marks staging and local tests so they can be filtered out.
- If identity verification is enforced for every Messenger session, the options we see are an exception for
  visitors, or a separate Messenger or brand for developers in the same workspace. You know the setup better than we
  do.

---

## Discussion

<!-- Each reply follows this format — append, never edit previous entries -->

### 2026-11-19 — app

Thanks. Point by point:

1. **App ID.** Confirmed: `drkz8pug`, the one in `components/right_pane_help/right_pane_help.js`. We can't tell from code
   whether the workspace lets visitors without a JWT open the Messenger. The app always boots with
   `intercom_user_jwt` from `GET intercom/identity`, so it has never tested the visitor path. Checking that is an
   Intercom admin task; see point 3.
2. **Telling conversations apart.** Agreed, with one addition from our side. So that both kinds of conversation are
   labelled and nobody has to filter on "attribute missing", the app now sends `source: "app"` on boot and on every
   route update, next to `current_url` and `current_page` (on our branch `feature-developers-section`, not deployed yet).
   The docs send `source: "docs"`, plus `current_url` and `docs_env` as you propose. Use `current_url` with the same
   name and meaning (the full page URL). Until our change is in production, app conversations have no `source` at all.
3. **Who owns the Intercom side.** It isn't the app team; it's Intercom admin configuration. The product owner will
   name who does the verification check, the Fin content source, the secrets rule, routing and the ticket type. We'll
   add the name here.

Your constraints are fine with us. The support pane, its JWT boot and its other attributes stay as they are; adding
`source` is the only change.


### 2026-11-20 — api-docs

Thanks. We accept `source: "app"` and use `current_url` with the same meaning. Point 3 is answered: the product owner
owns the Intercom side and has started setting it up. What's settled since your reply:

1. **Visitors work.** Intercom's install page has a "For website visitors without logins" mode, which boots with
   `app_id` only and keeps the conversation in a cookie. Messenger Security (your JWT) applies to identified users
   only, so it doesn't block docs visitors, and it stays enforced.
2. **Trusted domains are now set** (Messenger → General → Keep your Messenger secure):
   `zooza.app, *.zooza.app, zooza.online, *.zooza.online`, plus any marketing domains. **Intercom wouldn't accept
   `localhost`.** So once this is live, the app's chat may stop showing when the app runs on a developer's machine
   (your Security log shows `localhost` in use). Our suggestion, your call: on `localhost`, boot with the
   **Intercom test workspace's** app ID instead of `drkz8pug`. We do the same: the docs use the live ID only on
   `docs.zooza.online`, and the test workspace (or e-mail) everywhere else.
3. **The docs side is built** on our branch: Intercom loads on click only, boots as a visitor with
   `custom_attributes: { source: "docs", current_url, docs_env }` and `hide_default_launcher`, the same shape as your
   boot, and updates `current_url` on page changes. If Intercom can't load or show, it falls back to e-mail.

Moving to `agreed` with the Decision Summary below.

### 2026-11-20 — api-docs (correction)

There's **no Intercom test workspace**: the workspace switcher shows only "Zooza". Ignore our suggestion to boot
the test workspace on `localhost`. Once the trusted domains apply, the app's chat simply won't show when the app runs
on a developer's machine. If you need it there, the options are a separate (possibly billed) workspace, or testing on
`test.zooza.app`, which is already covered by `*.zooza.app`. On the docs, staging uses the live workspace with
`docs_env: "staging"`, and localhost falls back to e-mail. The Decision Summary is updated to match.

### 2026-11-20 — api-docs (test workspace exists)

Correction to our correction: the product owner enabled Intercom's **test workspace** (Settings → Workspace →
General → "Enable test workspace"). Its app ID is **`otazh78m`** ("Zooza [TEST]"). It has its own inbox and no
trusted-domain limit, so it works on `localhost`. The docs now use it on staging and localhost. If you want the app's
chat on `localhost` again, boot `otazh78m` there. Two things we hit that may save you time:
- Intercom's loader won't start for user agents containing `HeadlessChrome`, so set a normal user agent in Playwright
  tests.
- Right after boot, the first `showNewMessage` can be dropped or land on Home.

### 2026-11-20 — api-docs (FYI: tickets)

For your information, nothing to do. Developers report API problems through an Intercom **ticket type "API
Problem"**, offered on the Messenger Home for **Visitors** only ("Create a ticket"). The Home for **Users**, which
your logged-in customers see, stays exactly as it is. The docs' **Report a problem** button opens the Messenger Home.
We tried a workflow first and dropped it: its "Convert to ticket" step skips the ticket form. Set up in the test
workspace now; the product owner repeats it in the live workspace before the docs release.

---

## Decision Summary
<!-- Filled in when status moves to "agreed" — distilled from the discussion above -->

**What will be built:** The docs boot the same Intercom workspace (`drkz8pug`) for anonymous visitors on
`docs.zooza.online`, on click only, with `custom_attributes: { source: "docs", current_url, docs_env }`. The app adds
`source: "app"` to its boot and route updates. Every conversation is labelled by `source`.
**What will NOT be built (and why):** No login or identity on the docs (no session there). No change to the app's JWT
boot or its other attributes. No Intercom configuration in code: Fin content, guidance, routing and ticket types are
set in Intercom by the product owner.
**Constraints agreed:** `current_url` means the full page URL on both sides. Nothing loads from Intercom on the docs
before a click (no consent banner needed). Only public values (the app ID) appear in docs code. Trusted domains are
`zooza.app, *.zooza.app, zooza.online, *.zooza.online` (+ marketing domains). `localhost` can't be listed there,
so staging and localhost use the test workspace `otazh78m`.
**Each party's responsibilities:**

| Project | Responsibility | Target |
|---------|---------------|--------|
| api-docs | Click-to-load chat with `source: "docs"`; entry points on every page, Errors and Error codes; footer Support opens chat (DOC-20261119-001) | with the /v3 docs release |
| app      | `source: "app"` on boot and route updates (`feature-developers-section`) | with `feature-developers-section` |
| product owner | Intercom: trusted domains (done), Fin content source and guidance, routing to a developer team, optional API-problem ticket type | before docs release |

---

## Resolution
<!-- Filled in when status moves to "resolved" -->
**Resolved on:**
**Outcome:**
**Related specs/PRs:**
