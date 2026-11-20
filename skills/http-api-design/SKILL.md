---
name: http-api-design
description: Shape an HTTP API around resources, thin route handlers, user-facing identifiers, and one owner each for secret storage and cache headers. Use when writing or reviewing an endpoint, route handler, or service layer, choosing identifiers in URLs, storing tokens or one-time codes, or setting cache headers.
---

# HTTP API design

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

## Resources, not actions

Model the API as resources addressed by path, with the method as the verb. Do not send the verb
in the body (`POST /api { "action": "archive" }`). Resource paths can be routed, authorized,
rate-limited, cached, and logged per operation; an action body hides all of that behind one
route.

For an operation that is not plain create, read, update, or delete, name the thing it creates:
`POST /orders/{id}/refunds` instead of an action called `refundOrder`.

## Handlers and services

- A route handler parses and validates the request, calls one service function, and maps the
  result to a response. It holds no business logic.
- A service function takes plain values and returns plain values or typed errors. It does not
  read headers, set cookies, or build responses.
- With that split, the same service call works from a job, a script, or a test, and the transport
  can change without touching the rules.

## Identifiers

When a resource has a stable user-facing identifier, such as a slug or a public id, use it in
URLs and responses. Do not expose the internal primary key there. An internal id leaks volume
and ordering, invites enumeration, and ties every client to the storage layout.

## Secrets at rest

- Do not store a bearer token, OAuth token, one-time code, or TOTP secret as plain text.
- Hash what only needs comparing: session and API tokens, one-time codes. Encrypt what must be
  read back: OAuth refresh tokens, TOTP seeds.
- Do both through one shared module. One place then owns the algorithm, key rotation, and
  constant-time comparison, and a search for that module finds every secret the system stores.

## Claims checked at the edge

A claim verified at the edge, such as a JWT checked in a CDN worker, decides only cache bypass or
routing. It never grants access or a higher rate-limit tier. The edge may hold a stale or
partial view of the user, so the origin authorizes every request on its own.

## Cache headers

Set cache headers through one central policy keyed by route or response type. Do not hand-write
`Cache-Control` in each handler. Per-route headers drift, and the one that is wrong is a private
response cached by a shared proxy.
