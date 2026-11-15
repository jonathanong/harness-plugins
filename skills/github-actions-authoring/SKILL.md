---
name: github-actions-authoring
description: Design event-driven GitHub Actions without remote-state polling.
---

# GitHub Actions authoring

Never poll in CI. A workflow reacts to a state transition. Read every applicable `AGENTS.md`
first. Repository-local policy owns runner labels, permissions, action pins, concurrency, secrets,
and required-check names, and overrides these defaults. When the `no-mistakes-rules` plugin is
installed, `no-mistakes-rules:github-actions-rules` is the optional rule list for triggers,
permissions, pins, and timeouts; this skill covers the design those rules do not prescribe.

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
- A scheduled reconciliation workflow may repair a missed event. It inspects one snapshot and exits.
  It does not wait for convergence.

## Persistent workspaces

An ephemeral hosted runner starts from a clean workspace and needs no cleanup step. These rules
apply only when a job runs on a self-hosted or otherwise persistent runner.

- A persistent workspace checks out the full tree. Do not configure sparse checkout. Enforce that
  with a YAML-aware check over the tracked workflow and action files, with accepted and rejected
  fixtures.
- Fix workspace ownership at the producer. A writable workspace bind mount uses a non-root identity
  whose ownership and write access match the runner workspace.
- Do not add an unconditional pre-checkout workspace-wide permission or ownership traversal.
- Migrate a contaminated workspace once, while the runner is drained.
- Routine repair may cover bounded known generated paths. A workspace-wide fallback must be
  failure-gated, same-filesystem, directory-only, and batched, and must record path count and
  timing.
- Moving a job from a persistent runner to a hosted one drops every piece of runner-local state the
  job assumed: browser installs, package-manager stores, build directories, preinstalled packages,
  and warm image stores. Replace each assumption with a keyed cache step, and re-derive
  `timeout-minutes` from a real passing run on the new runner.

## Reject polling designs

- Do not add a sleep-and-read loop, a repeated query of a run, check, deployment, lease, or
  service, a CLI waiter, or a recursive redispatch whose purpose is to watch remote state change.
- A timeout caps cost. It does not make polling event-driven.
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
