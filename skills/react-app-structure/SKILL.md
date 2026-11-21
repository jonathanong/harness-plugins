---
name: react-app-structure
description: Use when writing or reviewing React components, Next.js pages, layouts, or route handlers, data fetching in pages, auth redirects, entity links, or browser-side configuration. Structure a React or Next.js app so its API calls, links, redirects, and configuration each have one traceable owner.
---

# React app structure

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

These rules keep one owner for each cross-cutting concern, and keep the links between the page
and the API readable by a person or a tool without running the app.

## API calls

- Call the API with a literal URL path and a literal method. Do not build the URL from a variable
  base, a lookup table, or a helper that takes the path as data. A literal lets a search or a
  static tool answer "which pages call this endpoint" before the endpoint changes.
- Interpolate only the identifiers in the path: ``fetch(`/api/orders/${orderId}`)``.
- When the endpoints belong to a separate backend service, do not add API route handlers to the
  web app. A second place that serves the API splits auth, validation, and versioning across two
  codebases. A thin proxy the platform requires is the exception; keep logic out of it.

## Superseded requests

Abort an in-flight request when a newer one replaces it, such as typeahead search, with an
`AbortController` aborted in the effect cleanup. Otherwise a slow earlier response can arrive
after a newer one and overwrite it with stale results.

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch(`/api/search?q=${query}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setResults)
    .catch((e) => {
      if (e.name !== 'AbortError') throw e
    })
  return () => controller.abort()
}, [query])
```

## Auth redirects

Decide where signed-out users go in one place: the layout or the middleware that wraps the
protected section. Do not repeat the check and redirect in each page. A page added later is then
protected by where it sits, not by remembering to copy the check.

## Links

Build the URL for an entity (a user, an order, a document) through one shared helper per entity.
Do not assemble it from string pieces at the call site. When the route changes, one helper
changes, and no link is left behind.

## Configuration

Load browser-side configuration at runtime, from the server response or a config endpoint. Do
not bake it into the bundle at build time. One build can then be promoted through every
environment, and a configuration change does not need a rebuild.

## User-supplied images

Serve an image URL a user supplied through an image proxy the app controls. Rendering it directly
sends each viewer's IP address and user agent to a host the uploader chose, lets that host change
the content after review, and can mix insecure content into the page.

## JSX

Do not use an immediately invoked function inside JSX to compute a branch. Extract a component
or a helper. The extracted piece has a name, can be tested, and keeps the render readable.
