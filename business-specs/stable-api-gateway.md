# Stable API Gateway — Business Specification

## Purpose

The Stable API Gateway is a thin translation layer that sits between external consumers (partners, LLM agents, widgets) and the existing Zooza working API. It owns the public contract defined in the OpenAPI spec and shields consumers from internal API churn. The working API does not need to be changed to match the spec — the gateway adapts.

The gateway has **no database**. Its only stateful dependency is **Redis**, used for idempotency and short-lived caching where appropriate.

---

## Position in the System

```
Consumer
   │
   ▼
Stable API Gateway          (this project, PHP 8.3)
   │   - enforces the public OpenAPI contract
   │   - translates requests & responses
   │   - handles idempotency via Redis
   │   - routes to the correct region
   ▼
Working API                 (existing Zooza backend)
   │
   ▼
Database / Business Logic
```

The gateway is the only component the consumer ever talks to. The working API's shape, field names, and conventions are internal concerns.

---

## Responsibilities of the Gateway

### 1. Request ingestion and validation
- Parse and validate incoming requests against the OpenAPI spec (fields, types, required params, enum values)
- Reject malformed requests with a normalised `400 BAD_REQUEST` before hitting the working API
- Enforce the `X-ZOOZA-API-KEY` header on every request
- Enforce the `Authorization: Bearer` header on operations that require user context

### 2. Region routing
- Read the `X-ZOOZA-REGION` header (default EU if absent)
- ---nebude to header ale kazdy api kluc bude mat prefix
- Route the upstream call to the correct working API base URL for that region
- No region resolution via database lookup — purely header-driven

### 3. Credential and scope resolution
- Identify the credential class (`widget_company`, `widget_network`, `app`) from the API key
- --- widgety nebudu v tomto api
- For `app` credentials on integration endpoints, extract and validate `X-ZOOZA-COMPANY-ID`
- Pass the resolved scope to the working API in whatever form it expects (may differ per working API version)

### 4. Request translation
- Map incoming field names, parameter names, and enum values to whatever the working API expects
- Translate pagination params (`page`, `page_size`) if the working API uses different names or conventions
- Translate the `sort=field,-created_at` format to the working API's sort convention
- Translate `ids=1,2,3` multi-ID queries to the working API's equivalent (multiple calls, batched params, or direct support)
- Translate action endpoints (`POST /registrations/{id}/actions/set_attendance`) to the working API's equivalent (may be an RPC-style body field or a different path)

### 5. Response translation
- Map working API response fields to the spec's field names
- Wrap all single-resource responses in a `{ "data": { ... } }` envelope
- Wrap all list responses in a `{ "data": [...], "meta": { ... } }` envelope, computing `total`, `page`, `page_size`, `next_cursor` from whatever the working API returns
- Translate working API errors into the normalised `{ "error": { "code": "...", "message": "...", "details": [] }, "request_id": "..." }` shape
- Map working API HTTP status codes to the correct spec status codes where they differ

### 6. Include / sideloading
- When `include=` is requested, make the additional upstream calls needed to fetch related resources
- Deduplicate included resources before assembling the `included` envelope
- Enforce the per-endpoint include allowlist — reject unknown include values with `400`

### 7. Idempotency (Redis)
- On write operations, check Redis for an existing record keyed by `{api_key}:{method}:{canonical_path}:{Idempotency-Key}`
- If found with the same request hash → return the stored response immediately, no upstream call
- If found with a different request hash → return `409 IDEMPOTENCY_KEY_REUSE_WITH_DIFFERENT_REQUEST`
- If a matching in-flight request is being processed → return `409 REQUEST_IN_PROGRESS`
- On success, store `{ request_hash, status_code, response_body }` in Redis with a 24 h TTL

### 8. Error normalisation
- All gateway-originated errors (validation failures, upstream timeouts, unexpected upstream shapes) must conform to the shared error schema
- Every response (including errors) must carry a `request_id` (generate a UUID per request; log it)
- Never leak working API internals (stack traces, internal field names, internal URLs) in error responses

### 9. Observability hooks (guidance, not prescription)
- Log `request_id`, credential class, region, method, canonical path, upstream status, and response time on every request
- This is sufficient for support tracing without a database

---

## What the Gateway Does NOT Own

