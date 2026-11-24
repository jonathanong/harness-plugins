---
type: llm
---

Grade the final message. The repository's first migration puts a `BEFORE UPDATE` trigger on
`profiles` that sets `updated_at = now()`. The job under review does not mention it.

PASS if all hold:

- It says the job's `UPDATE` fires that trigger (or otherwise bumps `updated_at`), which is the
  column the sweep selects by, so every reindexed row is selected again on a later run and the
  sweep never runs out of work. A fix that stops this job's write from changing `updated_at`,
  or selects by something the job does not write (such as a separate dirty marker or the search
  text being stale), passes.
- It says the `profile-indexed` notification is sent again each time a row is reindexed, so
  users get repeats, and asks to make it idempotent (keyed to the edit, sent once per change,
  or sent by the edit itself rather than the sweep) or to remove it.
- It asks for a test that runs the sweep a second time over the same data and checks that the
  second run updates nothing and enqueues nothing.

FAIL if any of those is missing. FAIL if the review never connects the job's write to
`updated_at`. FAIL if it only says the job would loop if such a trigger exists, or asks the
author to check the schema: the trigger is in `migrations/0001_init.sql`, and the review has to
have found it and state the loop as a fact. Other review points (batching the updates, the per-row loop, ties on
`updated_at`) are fine alongside them but do not replace them.
