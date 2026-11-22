---
spec_id: DOC-20261119-001
title: "Developer support chat on the docs (Intercom Fin)"
status: in_progress
created: 2026-11-19
updated: 2026-11-20
author: api-docs
owner: api-docs
last_verified: 2026-11-20
project_type: other
depends_on: [DOC-20261118-001]
related_handoffs:
  - 2026-11-19-api-docs-to-app-developer-support-chat.md
tags: [support, intercom, fin, developers, feedback]
feature_branch: "feature-v3-developer-docs"
changelog: ""
changelog_version: ""
changelog_date: ""
docs_version: ""
docs_communicated: ""
---

## Goal

Developers who integrate with the `/v3` API should be able to ask a question or report a problem from the page they
are reading, without a Zooza login. Many of them won't have one: a typical integrator is an agency or freelancer
working for a company whose owner created the API key. Today the only route is a `mailto:` link in the footer, or
asking the client to file a ticket in the app. Both are slow, and the second loses the technical detail on the way.
We want questions answered on the spot where the docs already answer them (Fin), and real bugs reaching a person
with what they need to investigate: `request_id`, operation, time and region. A side effect: what developers ask
shows us where the docs or the API document fall short.

## Scope

**In scope**
- Intercom Messenger on docs.zooza.online, same workspace as the app, for anonymous visitors.
- **Click to load:** nothing from Intercom loads, and no cookie is set, until the visitor opens the chat. This avoids a
  consent banner and keeps the pages fast.
- Contextual entry points that open the chat with the page and a short template filled in:
  - every page footer: "Something unclear or wrong on this page?";
  - the Errors page: "Got a `500` or something unexpected? Send us the `request_id`";
  - the Error codes page: "A code that isn't clear?".
- The footer "Support" link opens the chat, with `support@zooza.online` as the fallback.
- Every conversation from the docs carries an attribute saying it came from the docs, plus the page URL, so it can be
  routed and reported on.
- Wording on the entry points and in the guide: "send the `request_id`, never your `client_secret` or a token".
- Fin uses the docs as a content source, ideally `llms-full.txt`, which includes every page and the error code list.

**Out of scope**
- Logging in or identifying visitors on the docs (no Zooza session there).
- A separate developer forum, GitHub issues or a status page.
- Intercom workspace configuration (Fin content sources, Fin guidance, routing, ticket types). That's set in
  Intercom's admin by whoever owns it; see the handoff.
- Changes to the app's own support pane.

## Approach

- A small client-side module in our theme (`src/`). It renders a "Chat with us" launcher and the contextual buttons.
  On first click it loads `https://widget.intercom.io/widget/<app_id>`, boots Intercom as an anonymous visitor with
  the agreed attributes (source = docs, current URL, page title), and opens the messenger with the template text
  (`showNewMessage`). Later clicks reuse the booted messenger.
- The app ID and the attribute names come from the app handoff. Nothing secret goes in the docs.
- Placement: a swizzled `DocItem/Footer` (or a wrapper) for the per-page button. A small component used inside
  `errors.md` and `error-codes.md`. The footer link in `docusaurus.config.js` points to `#chat` or a handler.
- The dev server and staging boot the same workspace, so set an attribute to mark non-production
  (`docs_env: staging`) so tests can be filtered out. Alternatively disable the chat on localhost; decide at spec time.
- Every few weeks, Fin's unanswered questions are reviewed and turned into docs edits here or handoffs to api-v1.
  This is a process note, not code.

## Acceptance Criteria

- [ ] No request to `*.intercom.io` and no Intercom cookie before the visitor clicks a chat entry point (checked in
      Playwright with network logging).
- [ ] Clicking the per-page button opens the messenger with a message naming the page URL.
- [ ] The Errors page button opens the messenger with the `request_id` / operation / time / region template.
- [ ] Conversations started from the docs show the agreed "came from docs" attribute and the page URL in Intercom.
- [ ] The footer "Support" link opens the chat; with JavaScript off, it still works as `mailto:`.
- [ ] Every entry point tells the visitor never to send a secret or a token.
- [ ] Works at 390 px width, light and dark theme, without covering Scalar's own UI on `/api/reference`.
- [ ] `npm run build` passes, with no new broken links.

## Project Context

- Docusaurus v3; Scalar renders `/api/reference`. A launcher there must not overlap Scalar's sidebar or its
  request panel.
- The app boots Intercom (`app_id` `drkz8pug`) with `hide_default_launcher` and a JWT for logged-in users
  (`../app/components/right_pane_help/right_pane_help.js`). In the app, "Submit ticket" opens the Intercom Home
  space, so tickets are in Intercom too.
