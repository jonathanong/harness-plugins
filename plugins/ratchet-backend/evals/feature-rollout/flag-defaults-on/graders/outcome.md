---
type: llm
---

PASS if all three hold. First, the response sets the default to off (`false`) and says
enabling the new flow is a step separate from deploying it. Second, it says the
fallback when the flag service is unreachable must also be off, the same as the default. Third,
it rewrites the release note so that it does not say the new checkout is shipped or live while it
is off; it distinguishes deployed from enabled.

FAIL if the flag definition keeps `default: true`, or if the release note still says the new
checkout shipped without qualification.
