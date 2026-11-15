---
name: review-ci-logs
description: Diagnose a CI failure or noisy CI output from the logs, find the first cause the repository owns, and fix it without hiding diagnostics. Use when a CI run fails or flakes, when asked to make CI green or quieter, or when asked to add a retry or silence output in a workflow.
---

# Review CI logs

Read every applicable `AGENTS.md` first, then the CI docs. Repository-local policy overrides
these defaults.

1. Pick the runs. For a run you were given, inspect only that run. Otherwise choose a few failed
   and a few successful runs inside a bounded window.
2. Download logs to a temporary directory and read the failed steps there. Do not stream whole
   archives into the conversation. Remove the files afterwards.
3. Classify each finding: a real error, misleading output, a cascade from an earlier error, a
   diagnostic worth keeping, or volume only. Find the first cause the repository owns. Later
   errors are usually the cascade.
4. Compare the failing job with what was run locally before the push: the same commit, project,
   target, fixtures, and configuration. Say which of these holds: the local check was skipped, it
   passed in a different scope or environment, the failure can only happen in CI, or it is
   unknown. The same command name does not prove the same scope. Do not call an outside
   infrastructure failure a gap in local checks.
5. Make one bounded fix at the cause. Keep non-zero exits, the primary error, artifacts,
   summaries, and diagnostic output. Do not hide stderr, quiet output globally, or add a retry
   that masks the cause. A retry is right only for the same idempotent operation failing for a
   transient outside reason.
6. Add a focused regression check, run the workflow checker, and compare the output before and
   after where that means something. Report what was left alone. Do not file issues unless asked.
7. When a local check was skipped or did not match CI, say so in the pull request description:
   the first failed run and its commit, what was run locally, why it missed the failure, and the
   correction. Keep that note after CI turns green.
