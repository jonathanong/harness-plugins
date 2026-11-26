---
name: debugging
description: Use when asked to fix a failing test, a bug report, a crash, an error in logs, a flaky test, or "it works locally but not in CI". Find the cause of a failure before changing code - reproduce it, test one hypothesis at a time, fix the cause rather than the symptom, and prove the fix.
---

# Debugging

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

A fix without a known cause is a guess that happens to pass. Find the cause first, then change code.

## Find the cause

- Reproduce the failure first with the smallest command that fails. Record the command and its
  output. A change you cannot check against a failing run proves nothing.
- If it cannot be reproduced, say so and gather what would allow it: the failing input, the
  environment, the version, the seed, more logging. Do not ship a guessed fix for a failure you
  never saw.
- Read the whole error and find the first failure, not the last line. Later errors are often
  consequences of the first, and fixing them leaves the cause in place.
- State one hypothesis and the observation that would disprove it, then make that observation.
  Change one thing at a time; with two changes you cannot tell which one mattered.
- When the cause is not visible, find when it started: compare with the last passing run, or
  bisect the commits between a passing and a failing one. The change that introduced it is
  usually the cause.

## Fix the cause

Do not add any of these unless you have shown the cause is exactly that:

- A longer timeout or a retry: the failure is still there, and now it is slow or rare.
- A swallowed error or a null guard: the bad value still exists and surfaces somewhere else.
- A skipped or loosened test: the check that found the defect is gone.
- A special case for the failing input: every similar input still fails.

A flaky test is a real defect, in the test or in the code. Look for shared state, an un-awaited
promise, an ordering assumption, a clock, or a race, and fix that.

## Done

A fix is done when all of these hold:

- The original reproduction now passes.
- A test that failed before the fix passes after it. Write it so it fails without the fix; the
  `test-authoring` skill covers the test.
- Neighbors that share the cause were checked, as the `agent-workflow` skill says under "Before
  handoff".

To confirm the result before reporting it, use the `status-reports` skill.

## When it does not converge

After a bounded number of failed hypotheses (about three), stop. Report what was ruled out, with
the observation for each, what is still open, and what you would try next. Revert the experiments
that did not help; leftover probes and half fixes make the next attempt harder.

For a failure that appears only in CI, read the logs with the `review-ci-logs` skill, then
compare the CI run with the local one: the commit, versions, environment, and data.
