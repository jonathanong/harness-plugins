# Job sizing and operating-system tiers

Read this when adding a job, a matrix, a shard, or a `needs` edge, or when choosing which suites
run on a pull request. These are defaults; the repository's own policy overrides them.

Every job pays for its own setup before it does any work: waiting for a runner, checkout,
toolchain install, cache restore. That is often 20 to 50 seconds. Every job also holds one of
the account's concurrent-job slots while it runs. `github-ci-operations` has the limits and how
to measure a queue.

## Size

- A job that does real work should take about 5 to 10 minutes. Measure it from the jobs API,
  not from a guess.
- Merge shards and jobs that are mostly setup. Twelve one-minute shards spend most of their
  runner time on setup and take twelve slots; two six-minute jobs do the same work.
- Split a job that runs much longer than that, so a failure reports sooner and a rerun repeats
  less.
- Do not add shards to make a slow suite faster until the existing shards each run for several
  minutes. More shards on a saturated pool add queue wait, not speed.

## `needs` edges

- Do not put a short job behind a `needs` edge of its own. Each edge waits for a new runner,
  which adds wall time and holds a slot. Run the short step inside the job that needs it.
- These jobs are separate for a reason other than time, and stay separate however short they
  are: a gate job that aggregates results for a required check; a job split off so that a
  permission or credential stays away from checked-out code; a job that needs another runner
  or operating system.

## Operating-system tiers

- macOS and Windows runners are scarcer and cost more than Linux ones, and the macOS limit does
  not rise with most plans.
- On a pull request, run a small smoke tier on each non-Linux system: build, and the tests that
  touch platform-specific code.
- Run the full macOS and Windows suites on the default branch, where each commit already gets
  its own result. A failure there is traced to one commit.
- Say in the pull request what the smoke tier leaves out, so a reviewer knows what was not run.
