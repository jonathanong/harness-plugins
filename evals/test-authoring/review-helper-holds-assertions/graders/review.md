---
type: llm
---

Grade the review in the final message. It must raise both findings.

1. The first test computes `expected` with a formula of its own instead of stating the answer,
   so it restates the calculation it is meant to check. The review asks for a literal expected
   value (such as `1100`).
2. The assertions live in the `expectValidProration` helper. The review asks for them to be
   written in each test body (or for the helper to stop holding expectations), not only for the
   helper to gain more assertions.

PASS only if both are raised as things to change.

FAIL if either is missing, or if the review treats the helper as fine and only says the last two
tests need extra exact-value assertions.
