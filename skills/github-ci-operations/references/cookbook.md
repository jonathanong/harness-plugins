# GitHub CI cookbook

Read this for the command or script behind a measurement or a cancel. `SKILL.md` says when to
measure and which runs may be cancelled; `review-ci-logs` says how to read a failing log. Every
recipe needs an authenticated `gh`. Replace `OWNER/REPO`, `RUN_ID`, and `JOB_ID`.

Ask the API for the fields you need. A whole log or a full JSON response costs thousands of
tokens and answers the same question a five-column table does. Read one snapshot; do not watch a
run with `gh run watch`, `gh pr checks --watch`, or a sleep loop.

## Bundled scripts

The scripts are in the skill's `scripts/` directory; `<skill>` below is the skill's base
directory. They use only the Python standard library and
call `gh api`. Each stops at `--max-calls` and lists what a cap cut under `truncated`.

- `python3 <skill>/scripts/report.py --repo OWNER/REPO [--days 7] [--json]` prints one line per
  workflow, job, and runner label for the window: wall time, queue wait, failures by step,
  merge-queue ejections, reruns that passed, billed runner minutes, required checks, and the
  rate limit before and after. Read it before proposing a change to CI.
- `python3 <skill>/scripts/stale.py --repo OWNER/REPO [--older-than 6h] --dry-run` lists runs stuck in a
  queued or running state for longer than the threshold. Without `--dry-run` it cancels them,
  and force-cancels a run that refuses a plain cancel and has jobs. It never cancels a run on
  the default branch; those are listed on one `default-branch` line. A run that never started
  cannot be cancelled through the API; they are listed on one `never-started` line.

Run `--dry-run` first and read the list before cancelling.

## Job and step times

Queue wait is `started_at - created_at`. Run time is `completed_at - started_at`. Both come from
the jobs of a run, not from logs:

```bash
gh api repos/OWNER/REPO/actions/runs/RUN_ID/jobs --paginate --jq '.jobs[]
  | [.name, (.labels | join(",")), .status, .created_at, .started_at, .completed_at]
  | @tsv'
```

Step times are in `.steps[]` with the same two fields. Run the query once after the jobs start;
the timestamps give the wait exactly, so a poll adds nothing.

## Count running jobs

No single call counts an account's running jobs. Count one repository's, and add up the
repositories that run CI:

```bash
for status in in_progress queued; do
  gh api "repos/OWNER/REPO/actions/runs?status=$status&per_page=100" --paginate \
    --jq '.workflow_runs[].id'
done | while read -r id; do
  gh api "repos/OWNER/REPO/actions/runs/$id/jobs" --paginate \
    --jq '.jobs[] | select(.status != "completed") | [.status, (.labels | join(","))] | @tsv'
done | sort | uniq -c
```

Group the queued jobs by their full set of labels; a job waits for a runner that has every label
it asks for.

## Only the failed job's log

Find the failed jobs and the step that failed, then fetch only those jobs' logs to a temporary
file and search it:

```bash
gh api repos/OWNER/REPO/actions/runs/RUN_ID/jobs --paginate --jq '.jobs[]
  | select(.conclusion == "failure")
  | [.id, .name, ([.steps[] | select(.conclusion == "failure") | .name] | join(","))] | @tsv'
log="$(mktemp)"
gh api repos/OWNER/REPO/actions/jobs/JOB_ID/logs >"$log"
grep -n -m 20 -iE 'error|fail' "$log"
```

Read around the first match with `sed -n`, and remove the file afterwards. Do not download the
run's whole log archive.

## An existing flake issue

Search open and closed issues for the test or job name before filing one:

```bash
gh search issues --repo OWNER/REPO --match title,body \
  --json number,title,state,updatedAt -- "TEST_OR_JOB_NAME"
```

Search again with the first line of the error when the name finds nothing. `github-issue` owns
whether to comment on a match or file a new issue.

## The pull request behind a merge-queue run

A `merge_group` run's branch is `gh-readonly-queue/<base>/pr-<number>-<sha>`:

```bash
gh api repos/OWNER/REPO/actions/runs/RUN_ID --jq '.head_branch' |
  sed -nE 's#^gh-readonly-queue/.+/pr-([0-9]+)-.*#\1#p'
```

A failed merge-queue run removes that pull request from the queue.

## Cancel superseded runs on a pull request's branch

This is for a pull request's branch only, never the default branch, a merge-queue branch
(`gh-readonly-queue/...`), or a tag. A run there is superseded when a newer run of the same
workflow on the same branch exists. List the runs still going on that branch, newest first:

```bash
gh api "repos/OWNER/REPO/actions/runs?branch=PR_BRANCH&status=in_progress&per_page=100" \
  --jq '.workflow_runs[] | [.id, .workflow_id, .head_sha[0:7], .created_at] | @tsv'
gh api "repos/OWNER/REPO/actions/runs?branch=PR_BRANCH&status=queued&per_page=100" \
  --jq '.workflow_runs[] | [.id, .workflow_id, .head_sha[0:7], .created_at] | @tsv'
```

Keep the newest run of each workflow, and cancel the older ones:

```bash
gh api -X POST repos/OWNER/REPO/actions/runs/RUN_ID/cancel
```

When a pull request's older runs keep running, also add `concurrency` with `cancel-in-progress`
to the workflow; `github-actions-authoring` owns that.
