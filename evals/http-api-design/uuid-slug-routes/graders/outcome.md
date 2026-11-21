---
type: llm
---

PASS if both hold. First, the canonical page and API route use the slug, and the response
exposes the slug as the identifier rather than the UUID. Second, the already-sent UUID links
keep working: the route accepts a UUID only as a fallback and answers it with a permanent
redirect (301 or 308) to the canonical slug URL.

FAIL if the canonical URL or the identifier clients use stays the UUID, if the UUID links are
dropped and break, or if the UUID is served as a second canonical page without redirecting.
