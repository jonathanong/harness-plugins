# Workflow baseline

Check these before editing any workflow or composite action. A stricter repository rule wins.

## Triggers and required checks

- Use `pull_request` for pull-request workflows. Reserve `pull_request_target` for a workflow that
  only uses base-branch code, such as labeling.
- A privileged workflow must not check out or execute untrusted pull-request content.
- Do not subscribe a pull-request CI workflow to `ready_for_review` or `converted_to_draft` unless
  a job changes what it does on that transition. Each of those starts another run for the same
  head, and `cancel-in-progress: true` then replaces checks that already passed.
- Do not put a `branches` or `branches-ignore` filter on the `pull_request` trigger of a workflow
  that must run on stacked pull requests. The filter matches the pull request's base branch, so
  `branches: [main]` skips every pull request whose base is another pull request's branch, and
  the layers above the bottom get no CI. After changing a trigger on the default branch, rebase
  open stacks so their branches carry the new workflow file.
- A required check is a real job that runs or aggregates the work it reports.
- A workflow-level `paths` filter that skips the whole workflow leaves its required check pending.
  Select the area inside a job, and let a gate job named for the check always run and pass when the
  area is skipped.
- Workflow code must not create check runs or commit statuses to synthesize a required context or
  copy another workflow's conclusion. An external CI or analysis service may report its own result.

## Concurrency and timeouts

- Serialize runs for the same pull request or branch with one stable concurrency group. Keep the
  pull-request number or the ref in the group.
- Set `cancel-in-progress: true` for pull requests and `false` on the default branch. When one
  workflow handles both events, make it conditional:
  `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`.
- Give every concrete job `timeout-minutes` of at most 30. A job that calls a reusable workflow
  with `uses:` cannot take `timeout-minutes`; set it on each job inside the called workflow.
- If the work cannot finish inside that bound, split it into phases joined by events. Keep a
  required check's name with a small fan-in job when the split would otherwise change it.
- Keep `timeout-minutes` below any hard limit of the runner, so the job's own cancellation fires
  first and `always()` or `cancelled()` cleanup steps still run.
- Give each long-running, network-bound, or waiting step its own `timeout-minutes`. Bound each
  network call, such as `curl --connect-timeout 5 --max-time 30`.

## Runners

- Prefer hosted runners, and the smallest one the job fits, such as `ubuntu-slim` for a short job
  that needs no Docker daemon.
- Check out with `persist-credentials: false` unless a later step must push with that token.
- A hosted runner starts clean. Do not add workspace cleanup steps for it.
- A check that compares with a base revision fails when the base is unavailable; it does not fall
  back to the current tree.

## Pinning

- Pin every external `uses:` reference to a full 40-character commit SHA followed by a version
  comment, such as `# v4.2.0`, so a dependency bot can update both.
- Pin a `docker://` action to an `@sha256:` digest.
- A test or fixture must not assert an action's exact SHA or version. Assert the action's identity
  and the SHA shape, or read the ref from the workflow under test. Asserting an exact revision in
  `with.ref` is fine when exact-head checkout is a security invariant.

## Editing

1. Name the trusted inputs, the untrusted inputs, and every credential boundary.
2. Give each job the least permissions it needs. Keep untrusted pull-request content out of shell
   interpolation, privileged tokens, and steps that can write.
3. Run the workflow checker and the affected tests. Update CI docs when behavior changes.
4. Review the diff for privilege escalation, secret exposure, unsafe quoting, and paths that can
   never run.
