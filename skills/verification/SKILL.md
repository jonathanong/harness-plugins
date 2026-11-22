---
name: verification
description: Use before saying a task is done, fixed, passing, deployed, or merged, when writing a status, summary, or handoff, and when asked "did it work?" or "are we good to merge?". Check each claim against something observed in this session, and report what was not verified separately.
---

# Verification

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

A reader acts on your report without redoing the work. A claim that was never checked becomes
their bug.

## Back each claim

- Back every claim with something you observed in this session: the command you ran and its
  result. "Should work" and "it looks right" are not results.
- Run the check that matches the claim. Tests for "tests pass", the real behavior for "it
  works", the remote state for "pushed", "merged", or "deployed". A build or typecheck passing
  shows the code compiles, not that it behaves.
- Re-run after the last change. A result from before a later edit says nothing about the code
  now, even if the edit was one line.
- Read the exit code and the output together. A command that printed errors and exited 0, or
  whose exit code a pipe hid, has not passed.
- Do not repeat a subagent's or a tool's summary as fact. Check the artifact it points to: the
  diff, the test output, the actual state.

## Report

- List what was verified, with the command and result, apart from what was not, with the reason.
  Do not blend them into one confident sentence.
- Report a failure or a skipped step with its output. Never round a partial result up: "41 of 42
  passed" is not "tests pass".
- When a check cannot be run (no access, too costly, too slow), say so and name the check the
  reader should run.

Example:

> Verified: `pnpm test` passed (42 of 42) after the last edit. Not verified: the export against
> the real database, which I cannot reach; run `pnpm run export --dry-run` on staging.

For the handoff note itself, use the `agent-workflow` skill.