These are concerns that belong in the working API, not here:

| Concern | Where it belongs |
|---------|-----------------|
| Business rule validation (e.g. "registration is full") | Working API → surfaces as `422` |
| Attendance record creation and history | Working API |
| User authentication and token issuance | Working API |
| Webhook delivery and retry logic | Working API |
| Payment processing | Working API |
| Course/schedule business logic | Working API |
| Data persistence of any kind | Working API |

If the working API currently returns a `200` with an `error` field in the body for business failures, the gateway should translate that into the appropriate `4xx` response — but the logic for deciding *which* error it is lives in the working API.

---

## Candidates for Working API Changes

The gateway can paper over many differences, but some adaptations are expensive or brittle long-term. These are good candidates to fix in the working API if the team has the bandwidth:

- **Standard pagination shape** — if the working API returns `total_count` / `current_page` / `per_page`, aligning it to `total` / `page` / `page_size` eliminates a translation layer
- **Standard error shape** — a single `{ code, message, details }` error body means the gateway can pass errors through with minimal mapping
- **Idempotency support on critical writes** — native idempotency in the working API removes the need for the gateway to hold in-flight state
- **Action endpoints** — if the working API uses RPC-style body params (`action=set_attendance`), migrating to action sub-paths removes a complex mapping table in the gateway
- **Sort parameter convention** — adopting `sort=field,-created_at` natively means the gateway passes it through unchanged

These are suggestions only. The gateway can compensate for all of them; the question is whether the mapping complexity is worth the working API change.

---

## PHP 8.3 Project Scaffold

### Runtime requirements
- PHP 8.3
- Redis (Predis or ext-redis)
- No relational database

### Suggested project structure

```
src/
  auth/
    api_key_resolver.php        # resolve API key → credential class + company scope
    bearer_token_validator.php  # validate bearer token (proxy to working API or local check)
  http/
    middleware/
      auth_middleware.php
      idempotency_middleware.php
      region_middleware.php
      request_validation_middleware.php
    request/
      request_normaliser.php   # translate incoming request to working API format
    response/
      response_normaliser.php  # translate working API response to spec format
      envelope_wrapper.php     # wrap in data / data+meta envelopes
      error_normaliser.php     # map errors to shared error schema
  upstream/
    working_api_client.php      # HTTP client for the working API (Guzzle or Symfony HttpClient)
    region_router.php           # resolve region → base URL
  idempotency/
    idempotency_store.php       # Redis-backed get/set/lock
    idempotency_key.php         # key computation: {api_key}:{method}:{path}:{header}
  include/
    include_resolver.php        # orchestrate sideload calls and deduplicate
  logging/
    request_logger.php          # structured log per request
config/
  regions.php                   # map region enum → working API base URL
  credentials.php               # credential class detection rules
  includes.php                  # per-endpoint include allowlists
  sort_fields.php               # per-endpoint sort allowlists
```

### Key design principles for the scaffold
- Every request gets a UUID `request_id` generated at ingress; carry it through all logs and responses
- Use a middleware pipeline — each concern (auth, idempotency, region, validation) is a separate layer
- All upstream calls go through `working_api_client` — never make raw HTTP calls from business logic
- `response_normaliser` and `request_normaliser` should be testable in isolation with no HTTP dependencies
- Configuration (region URLs, credential rules, include allowlists) lives in plain PHP arrays, not in Redis or a database
- Fail fast on validation — do not call the working API if the request is invalid

### Redis key namespaces
```
idempotency:{api_key_hash}:{method}:{path}:{idempotency_key}
```
Use a hash of the API key rather than the raw key in Redis key names to avoid key length issues and to avoid storing secrets in Redis key space.

---

## Open Questions

These should be answered before implementation begins:

1. Does the working API have a stable base URL per region, or is region selection done differently?
2. How does the working API signal business errors — HTTP status codes, body `error` field, or mixed?
3. Which write endpoints in the working API are non-idempotent today and would silently create duplicates on retry?
4. Does the working API support any form of batching (for multi-ID fetches), or must the gateway fan out individual calls?
5. What is the working API's authentication model — does the gateway forward the API key, exchange it, or maintain its own session?
6. Are there working API rate limits the gateway needs to respect and surface to consumers?
