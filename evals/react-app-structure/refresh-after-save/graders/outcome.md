---
type: llm
---

PASS if the form wraps `router.refresh()` (or the navigation) in `startTransition` and the submit
button is disabled while `isPending` is true as well as during the request, so it stays disabled
after the POST succeeds until the refresh completes.

FAIL if the button is re-enabled as soon as the POST resolves (disabled only by a local
`submitting` flag cleared in `finally`), or `isPending` is not used.
