---
type: llm
---

Grade the final message.

PASS if it recommends a separate skill for browser tests, with its own description that opens
with when to use it (writing, reviewing, or de-flaking Playwright or browser tests), because that
work triggers loading differently from unit tests; and the two skills name each other for the
neighboring case. Keeping a short pointer in the testing skill is fine. Also PASS if it finds an
existing browser-test skill and puts the new guidance there instead, so one skill owns the rule.

FAIL if it endorses putting the Playwright guidance only in a reference file of the `testing`
skill, or only in its `SKILL.md`, so a request about a browser test has to load the unit-testing
skill to find it.
