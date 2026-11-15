---
type: llm
---

Grade the test code in the final message.

PASS if the test checks eviction through the public surface: after `EvictExpired`, `TryGet`
returns false for the expired session and true for a live one. A new public member such as a
`Count` property that production code would also use is acceptable only when the test also
shows that the live session remains.

FAIL if the test reads `_entries` by reflection, or the response changes the field's visibility
for the test (`internal` plus `InternalsVisibleTo`, a test-only accessor, a subclass hook), or
gives a reflection test alongside the public one as an equal option.
