---
name: github-ci-operations
description: Use when CI is slow, queued, backlogged, or expensive, when jobs wait for runners, when asked whether to add runners or upgrade a plan, or when checking how long jobs take on GitHub Actions. Measures job time and queue wait with small API queries, gives the hosted-runner concurrency limits, and says what to do, in order, when runs are backed up at a limit.
---

# GitHub CI operations

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

This skill is for a CI system that works but is slow, backed up, or costly. For a run that
fails, use `review-ci-logs`. For how a workflow should be written, including job size and which
suites run on pull requests, use `github-actions-authoring`.

## Measure with small queries

Ask the API for the fields you need. A log or a full JSON response costs thousands of tokens and
answers the same question a five-column table does.

- Job time and queue wait come from the jobs of a run, not from logs:

  ```bash
  gh api repos/OWNER/REPO/actions/runs/RUN_ID/jobs --paginate \
    --jq '.jobs[] | [.name, .labels[0], .status, .created_at, .started_at, .completed_at] | @tsv'
  ```

  Queue wait is `started_at - created_at`. Run time is `completed_at - started_at`. Step times
  are in `.steps[]` with the same two fields.

- To find which runner pool is short, list the jobs that are still queued and group them by
  runner label. The label with the queue is the pool to fix; the others are not the problem.
- Read one snapshot. Do not watch a run with `gh run watch`, `gh pr checks --watch`, or a sleep
  loop. To wait for a result, use the event-driven tool the repository provides.
- When a log is needed, fetch one job's log to a temporary file
  (`gh api repos/OWNER/REPO/actions/jobs/JOB_ID/logs`) and search it. `review-ci-logs` owns how
  to read it.

## Know the limits before proposing more runners

Concurrency on GitHub-hosted standard runners is counted across every repository in the account,
not per repository.

| Plan       | Total concurrent jobs | Concurrent macOS jobs |
| ---------- | --------------------- | --------------------- |
| Free       | 20                    | 5                     |
| Pro        | 40                    | 5                     |
| Team       | 60                    | 5                     |
| Enterprise | 500                   | 50                    |

- macOS has its own cap, and it is the same on Free, Pro, and Team. A queue of macOS jobs is not
  fixed by moving between those plans. Run fewer macOS jobs.
- Windows has no cap of its own. It counts toward the total.
- A macOS minute costs about ten times a Linux minute, and a Windows minute costs more than a
  Linux one. Each job is billed rounded up to a whole minute, so many short jobs cost more than
  the same work in one job.
- These numbers change. Check them against GitHub's
  [limits](https://docs.github.com/en/actions/reference/limits) and
  [runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing) before
  quoting one in a decision.

## When CI is backlogged

Jobs queuing for runners at the account's limit is its own situation, with steps that are wrong
at any other time, such as cancelling runs on the default branch. When jobs wait minutes for a
runner, read [backlog](references/backlog.md) and follow its order. Outside a backlog, cancel
nothing by hand.

## Report

Give the measurements the decision rests on: jobs per run, the share that finish in under two
minutes, total queue wait, wall time, and the saturated label. State what was cancelled.
