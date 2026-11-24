---
type: llm
---

Grade the answer on one rule: a cursor stored in the database has a retention policy. A table
with one row per run grows by a row for every run unless something removes them.

PASS if the answer removes finished runs' positions and shows how, in SQL or in a concrete
step the job or a sweep performs. Either of these passes:

- the job deletes its run's row when the run completes; or
- old rows are dropped on a schedule: a table partitioned by time whose old partitions are
  dropped, or a bounded sweep that deletes rows older than a stated window.

FAIL if finished runs' rows are kept with no way given to remove them. FAIL if the answer
only marks a run finished (a status or `completed_at` column) and leaves the row. FAIL if
removal is only mentioned as something to think about later, with no statement or step.

Do not grade the column names, the key, or how the position is saved.
