---
title: Keys
description: Creating, editing, rotating and revoking Zooza API keys, when each change takes effect, and how to keep a key's secret safe.
sidebar_position: 6
---

# Keys

An API key lets a server integration act for one Zooza company. Keys are managed in the Zooza app under
**Developers → API keys**, and only a company **owner** can create or change them.

## What a key is

| Part | Example | Notes |
|---|---|---|
| `client_id` | `zk_4768b32989b7303eac7ff30e` | Identifies the key. Not secret. |
| `client_secret` | `<client_secret>` | Shown **once**, when the key is created and again after a rotation. Zooza can't show it again. |
| Label | "Website timetable" | A name for the owner's benefit. |
| Access groups | `core_read` | What the key may call. See [access groups](access-and-rate-limits.md#access-groups). |
| Company scope | `pinned` | The key acts only for the company that created it. See [company scope](access-and-rate-limits.md#company-scope). |

A key belongs to the [region](index.md#regions-and-base-urls) of its company and works only there. A key has no rate
tier of its own: all of a company's keys share the company's [point budget](access-and-rate-limits.md#rate-limits-points),
and its tier follows the company's Zooza plan.

## Creating a key

1. As an owner, open **Developers → API keys** in the Zooza app and create a key.
2. Give it a label that says what it's for.
3. Copy the `client_secret` into your secret store straight away. It's shown only now.

A new key starts at the lowest level: `core_read` (read only) and the `pinned` company scope. An owner can raise the
access groups when editing the key, within what the company is entitled to. Every company with a
Zooza subscription can create keys at the lowest level; higher levels may become paid add-ons.

## Editing, rotating and revoking {#when-changes-take-effect}

| Action | What it does | When it takes effect |
|---|---|---|
| **Change access groups** | Widens or narrows what the key may call | On the next token request, so within 60 minutes at most |
| **Change the label** | Renames the key (for the owner only) | Immediately |
| **Rotate the secret** | Issues a new `client_secret`; the old one stops working | New token requests need the new secret immediately. Tokens issued before the rotation keep working until they expire (up to 60 minutes). |
| **Revoke** | Disables the key permanently. This can't be undone. | Immediately. The next call fails, even with a token that hasn't expired. |

Use **rotation** for routine secret changes, e.g. when someone who knew the secret leaves. Use **revocation** when a
secret may have leaked (see below), because revoking is the only way to stop tokens that were already issued.

## Security {#security}

- **Keep the secret on a server**: in an environment variable or a secret manager, and in a git-ignored `.env` for local
  work. Never put it in browser code, a mobile app, a URL or a repository.
- **Never paste a secret** into a chat, a support ticket or an AI agent. If an agent writes code for you, let the code
  read the secret from the environment.
- **If a secret may have leaked, revoke the key and create a new one.** Rotating isn't enough: tokens issued with the old
  secret keep working for up to 60 minutes.
- **Use one key per integration**, so you can revoke one without breaking the others.
- **Grant the least access.** Keep integrations that only read on `core_read`; add `core_write` only where needed.
- **Keys act on live data.** There's no sandbox yet (coming), so test writes carefully, ideally against a company set up
  for testing.
- **Watch for repeated `401 invalid_client`**: after 10 wrong secrets a key is locked for 5 minutes. See
  [Authentication](authentication.md#invalid-client).

## Related

- [Getting started](getting-started.md): using a new key for the first time
- [Authentication](authentication.md): the token request and the owner email
- [Access and rate limits](access-and-rate-limits.md): groups, scope, points and tiers
