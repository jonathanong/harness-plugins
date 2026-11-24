---
type: llm
---

Grade the fix on one rule: when runs of a sweep must not overlap and nothing sets a deadline
for a run, a new run is not started while one is active. The job that would start a pass
checks the queue first. The pass stays a chain of capped jobs that carries its own position.

PASS if all hold:

- Before a pass starts, the code asks the queue whether a job of this sweep is already waiting
  or active (or delayed), and starts nothing when one is. Any working way of telling a pass in
  progress from the job doing the check passes.
- A pass is still a chain of jobs, each doing a bounded batch and adding the next.
- The position still travels in the job's data, one per pass.

FAIL if the fix turns a pass into one job that loops over every account. FAIL if it moves the
position into a stored row that passes share, even with a fixed job id that keeps one job
running at a time. FAIL if it takes a PostgreSQL lock to keep passes apart: an advisory lock,
a row lock on a marker or cursor row, or `LOCK TABLE`. FAIL if it only makes each pass cheaper
or slower (a smaller batch, a delay, a concurrency limit) or only lengthens the interval, and
still lets a second pass start while one is active.

A small gap between the check and the start, where a rare second pass could begin, does not
fail the answer; it only repeats work. Changing the interval as well, or pausing between
batches as well, is fine and is not graded. Do not grade the batch size.
