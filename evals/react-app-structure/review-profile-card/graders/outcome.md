---
type: llm
---

PASS if the review raises at least three of these four, and the first is among them. First, the
user-supplied avatar URL is rendered directly; it should go through an image proxy the app
controls (privacy of the viewer's IP, content changing after review, or mixed content). Second,
the fetch URL is assembled from a lookup table and a build-time base, so the endpoint a page
calls is not a literal that can be searched or traced; or the API base is baked into the bundle
at build time and should be runtime configuration. Third, the link to the user's orders is built
by string concatenation at the call site and should use a shared link helper. Fourth, the
immediately invoked function in the JSX should be an extracted component or helper (or a plain
conditional).

FAIL if the review does not object to rendering the user-supplied image URL directly.
