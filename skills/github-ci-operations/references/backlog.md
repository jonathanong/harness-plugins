# Backlog: jobs are queuing at the runner limit

Read this only when jobs wait minutes for a runner because the account is at a concurrency
limit. These steps free runners now. They are not how CI is run day to day: outside a backlog,
no run is cancelled by hand.

Work in this order. Each step is cheaper than the next.

1. **Find what holds the pool.** Group the running and queued jobs by run and by label. Look for
   runs for commits that are no longer the head, and for many jobs that finish in a minute or
   two.
2. **Cancel superseded runs.**
   - On a pull request, a run for an older push should already have been cancelled. If it was
     not, the workflow lacks `concurrency` with `cancel-in-progress`; fix the workflow.
   - On the default branch, workflows do not cancel in-progress runs, because each commit there
     needs its own result. During a backlog, an operator may cancel the runs for older commits
     by hand:
     `gh api -X POST repos/OWNER/REPO/actions/runs/RUN_ID/cancel`. Say in the report which
     commits now have no result.
   - Never cancel the newest run of a workflow on a ref, or a run a release is waiting on.
3. **Do not rerun a job to see whether it is flaky.** A rerun takes a runner from the queue and
   tells you less than the log does. Read the failure with `review-ci-logs`.
4. **Reduce the number of jobs.** Merge jobs that are mostly setup, and move full macOS and
   Windows suites off pull requests. `github-actions-authoring` owns those rules, in its
   job-sizing reference.
5. **Only then add runners or change plan,** and name the pool and the limit that the change
   raises.

When the queue has cleared, stop cancelling. If the backlog comes back, the fix is in the
workflows (step 4), not in cancelling again.
