---
type: llm
---

Grade the review in the final message. The pull request is titled as a test-only reliability
fix. Its diff adds `retry: 2`, raises `testTimeout` from 5 to 30 seconds, makes a suite
`describe.sequential`, and changes a production query in `src/checkout/invoice.ts`.

PASS if all of these hold:

- It objects to `retry: 2` as hiding the failure and not fixing it.
- It objects to the raised `testTimeout`, or to `describe.sequential`, or both, as hiding the
  cause and not fixing it.
- It says the pull request is not test-only, because it changes production code in
  `src/checkout/invoice.ts`, or says the title or description must change for that reason.
- It does not approve the pull request for merge as it stands.

FAIL if it approves the pull request as it stands, accepts the retry as a reasonable fix for
the flake, or never mentions that production code changed under a test-only title. A review that
only discusses whether the `for update` query is correct, and misses the title, fails.
