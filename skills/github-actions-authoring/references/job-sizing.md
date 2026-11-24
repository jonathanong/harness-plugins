# Job sizing and operating-system tiers

Read this when adding a job, a matrix, a shard, or a `needs` edge, or when choosing which suites
run on a pull request. These are defaults; the repository's own policy overrides them.

Every job pays for its own setup before it does any work: waiting for a runner, checkout,
toolchain install, cache restore. That is often 20 to 50 seconds. Every job also holds one of
the account's concurrent-job slots while it runs. `github-ci-operations` has the limits and how
to measure a queue.

## Size

Two numbers size a workflow. Measure both from the jobs API, not from a guess.

- **Overhead.** A shard's setup should be under 30% of its run time. Setup is everything
  before the work starts: runner start, checkout, toolchain install, cache restore.
- **Wall time.** A workflow should finish in under 15 minutes end to end.

Then:

- Shards always run in parallel, one shard to a job. Never run several shards one after
  another inside a job, such as a loop over a shard list: that turns parallel work into
  serial work.
- When setup is more than 30% of a shard, lower the shard count to the highest count that
  brings it under 30%. Each of the fewer shards still runs in its own parallel job. Sixteen
  shards with 45 seconds of setup and 30 seconds of tests are 60% overhead; four shards with
  the same setup and two minutes of tests are under 30%.
- 30% is a ceiling, not a number to drive down. Past it, every shard removed makes the
  workflow slower and saves little. Shards at 31% drop a few shards, not most of them, and
  shards already under 30% keep their count.
- When the workflow takes longer than 15 minutes, shard the job on its slowest path, up to
  the count that keeps setup under 30%. If it is still too slow at that count, cut the setup
  time; more shards would spend their time on setup, and on a saturated pool they add queue
  wait, not speed.
- Do not fan a workflow out into many tiny jobs. Every job waits for a runner and holds one
  of the account's concurrent-job slots, so hundreds of jobs that each run for seconds back
  up the queue for every repository in the account. The 30% figure applies to each leg of
  any matrix, not only to test shards.
- A single job that cannot be split or sharded, such as a short lint job, is not folded into
  another job to meet the 30% figure.

## `needs` edges

- Jobs that do not depend on each other run in parallel. Add a `needs` edge only when the
  later job uses what the earlier one produced, or when the earlier job failing means the
  later one would very likely fail too: there is no point running the tests when a static
  check has failed. Do not chain independent jobs to save runners.
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
