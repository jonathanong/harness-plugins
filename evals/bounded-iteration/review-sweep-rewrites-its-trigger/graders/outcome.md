---
type: llm
---

Grade the final message.

PASS if all hold:

- It says the `UPDATE` fires the `profiles_touch` trigger, which sets `updated_at`, the column the
  sweep selects by, so every
  reindexed row is selected again on a later run and the sweep never runs out of work. A fix that
  stops writing `updated_at` in this job, or selects by something the job does not write (such as
  a separate dirty marker or the search text being stale), passes.
- It says the `profile-indexed` notification is sent again each time a row is reindexed, so users
  get repeats, and asks to make it idempotent (keyed to the edit, sent once per change, or sent by
  the edit itself rather than the sweep) or to remove it.
- It asks for a test that runs the sweep a second time over the same data and checks that the
  second run updates nothing and enqueues nothing.

FAIL if any of those is missing. Other review points (batching the updates, the per-row loop,
ties on `updated_at`) are fine alongside them but do not replace them.
