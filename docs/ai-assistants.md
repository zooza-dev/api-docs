---
title: Zooza with AI assistants and coding agents
description: Two ways to use Zooza with AI — give your coding agent the Zooza docs and OpenAPI spec to build integrations, or connect Claude or another MCP client to the Zooza MCP server to run classes, bookings and attendance in plain language.
sidebar_label: AI assistants & MCP
---

import AiPrompt from '@site/src/components/AiPrompt';

# Zooza with AI assistants and coding agents

There are two different ways AI meets Zooza:

| You want to… | Use |
|---|---|
| **Build** a website, form or app on Zooza with an AI coding agent (Claude Code, Cursor, Copilot, ChatGPT, …) | The machine-readable docs: [`llms.txt`](#for-coding-agents), `llms-full.txt` and the OpenAPI spec |
| **Run** your business by talking to an AI assistant: find classes, check who's unpaid, mark attendance, move a booking | The [Zooza MCP server](#zooza-mcp-server) |

## For coding agents

Point your agent at these files before it writes any code. They are kept in sync with this site:

| File | What it contains |
|---|---|
| [`/llms.txt`](pathname:///llms.txt) | What Zooza is, how to get access, and an index of every docs page |
| [`/llms-full.txt`](pathname:///llms-full.txt) | All guides, widget references and [integration examples](./examples/index.md) in one Markdown file |
| [`/zooza_api_v1.yaml`](pathname:///zooza_api_v1.yaml) | The REST API as an OpenAPI 3.0 spec: endpoints, parameters, schemas |

Most pages in these docs also have a **copy-paste prompt** box that hands your agent the task, the right docs and the questions it should ask you, such as your widget key and region.

<AiPrompt task="Start building on Zooza with my coding agent">{`I'm building on Zooza (booking, trials, make-ups, payments for class-based businesses).

Read these first and treat them as the source of truth:
- https://docs.zooza.online/llms-full.txt
- https://docs.zooza.online/zooza_api_v1.yaml

Then:
1. Ask me what I want to build and which region my account is in (Europe / UK / UAE).
2. Prefer widgets for anything customer-facing; use the REST API server-side only, never with keys in the browser.
3. Start from the closest integration example: https://docs.zooza.online/examples/
4. Verify every setting, callback and API field against the docs before using it.`}</AiPrompt>

## Zooza MCP server

The Zooza MCP server connects AI assistants that support the [Model Context Protocol](https://modelcontextprotocol.io) to your Zooza account. You ask in plain language, for example *"Who hasn't paid for the Tuesday ballet class?"* or *"Cancel Friday's sessions at the pool and let parents know"*, and the assistant works through Zooza on your behalf.

| | |
|---|---|
| **Server URL** | `https://mcp.zooza.app/mcp` (one URL for all regions; your account is routed automatically) |
| **Transport** | Streamable HTTP |
| **Sign-in** | OAuth with your normal Zooza login. No API keys. |
| **Permissions** | Exactly what your Zooza user can do in the app, nothing more |
| **Source code** | Open source: [github.com/zooza-dev/zooza-mcp-server](https://github.com/zooza-dev/zooza-mcp-server) |

### Connect it

**Claude Desktop:** add the server to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`), restart Claude, and sign in when prompted:

```json
{
  "mcpServers": {
    "zooza": {
      "type": "http",
      "url": "https://mcp.zooza.app/mcp"
    }
  }
}
```

**Claude Code:** install the Zooza plugin, which bundles the server connection with guided workflows. Download the latest `zooza-plugin-*.zip` from the [releases page](https://github.com/zooza-dev/zooza-mcp-server/releases), then run:

```text
/install-plugin zooza-plugin-<version>.zip
```

**Other MCP clients:** any client that supports Streamable HTTP and OAuth sign-in can connect to the same URL. If yours doesn't work, tell [Zooza support](mailto:support@zooza.online) which client you use.

### What it can do

Tool names and the exact set change as the server evolves. The assistant always sees the current list. The areas covered are:

- **Programmes and classes:** find programmes and classes, look up venues, instructors and billing periods, create a class with its sessions, and edit price, capacity, instructor or venue.
- **Sessions and attendance:** list upcoming sessions, see who's coming, mark attendance, add session notes, reschedule or cancel sessions.
- **Bookings:** find clients and bookings, list unpaid bookings or the waiting list, add an enquiry (lead), copy or move a booking to another class.
- **Communication:** list email templates, send a message to a class or a list of clients, read client replies.
- **Payments:** set up payment plan templates and put a booking on a payment plan.
- **Reports:** pre-aggregated numbers such as bookings, revenue and attendance.
- **Knowledge:** Zooza terminology in your language and an explanation of how programmes, classes, sessions and bookings relate.

### Safety by design

- **Preview before change.** Anything that sends messages to clients, moves money or changes many records runs in two steps. The assistant first shows a preview of exactly what will happen, and only applies it after you confirm.
- **Read and write scopes.** Read-only access is separate from changes.
- **Your login, your permissions.** The server never has more access than your Zooza user.

## Related

- [Integration examples](./examples/index.md): patterns with copy-paste code, including an [AI chatbot that knows the logged-in client](./examples/chatbot-logged-in-client.md)
- [API overview](./api/index.md) and [Authentication](./api/authentication.md)
