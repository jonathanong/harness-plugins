---
type: llm
---

PASS if the response says that besides `listOpenInvoices`, every other query that depends on the
index's predicate (`status = 'open'`), ordering (`due_at`), join, or selected columns must have its
plan rechecked, and says how to find them: search the query builders separately from where queries
execute and include callers that reach a builder through helpers.

FAIL if it only checks the plan of `listOpenInvoices`, or finds other queries only by searching call sites.