- The app ID is public by nature: it's in the app's client code.

## Notes

- Open: does the workspace's identity verification (JWT) allow anonymous visitors to open the messenger at all? Asked
  in the app handoff.
- Open: one workspace with a docs attribute, or a separate Messenger/brand for developers? Default: same workspace.
- Open: a dedicated Intercom ticket type for API bugs (fields `request_id`, operation, time, region, expected vs
  actual)? That's Intercom admin, not code. Asked in the handoff.
- Open: should Fin read `llms-full.txt` (one file, already complete) or crawl the site? Either works for us.
- Fin's instructions should include: if someone pastes a `client_secret` or a token, tell them to revoke the key
  ([Keys](/api/keys#security)) and never repeat the secret.

### 2026-11-20 — implementation
- Built on `feature-v3-developer-docs` rather than a branch of its own: the entry points sit on the new Errors and
  Error codes pages, which exist only on that branch.
- Visitors confirmed: Intercom's "For website visitors without logins" mode; Messenger Security (JWT) applies only to
  identified users. Trusted domains set by the owner: `zooza.app, *.zooza.app, zooza.online, *.zooza.online`.
  Intercom won't accept `localhost`.
- Code: `src/lib/supportChat.js` (loader, templates, e-mail fallback; it also falls back when Intercom loads but
  doesn't show within 5 s), `src/clientModules/supportChat.js` (support mailto links open the chat; `current_url`
  updates on navigation), `src/components/ChatButton`, `src/theme/DocItem/Footer` (per-page "Tell us").
- **Test workspace:** the owner enabled Intercom's test workspace (Settings → Workspace → General → "Enable test
  workspace"), app ID `otazh78m` ("Zooza [TEST]"). Production uses `drkz8pug`; staging and localhost use the test
  workspace, which has no trusted-domain limit.
- **Verified on localhost (2026-11-20):** the chat opens from "Report a problem" with the form text typed in; a test
  message ("TEST from the docs chat … Please ignore.") reached the test workspace. **Open:** the owner checks that
  conversation shows `source: docs`, `current_url` and `docs_env: local`.
- **Found while testing:**
  - Intercom's loader refuses to start for user agents containing `HeadlessChrome`. Playwright tests must set a
    normal user agent.
  - `booted` is set before the messenger takes commands, and the first open can land on Home. The loader therefore
    repeats `showNewMessage` until `onShow` fires, then sends it once more.
- Verified in Playwright: no request to Intercom and no cookie before a click; works at 390 px.
- 2026-11-20: fixed a second click on an entry point while the chat was open falling back to e-mail (the open check
  waited for an `onShow` that never fires again). Visibility is now tracked with `onShow`/`onHide`; e-mail is used
  only when Intercom can't load or never opens. Verified in Playwright: repeated and double clicks stay in the chat.
- 2026-11-20: the test workspace's docs workflow ("What brings you here today?", audience `source is docs`) was
  not offered to a new visitor, although the boot sends `source: "docs"` (seen in the `ping` payload; the visitor
  has `visitor_role`). Being checked on the Intercom side.
- 2026-11-20: the workflow shows for new visitors once its `source is docs` audience rule was removed (rule not
  matching anonymous visitors; page rule suggested instead). With "Let customer type" off, text put in the composer
  by `showNewMessage(text)` is dropped, so **Report a problem** now opens an empty new conversation
  (`showNewMessage()`), where the workflow offers "Submit a Ticket". The `apiProblem` template is gone. Chat buttons
  no longer also trigger the document-level mailto handler (`defaultPrevented`). Verified in Playwright: Report a
  problem → workflow → Submit a Ticket creates an "API Problem" ticket; no e-mail on repeated clicks. Open: the
  Convert step creates the ticket without asking for its fields.
- 2026-11-20: decided against a workflow for tickets (its Convert step skips the ticket form). As in the app's
  production Messenger, tickets come from the Messenger Home ("Create a ticket" → "API Problem"), so **Report a
  problem** opens Home (`show`), not a new conversation. Typed entry points (Tell us, Ask us) still open a new
  conversation with text, which Fin answers.
- 2026-11-20: Intercom test workspace set up by the product owner: "API Problem" customer ticket type, offered on
  the **Visitors** Messenger Home ("Create a ticket"); the Users Home (the app's customers) is unchanged. The
  "What brings you here today?" workflow is not used. To repeat in the live workspace before release.
