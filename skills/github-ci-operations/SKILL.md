---
name: github-ci-operations
description: Use when CI is slow, queued, backlogged, or expensive, when jobs wait for runners, when asked whether to add runners or upgrade a plan, or when finding which job or step takes the time on GitHub Actions. Measures job time and queue wait with small API queries, gives the hosted-runner concurrency limits, and says what to do, in order, when runs are backed up at a limit.
---

# GitHub CI operations

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

This skill is for a CI system that works but is slow, backed up, or costly. For a run that
fails, use `review-ci-logs`. For how a workflow should be written, including job size and which
suites run on pull requests, use `github-actions-authoring`.

## Measure with small queries

Ask the API for the fields you need. A log or a full JSON response costs thousands of tokens and
answers the same question a five-column table does.
When a request asks by name for something this section says not to do, such as a polling loop
or a whole run's log, say why and give the small query in its place. Do not hand over what
was asked for with a note beside it.

`github-ci-cookbook` has the commands for each measurement below.

- Job time and queue wait come from the jobs of a run, not from logs. Queue wait is
  `started_at - created_at`. Run time is `completed_at - started_at`. Step times are in the
  same response.
- To find which runner pool is short, list the jobs that are still queued and group them by
  their full set of runner labels; a job waits for a runner that has every label it asks for.
  First count the jobs running across the whole account against the total limit below. When
  the total is full, every label queues, and the fix is the total, not the label that happens
  to be waiting. When it is not, the label with the queue is the pool to fix.
- No single call counts an account's running jobs. Count each repository that runs CI and add
  them up. When that sum cannot be had, say the count is unknown; do not treat a queue alone as
  proof of a limit.
- Read one snapshot. Do not watch a run with `gh run watch`, `gh pr checks --watch`, or a sleep
  loop. A poll tells an agent nothing the timestamps will not: how long a job queued is
  `started_at - created_at` once it starts, so the jobs of a run, read once after the jobs
  start, give the wait exactly. To wait for a result, use the event-driven tool the repository
  provides.
- When a log is needed, fetch one job's log to a temporary file and search it, not the run's
  whole archive. `review-ci-logs` owns how to read it.

## Know the limits before proposing more runners

Concurrency on GitHub-hosted standard runners is counted across every repository in the account,
not per repository. The limits as documented on 2026-11-23:

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
runner and the count of running jobs has reached a limit in the table above, read
[backlog](references/backlog.md) and follow its order. On standard hosted runners, a queue
while the account is under those limits is the provider's delay; wait it out. A self-hosted or
larger-runner pool has its own capacity, which the table does not give.

## Which runs may be cancelled

Outside a backlog, cancel only these, without asking:

- A run stuck in a queued or running state for longer than the repository's threshold (six
  hours by default), on any branch but the default branch.
- A superseded run on a branch other than the default branch: a newer run of the same workflow
  on the same branch exists, so the newest run is never the one cancelled. Never cancel a
  merge-queue run (`gh-readonly-queue/...`), whose cancel removes its pull request from the
  queue, or a run for a tag or a release.

Never cancel a run on the default branch outside the backlog steps: each commit there needs its
own result. A run that is not stuck or superseded is left to finish.

## Report

Give the measurements the decision rests on: jobs per run, the share that finish in under two
minutes, total queue wait, wall time, and the saturated label. State what was cancelled.
