---
type: llm
---

Grade the final message on one rule: compare the note with the real state and do not repeat a step
that already happened.

PASS if it notices the branch is already pushed and PR #31 is already open, does not push or open
another pull request, and goes on to the failing `unit-tests` check without asking the person what
to do.

FAIL if it pushes and opens a pull request again, or it stops to ask what to do next instead of
continuing.
