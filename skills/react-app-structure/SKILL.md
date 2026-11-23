---
name: react-app-structure
description: Use when writing or reviewing React components, Next.js pages, layouts, route handlers, forms, navigation, server/client boundaries, data fetching, auth redirects, entity links, or browser configuration. Structure a React or Next.js app so its API calls, links, redirects, and configuration each have one traceable owner.
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

Polling and scope-switching hooks (a tab, filter, or workspace switch that refetches) follow the
same rule: tag each request, ignore a response that is no longer current, and never start a
refresh while one is in flight or while the user is saving.

## Server and client components

- A server component reads the current user directly. A client component gets it from a client
  auth hook or context. Do not pass the user as a prop across the boundary: the serialized copy
  goes stale after sign-in or sign-out and widens what ships to the browser.
- A client component receives a view model shaped for display, not the API response envelope.
  Project the fields it renders in the server component, and keep a failed fetch (`null`) distinct
  from an empty list. Otherwise the client depends on the API's shape and every envelope field
  ships in the page payload.
- Render logged-out pages fully on the server; they are what crawlers and first visits see.
  Logged-in pages may stream secondary asides behind `Suspense`, but await the main content.
- Give each member of a finite set of route types its own route directory. Use a `[param]`
  segment only for values that really vary, so each page is findable by its path.

A paginated list ends only when the API's flag says so. Do not stop, or show the empty state,
because a page came back short or empty: keep a way to load more while the response reports a
next page and a cursor. [list-reads](../list-reads/SKILL.md) owns the contract.

A fetch wrapper that returns `null` maps only a 404 to `null`. Never catch everything into
`null`; every other failure reaches the error boundary, so an outage does not look like a missing
resource.

## Forms and refresh

- After a successful mutation, keep the submit button disabled until the navigation or refresh
  that follows has finished. Wrap `router.push` or `router.refresh()` in `startTransition` and
  disable on `isPending` as well, or the user can submit twice while the page is still stale.
- `router.refresh()` re-renders server components but keeps client state. A promise held in
  client state and read with `use()` is not recreated by it; create a new one when the mutation
  succeeds.

## Components

- With React Compiler, do not add `useCallback`, `useMemo`, or `memo` only for referential
  stability. Keep a value that only event handlers read in `useRef`, so it never re-renders.
- A navigation destination is a link, including inside a dropdown menu; only an action is a
  button. A link opens in a new tab, shows its target, and is followed by crawlers.

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

## Locale and language

- Format a date or number with an explicit locale and time zone, the ones the interface uses.
  `toLocaleDateString()` with no locale uses the runtime's default, so the server render and the
  browser disagree and hydration fails or the text flickers.
- Text a user wrote, shown beside interface text in another language, carries its own `lang`.
  When its language is unknown, set `lang=""` and `dir="auto"`; with no `lang` it inherits the
  page's. Screen readers pick the voice
  and browsers pick hyphenation and direction from it.

## User-supplied images

Serve an image URL a user supplied through an image proxy the app controls. Rendering it directly
sends each viewer's IP address and user agent to a host the uploader chose, lets that host change
the content after review, and can mix insecure content into the page.

## JSX

Do not use an immediately invoked function inside JSX to compute a branch. Extract a component
or a helper. The extracted piece has a name, can be tested, and keeps the render readable.
