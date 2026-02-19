---
title: Error handling
description: HTTP status codes, error response format, and troubleshooting tips for the Zooza API.
sidebar_position: 3
---

# Error handling

This page covers how the Zooza API communicates errors and how to troubleshoot common issues.

---

## Response format

<!-- TODO: requires clarification — standard error JSON structure -->

When an error occurs, the API returns a JSON response with error details. Example:

```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token"
}
```

---

## HTTP status codes

<!-- TODO: requires clarification — verify which codes the API actually uses -->

| Status code | Meaning | Description |
|-------------|---------|-------------|
| `200` | OK | Request succeeded |
| `400` | Bad request | Invalid request body or parameters |
| `401` | Unauthorized | Missing or invalid authentication headers |
| `403` | Forbidden | Valid credentials but insufficient permissions |
| `404` | Not found | Resource does not exist |
| `422` | Unprocessable entity | Request is well-formed but contains invalid data |
| `429` | Too many requests | Rate limit exceeded |
| `500` | Internal server error | Something went wrong on Zooza's side |

---

## Common error scenarios

### Authentication errors

| Symptom | Cause | Solution |
|---------|-------|----------|
| `401` on every request | Missing `X-ZOOZA-API-KEY` header | Add your API key header to all requests |
| `401` after working previously | Token expired or invalidated | Re-authenticate to obtain a new token |
| `401` on API endpoints | Using a widget API key instead of a REST API key | Widget keys cannot be used for REST API calls — contact support for a REST API key |
| `403` on specific endpoints | User role lacks permission | Check user permissions, use an Owner-role account for full access |
| `401` with valid credentials | Wrong API region | Verify your base URL matches your account's region (see [API regions](index.md#base-urls)) |

### Widget errors

<!-- TODO: requires more content — common widget integration errors -->

Common widget integration issues:

- **Widget not loading:** Check that the API key is correct and the script tag is properly embedded.
- **CORS errors in browser console:** Ensure your domain is registered in the widget group settings.
- **Widget shows no data:** Verify that your Zooza account has active programmes and classes.

### Registration errors

<!-- TODO: requires more content — booking/registration validation errors -->

Registration and booking errors may occur when:

- The class is at full capacity
- The registration period has closed
- Required customer fields are missing
- Payment validation fails

---

## Debugging tips

1. **Check browser DevTools** (for widgets) — look at the Network tab for failed requests and their response bodies.
2. **Log full response bodies** — error messages often contain specific details about what went wrong.
3. **Verify your API region** — make sure your base URL matches your account's region ([see regions](index.md#base-urls)).
4. **Check application type** — Widget keys cannot access admin endpoints. Verify your key type matches the endpoints you're calling.
5. **Test with cURL first** — isolate whether the issue is in your code or in the API request itself.
