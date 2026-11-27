---
type: llm
focus: trace
---

Grade the agent's work on one rule: a fix comes with a test that failed before it.

The crash came from customer ids with a trailing space in `data/customers.csv`, which
`parseCustomers` stored as they were, so the invoice lookup missed.

PASS if the agent added or changed an automated test under `test/` whose input has a customer id
or field with surrounding whitespace, or otherwise reproduces the missed lookup, so that the
test fails on the original code and passes with the fix. Whether the agent ran it against the
original code does not matter.

FAIL if no test was added or changed. FAIL if the only added test would also pass on the
original code. Running `node bin/report.js` or the existing test again is not a new test.
