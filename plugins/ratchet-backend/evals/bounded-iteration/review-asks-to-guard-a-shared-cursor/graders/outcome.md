---
type: llm
---

Grade the fix on one rule: a run's position belongs to that run. It travels in the job's data,
so no two runs write the same stored position and there is nothing to guard.

PASS if both hold:

- The position is carried in the job's own data: the job reads its start from its payload, and
  the job it adds for the next batch carries the new position. A job with no position starts
  at the beginning.
- The shared `sweep_cursors` row is no longer written by the job. The answer may drop the table
  or leave that to a follow-up.

The answer should say why the review's race no longer exists, in any words: two runs each walk
their own position and repeat harmless work at worst.

FAIL if the job still writes the shared cursor row, whether with a compare-and-set, a
forward-only guard, a lock, or unconditionally. FAIL if the fix serializes runs with a row
lock, an advisory lock, or `LOCK TABLE`. FAIL if the answer only argues that the race cannot
happen and changes nothing.

An answer that moves the position into job data and also mentions that a compare-and-set would
be the fix if the cursor had to stay shared passes. Do not grade the batch size, whether a race
test is added, or whether the answer also proposes not starting a second run.
