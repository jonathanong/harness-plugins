---
name: review-ci-logs
description: Use when a CI run fails or flakes, when asked why a job or check failed or handed a failing log, when asked to make CI green or quieter, or when asked to add a retry or silence output in a workflow. Diagnose a CI failure or noisy CI output from the logs, find the first cause the repository owns, and fix it without hiding diagnostics.
---

# Review CI logs

Read every applicable `AGENTS.md` first, then the CI docs. Repository-local policy overrides
these defaults. For CI that passes but is slow or queued, use `github-ci-operations`. For the
commands, read its [cookbook](../github-ci-operations/references/cookbook.md).

1. Pick the runs. For a run you were given, inspect only that run. Otherwise choose a few failed
   and a few successful runs inside a bounded window.
2. Fetch only the failed jobs' logs to a temporary directory and read the failed steps there.
   Do not download or stream the run's whole log archive. Remove the files afterwards.
3. Classify each finding: a real error, misleading output, a cascade from an earlier error, a
   diagnostic worth keeping, or volume only. Find the first cause the repository owns. Later errors
   are usually the cascade. When the log shows what failed but not why, read what that step reads
   in the repository, such as its configuration and the file it names, and say why. Do not hand
   back a list of possible reasons you could have checked.
   Then say what kind of failure it is, because each needs a different response:
   - **Caused by the change**: the failure follows the pull request's diff. Fix it there.
   - **Known flake**: the same test or job has both failed this way and passed on unchanged code,
     on other commits or in other attempts. A test that fails every time is broken, not flaky.
     Search for an issue that tracks it and cite it, or say that none was found; a second issue
     for one flake splits its history.
   - **Infrastructure**: a runner, network, cache, or registry failed, not the code. Say which.
   - **Outage**: the provider's status page or the same error across unrelated repositories
     shows a service down. Wait for it to recover; there is nothing to fix.
     Do not rerun a failed job to find out which it is. A rerun spends a runner and a pass proves
     nothing about the cause; read the log. Rerun only once the kind is known: a known flake you
     have cited, or an infrastructure or outage failure whose cause has passed.
4. Compare the failing job with what was run locally before the push: the same commit, project,
   target, fixtures, and configuration. Say which of these holds: the local check was skipped, it
   passed in a different scope or environment, the failure can only happen in CI, or it is
   unknown. The same command name does not prove the same scope. Do not call an outside
   infrastructure failure a gap in local checks.
5. When the cause is one the repository owns, make one bounded fix at the cause. For an outage,
   or an infrastructure failure outside the repository, report it and skip steps 5 and 6. Keep
   non-zero exits, the primary error, artifacts, summaries, and diagnostic output. Do not hide stderr, quiet output globally, or add a retry
   that masks the cause. A retry is right only for the same idempotent operation failing for a
   transient outside reason.
6. Add a focused regression check, run the workflow checker, and compare the output before and
   after where that means something. Report what was left alone. Do not file issues unless asked;
   when asked, `github-issue` owns how.
7. When a local check was skipped or did not match CI, say so in the pull request description.
   The `pr-description` skill owns what that note holds.
