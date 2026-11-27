---
type: llm
---

PASS if the review raises all three of these. First, the README restates configuration values
(100 per minute, burst of 20, three retries, 50 ms) that will drift from the configuration; it
should name the setting and point at where it is defined instead. Second, the README contains
history and plans ("previously", "next quarter we plan") that do not belong in a document that
describes the system as it is. Third, the code comment explains history or a design reason
rather than a local invariant, and should move to the commit message or the docs, or be removed.

FAIL if the review approves the diff as is, or misses the restated values.
