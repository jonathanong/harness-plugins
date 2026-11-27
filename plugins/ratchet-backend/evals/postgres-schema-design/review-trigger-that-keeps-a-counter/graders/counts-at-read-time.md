---
type: llm
---

Grade the review on one rule: a trigger does not write another table to keep a counter. The
simpler design comes first: count at read time.

PASS if the review says not to merge the trigger-maintained counter, and its first recommendation
is to count at read time instead: an index on the open tasks of a project, a count that stops at
a cap (for example a subquery with `LIMIT 100`, shown as "99+"), or both. A review that also
lists what the trigger would need if the owner decides to keep the counter still passes, as long
as counting at read time is what it recommends trying first.

FAIL if the review's recommendation is to keep the trigger-maintained counter and repair or
harden it: a fix for the backfill, `WHEN` clauses, a lock or an ordering to avoid deadlocks, a
periodic recount, a statement-level trigger. FAIL if it approves the migration as written. FAIL
if counting at read time appears only as an aside or an alternative, after a recommendation to
fix the trigger.

Do not grade the index definition or the exact cap.
