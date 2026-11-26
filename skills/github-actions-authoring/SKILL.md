---
name: github-actions-authoring
description: Use when writing, editing, or reviewing a GitHub Actions workflow such as ci.yml, or a composite action, or when asked to add or change a job, a matrix, test shards, triggers, or a concurrency block. Design GitHub Actions workflows that react to events instead of polling, and check triggers, concurrency, timeouts, runners, pins, and job size.
---

# GitHub Actions authoring

Read every applicable `AGENTS.md` first. Repository-local policy owns runner labels, permissions, action pins, concurrency, secrets,
and required-check names, and overrides these defaults. When the `no-mistakes-rules` plugin is
installed, `no-mistakes-rules:github-actions-rules` is the optional rule list for triggers,
permissions, pins, and timeouts; this skill covers the design those rules do not prescribe.

A workflow reacts to a state transition and never polls; "Reject polling designs" states the
rule and its two exceptions.

When a request asks by name for something this skill or one of its references says not to
do, such as chaining independent jobs or one job per small upload, say why and give what the
rule calls for in its place. Do not hand over what was asked for with a note beside it.

Before editing any workflow, read the [workflow baseline](references/workflow-baseline.md):
trigger types that restart passed checks, concurrency and cancellation, the 30-minute job bound,
runner choice, and pinning. For a manually dispatched workflow that mutates shared infrastructure
or data, also read [destructive workflows](references/destructive-workflows.md). For a job on a
self-hosted or otherwise persistent runner, or one moving from such a runner to a hosted one,
also read [persistent runner workspaces](references/persistent-runners.md): checkout, workspace
ownership and repair, and the runner-local state a move drops. When adding a job, a matrix, a
shard, or a `needs` edge, or choosing which suites run on a pull request, read
[job sizing](references/job-sizing.md).

## Design the event graph

- Name the producer, the durable transition it emits, and the consumer that owns the next action.
- Use `needs` for jobs in one workflow. Use `workflow_call` when the caller must await a reusable
  workflow. When a consumer must run after failure or skip, give it an explicit status condition and
  read `needs.<job>.result`. The implicit success condition skips it otherwise.
- Use `workflow_run` when a completed workflow is the trusted event boundary. Validate the source
  workflow, repository, branch or pull-request head, conclusion, and artifacts before acting.
- The `workflow_run` receiver must already exist on the default branch. GitHub chains at most three
  `workflow_run` levels. Plan that rollout, and collapse a deeper chain into one DAG.
- Use `repository_dispatch` for a cross-repository transition or an authenticated external callback.
  Authenticate the sender, pass immutable correlation data, validate it against the source, and make
  duplicate delivery safe. The receiver must already exist on the default branch before senders are
  enabled.
- Prefer a provider-native completion event, callback, queue, or state-machine transition for a
  deployment or service.
- Keep the deploys of separate services independent. Do not make one deploy wait for, poll, or
  read the result of another's. Make each change safe against the other service's old and new
  version, so any deploy order works and one stuck deploy blocks nothing else.
- A scheduled reconciliation workflow may repair a missed event. It inspects one snapshot and exits.
- Do not gate on another workflow by reading its status through `gh` or the API, even once. On a
  tag or branch push that workflow may still be running, so a single lookup races it. Call it with
  `workflow_call` and `needs`, or trigger on a validated `workflow_run`. A manually dispatched
  run, such as promoting an operator-chosen SHA, may look up a run that already completed when it
  validates the workflow, repository, SHA, and successful conclusion.
  It does not wait for convergence.

## Keep jobs inspectable

- Move a long inline `run:` script to a tracked file with tests. Inline scripts are not linted
  beyond syntax, cannot be run locally, and are reviewed as YAML strings.
- A script that developers also run locally must work on the macOS system `/bin/bash` (3.2), not
  only on the Linux runner. Avoid `mapfile`, `declare -A`, `${var,,}`, and GNU-only flags, or
  state the interpreter and require a newer one explicitly. With `set -u`, expand a possibly
  empty array as `"${arr[@]+"${arr[@]}"}"`. Never assign zsh's read-only `status` or `pipestatus`.
- For diff ranges, reusable-workflow secrets, cache keys, artifact uploads, and `gh api` calls
  in a step, read [revisions, secrets, caches, and artifacts](references/revisions-secrets-caches.md).
- In a public repository, report test coverage to Codecov, and set `continue-on-error: true` on
  the upload step. The upload fails for reasons the change did not cause, such as an outage or a
  rate limit, and a job that is red for that hides whether the tests passed. The tests, and any
  coverage threshold the repository checks itself, still fail the job.
- Check out the whole tree for a job whose checks read the whole tree. A sparse checkout makes a
  repository-wide lint or graph check pass on the files it happened to fetch.
- Do not cancel in-progress runs on the default branch. A run that has started there
  finishes, so the branch always has a recent finished result; with cancellation, steady
  merges can leave it with none, and a failure cannot be traced to a commit. Cancel superseded
  runs on pull requests only. When the request asks for cancellation on the default branch
  by name, say this and give the block from the baseline in its place; do not hand over the
  cancelling block with a note beside it. An operator cancelling old runs by hand while the
  account is at its concurrency limit is a different act; `github-ci-operations` owns it.

## Permissions

Declare a cloud role or API key at job level, in a job gated on a trusted context, so an
untrusted pull request never receives it. A job that calls a live provider or real cloud
resources stays out of the required gate's `needs` and has no `continue-on-error`: its red status
is the signal, and a rerun gains nothing. `test-authoring` owns what gates instead.

Never grant `actions: write` in the job-level `permissions` of a job that runs checked-out code.
That token can cancel runs, delete caches, and dispatch workflows, so any code the job executes,
including a dependency install script, can use it. Put the step that needs it in a separate job
that checks out nothing.

Bind a policy check to an immutable commit SHA, not a branch or tag name, and confirm which
inputs an untrusted pull request cannot rewrite. Read the policy from the base revision, not the
head that is being checked.

## Reject polling designs

- Do not add a sleep-and-read loop, a repeated query of a run, check, deployment, lease, or
  service, a CLI waiter, or a recursive redispatch whose purpose is to watch remote state change.
- A timeout caps cost. It does not make polling event-driven.
- A job that outgrows its timeout is split, not given a longer one. A raised timeout hides which
  part became slow and lets the next regression through.
- If the producer cannot emit a usable event, add the bridge at the producer or provider boundary
  and let that bridge dispatch the correlated completion event.
- Bounded retries are allowed only for the same failed operation, and only when the failure is
  transient and the operation is idempotent.
- A local process readiness check is allowed when that process runs inside the job and cannot emit
  a workflow event.
- Neither exception allows repeated observation of remote state.

## Validate the result

- Test accepted, rejected, duplicate, stale, and out-of-order events.
- Preserve required-check names. Prove that every terminal producer outcome causes one terminal
  consumer outcome.
- Run the local workflow checker and affected tests. Inspect the event graph for credentials
  crossing an untrusted boundary, a missing correlation field, and any remaining polling path.
