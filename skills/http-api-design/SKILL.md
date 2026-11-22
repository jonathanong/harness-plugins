---
name: http-api-design
description: Use when writing or reviewing an endpoint, route handler, service layer, or an edge or CDN worker in front of an API, choosing identifiers in URLs, storing tokens or one-time codes, or setting cache headers. Shape an HTTP API around resources, thin route handlers, user-facing identifiers, and one owner each for secret storage and cache headers.
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
- A service function takes plain values and returns plain values or typed errors. It may throw an
  error that carries a status, but it never touches the response, cookies, headers, or redirects.
- A handler works in this order: authenticate, resolve the entities named in the URL, validate
  the body, act. A caller then learns it is unauthenticated before it learns an entity is
  missing, and nothing is validated against an entity that does not exist.
- An API is never gated on a frontend feature flag; the flag decides what a client shows, not
  what the server accepts.
- A mutation with a body accepts JSON only. Do not parse form encodings on the same route.
- Set the status before writing a non-200 body. Send 204 and 205 with no body.
- The API returns structured entity references (type and identifier), never a frontend route. The
  client owns its URLs, so a route change does not break the API.
- With that split, the same service call works from a job, a script, or a test, and the transport
  can change without touching the rules.

## Identifiers

When a resource has a stable user-facing identifier, such as a slug or a public id, use it in
URLs and responses. Do not expose the internal primary key there. An internal id leaks volume
and ordering, invites enumeration, and ties every client to the storage layout.

- A UUID is not a user-facing identifier, even a random or a truncated one. Do not use it as the
  identifier in a route, a visible label, or a field a person types or pastes. Give the resource
  a slug, a natural key, or a short public id. A UUID in a URL is unreadable, cannot be said
  aloud, and ties clients to the storage layer.
- Where a route takes a slug, a UUID may stay as a fallback for old links. Answer it with a
  permanent redirect to the canonical slug URL, so one resource has one URL for caches, search
  engines, and bookmarks.
- Return the label a client shows (username, title, name, slug) as a non-null field, filled in by
  the server for every item in a list. Give it a fallback chain, such as username, then display
  name, then a fixed "deleted user" label. Each client otherwise handles the missing value on its
  own and renders a blank link, `null`, or an id.
- When a link is retargeted to a new route, keep a link to the old route somewhere in the app.
  Otherwise the old page, still live, becomes unreachable.

## Secrets at rest

- Do not store a bearer token, OAuth token, one-time code, or TOTP secret as plain text.
- Hash what only needs comparing: session and API tokens, one-time codes. Encrypt what must be
  read back: OAuth refresh tokens, TOTP seeds.
- Do both through one shared module. One place then owns the algorithm, key rotation, and
  constant-time comparison, and a search for that module finds every secret the system stores.

Streams (server-sent events) and API keys: read
[streams and API keys](references/streams-and-api-keys.md).

## Claims checked at the edge

A claim verified at the edge, such as a JWT checked in a CDN worker, decides only cache bypass or
routing. It never grants access or a higher rate-limit tier. The edge may hold a stale or
partial view of the user, so the origin authorizes every request on its own.

## Cache headers

Set cache headers through one central policy keyed by route or response type. Do not hand-write
`Cache-Control` in each handler. Per-route headers drift, and the one that is wrong is a private
response cached by a shared proxy.
