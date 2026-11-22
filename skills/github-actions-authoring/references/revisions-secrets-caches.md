# Revisions, secrets, caches, and artifacts

Read this when a workflow compares commits, calls a reusable workflow, caches or uploads
anything, or runs `gh api` or `git` in a step.

## Comparing commits

- For the files a pull request changed, compare from the merge base: `git diff base...head`
  (three dots), with enough history fetched to find it. A two-dot diff of the base SHA and the
  head SHA also lists what landed on the base branch after the pull request branched.
- On the default checkout, which is the temporary merge commit, `git diff HEAD^1 HEAD` gives the
  same files. Take the parent from the commit, not `github.event.pull_request.base.sha` paired
  with `github.sha`: the event's base SHA and the merge commit are computed at different times,
  and the pair means something else on any other event.
- The default checkout fetches one commit. Fetch the commits the diff names, or it fails or
  compares the wrong thing.
- A merge queue run has its own range. Resolve it in a step that runs only on `merge_group`, and
  feed every path filter in the job from that step's outputs, so two filters cannot disagree
  about what changed.
- When a trigger has a `paths` list, list every script the workflow runs. A change to a script
  the list leaves out never runs the workflow that uses it.

## Reusable workflows and secrets

- Pass secrets to a reusable workflow by name, never `secrets: inherit`. Inherit hands the callee
  every secret the caller can read, and the review of the caller no longer shows which ones.
- The callee declares each secret under `on.workflow_call.secrets`. Pass every one it marks
  required, and none it does not declare.
- Install dependencies before the first step that holds a credential, keep secrets out of
  job-level `env`, and check out with `persist-credentials: false`. An install runs third-party
  scripts; they can read a secret in the job's environment and the token checkout leaves in the
  Git configuration. Give the token only to the later step that pushes.
- A step that commits or pushes runs `git -c core.hooksPath=/dev/null`. A hook checked into the
  tree would otherwise run with the job's token.

## Caches

- Key a cache on the hash of the lockfile plus `runner.os` and `runner.arch`, and set no
  `restore-keys` for a cache of binaries. A fallback key restores binaries built for another
  lockfile, such as a browser the installed test runner cannot drive.
- A step that downloads a large tool, such as a browser install, follows a cache step for its
  directory.
- Decide in one place whether the package manager's store is cached. Where the setup action is
  told not to cache it, no workflow turns that cache on beside it.
- Read the runtime version from the repository's version file, not an inline version, so
  workflows and local development cannot drift.
- Pin a service or container image by digest (`name:tag@sha256:...`), and use the same reference
  in every workflow. A tag moves, and two workflows on different digests test different
  databases.
- Set `provenance` explicitly on every image build step, off unless something reads the
  attestation. The default adds an attestation manifest, which turns a single-platform image
  into an index: its digest changes and tools that expect one manifest fail.

## Artifacts

- Every upload sets `retention-days` and an explicit `name`. An artifact a later job reads needs
  days at most; the default keeps it for months and counts against storage.
- An upload that a retry may repeat sets `overwrite: true`, or the second attempt fails on the
  name. The `merge` sub-action has no such input.
- Pass a step's result to a later step as `${{ steps.<id>.outcome }}`, not as text the first
  step printed.

## Tests of workflows

Do not assert an action's exact ref (`owner/repo@v4` or a full SHA) in a test. Every dependency
update then fails the test without any behavior changing. Assert that the ref is pinned.

## `gh api` in a script

- `gh api` sends a POST as soon as any `-f` or `-F` field is present. Give `-X GET` on every read
  that passes fields, or a list call becomes a create. `gh api graphql` is the exception: it
  always posts.
- Do not build a query string by hand (`repos/o/r/pulls?state=open&per_page=100`). Unquoted in
  a shell, the `&` backgrounds the command, drops what follows, and still exits 0; an interpolated
  value can also add a parameter of its own. Pass each value as a field: `-F` for numbers and
  booleans, `-f` for strings.
