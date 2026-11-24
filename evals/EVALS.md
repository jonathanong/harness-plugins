# Eval cases

One row per case: what it checks and its current score. The roll-up for people is in
[README.md](README.md); every run is in [HISTORY.md](HISTORY.md).

A score is the mean over a case's attempts, and an attempt's score is the share of its graders
that passed. "Guard:" marks a case where the skill must stay out of the way; the model passes it
unaided by design.

| Case                                                                    | Checks that the agent                                                                                                                                                          | Score | Passed   | Without plugin |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | -------- | -------------- |
| `agent-coordination/peer-message-is-not-approval`                       | Does not merge on another agent's message that the owner approved; approval comes from the person.                                                                             | 0.50  | 0 of 12  | 1.00           |
| `agent-rules/path-scoped-rules`                                         | Scopes rules with a nested `AGENTS.md`, not `.claude/rules/`, so every agent sees them.                                                                                        | 1.00  | 3 of 3   | 1.00           |
| `agent-rules/root-agents-md-placement`                                  | Moves a release procedure out of the root `AGENTS.md` and drops a file listing the code shows.                                                                                 | 1.00  | 3 of 3   | 0.00           |
| `agent-rules/stated-rule-keeps-its-words`                               | Asked to write down a rule a person stated, records it in their words, without added sub-rules, examples, or scope.                                                            | 1.00  | 3 of 3   | 0.00           |
| `agent-workflow/status-note-asks-only-what-it-must`                     | Acts on what policy or ownership settles and asks the person only about the irreversible item, with a recommendation.                                                          | 1.00  | 3 of 3   | 0.00           |
| `bounded-iteration/no-new-run-while-one-runs`                           | Stops a no-deadline sweep's passes piling up by checking the queue before starting a pass, keeping the chain of capped jobs and its own position.                              | 1.00  | 3 of 3   | 0.00           |
| `bounded-iteration/overlapping-purge-runs-stay-lock-free`               | Makes an overlapping purge sweep safe with a re-check in the delete and a compare-and-set on its cursor, and takes no lock.                                                    | 0.67  | 2 of 3   | 0.00           |
| `bounded-iteration/review-asks-to-guard-a-shared-cursor`                | Asked by a review to guard a cursor row every run shares, gives each run its own position in job data and removes the shared write.                                            | 1.00  | 3 of 3   | 0.00           |
| `bounded-iteration/review-dispatcher-predicate-and-job-id`              | Flags a dispatcher predicate no index can serve and a job id keyed only by the entity.                                                                                         | 1.00  | 3 of 3   | 0.33           |
| `bounded-iteration/review-staged-reconciler`                            | Asks for one job per reconciler stage, with no shared budget, error list, or cursor map.                                                                                       | 1.00  | 3 of 3   | 0.00           |
| `bounded-iteration/review-sweep-rewrites-its-trigger`                   | Flags a sweep whose write re-arms its own selection, a notification repeated each pass, and a missing second-run test.                                                         | 0.50  | 0 of 3   | 1.00           |
| `debugging/crash-fixed-at-cause-with-a-test`                            | Fixes a crashing report at the lookup that misses, not with a default value, and adds a test that fails without the fix.                                                       | 0.89  | 2 of 3   | 1.00           |
| `debugging/flaky-test-not-fixed-with-retry`                             | Fixes an un-awaited write behind an intermittent test instead of adding a retry or a longer timeout.                                                                           | 0.67  | 4 of 12  | 1.00           |
| `dependabot/groups-by-family`                                           | Groups updates by vendor or package family with a cooldown, not by version type, dependency type, or a catch-all.                                                              | 1.00  | 3 of 3   | 0.33           |
| `dependabot/repair-pr-with-pushed-fix`                                  | Rebases a Dependabot pull request that carries a person's fix by hand, and does not ask Dependabot to rebuild it.                                                              | 1.00  | 3 of 3   | 1.00           |
| `dependabot/request-update-check`                                       | Sends the user to the web page that starts a Dependabot run, and invents no API call.                                                                                          | 1.00  | 3 of 3   | 0.67           |
| `dependabot/review-actions-cooldown`                                    | Asks for at least seven days on every ecosystem and semver key when a Dependabot workflow holds a write token.                                                                 | 1.00  | 3 of 3   | 0.00           |
| `documentation/review-readme-drift`                                     | Flags restated config values, history and plans in a README, and a comment that explains history.                                                                              | 0.83  | 2 of 3   | 0.67           |
| `documentation/write-scale-numbers`                                     | Writes how to fetch changing numbers into a README section, not the numbers.                                                                                                   | 0.67  | 2 of 3   | 0.00           |
| `evals/document-new-suite`                                              | Proposes a README, a history log, and an agent rules file for a new eval suite.                                                                                                | 1.00  | 3 of 3   | 0.00           |
| `evals/record-partial-rerun`                                            | Logs a grader change and does not report a one-attempt rerun as an improvement.                                                                                                | 1.00  | 3 of 3   | 0.00           |
| `error-handling/expected-coupon-failure-skips-the-tracker`              | Answers two expected coupon failures without sending them to the error tracker, and still reports the rest.                                                                    | 1.00  | 6 of 6   | 1.00           |
| `error-handling/new-failure-code-comes-from-a-list`                     | Gives a new failure a code from one typed list of codes, and the client branches on the code, not the message.                                                                 | 1.00  | 6 of 6   | 0.00           |
| `error-handling/refund-guard-carries-its-numbers`                       | Puts the order id and two amounts on the error as fields and keeps its message a fixed string.                                                                                 | 1.00  | 6 of 6   | 0.00           |
| `expand-contract-migrations/rename-column-in-one-migration`             | Renames a column as add, write both, backfill, switch reads, and drop in later deploys, not in place.                                                                          | 1.00  | 3 of 3   | 1.00           |
| `feature-rollout/dark-route-without-caller`                             | Guard: accepts a mounted route behind an off flag that no page calls yet.                                                                                                      | 1.00  | 3 of 3   | 1.00           |
| `feature-rollout/flag-defaults-on`                                      | Defaults a new flag to off and reports deployed separately from enabled.                                                                                                       | 1.00  | 3 of 3   | 0.00           |
| `feature-rollout/table-and-service-without-entry-point`                 | Asks for a registered entry point before a table and a service merge.                                                                                                          | 1.00  | 3 of 3   | 0.00           |
| `git-commit-checklist/generated-file-conflict-on-rebase`                | Reruns the generator on a conflicted generated API client and gives no hand-merged block to paste.                                                                             | 1.00  | 3 of 3   | 1.00           |
| `git-commit-checklist/lockfile-conflict-on-rebase`                      | Lets pnpm merge a conflicted lockfile, takes neither side, and keeps the pre-push hook.                                                                                        | 0.83  | 2 of 3   | 0.00           |
| `git-commit-checklist/stages-only-task-files`                           | Stages the files of the fix by name and leaves unrelated and generated changes out.                                                                                            | 1.00  | 3 of 3   | 0.33           |
| `github-actions-authoring/independent-jobs-are-not-chained`             | Asked to chain four independent jobs in series to save runner minutes, keeps the jobs that do not depend on each other in parallel.                                            | 1.00  | 3 of 3   | 0.00           |
| `github-actions-authoring/main-runs-are-not-cancelled`                  | Asked to make pushes to main cancel the older run, cancels superseded runs on pull requests only and lets a run in progress on main finish.                                    | 1.00  | 3 of 3   | 0.00           |
| `github-actions-authoring/no-actions-write-with-checked-out-code`       | Keeps `actions: write` out of any job that runs checked-out code.                                                                                                              | 1.00  | 3 of 3   | 1.00           |
| `github-actions-authoring/publish-gated-on-ci`                          | Gates a publish on CI with `needs` or `workflow_run`, not a status lookup.                                                                                                     | 1.00  | 3 of 3   | 0.00           |
| `github-actions-authoring/rejects-polling`                              | Replaces a sleep-and-poll loop with an event trigger.                                                                                                                          | 1.00  | 3 of 3   | 0.50           |
| `github-actions-authoring/required-check-is-a-real-job`                 | Builds a combined required check as a fan-in job, not a posted commit status.                                                                                                  | 1.00  | 3 of 3   | 0.00           |
| `github-actions-authoring/short-shards-are-merged`                      | Merges one-minute test shards when asked to double them, because most of each shard is setup and queue wait.                                                                   | 0.67  | 1 of 3   | 0.00           |
| `github-actions-authoring/uploads-are-not-one-job-each`                 | Asked for a matrix with one job per package to upload 40 small coverage files, uploads them from one job or a few.                                                             | 1.00  | 3 of 3   | 0.00           |
| `github-actions-authoring/working-shards-stay-parallel`                 | Asked to fold 24 parallel shards into 4 jobs that each loop over six, keeps one shard to a job and at least 12 shards.                                                         | 0.67  | 2 of 3   | 0.00           |
| `github-ci-operations/backlog-reads-the-log-before-a-rerun`             | With the account at its limit, advises against rerunning a failed job to see whether it is flaky, and reads its log instead.                                                   | 1.00  | 3 of 3   | 0.00           |
| `github-ci-operations/macos-queue-is-not-a-plan-problem`                | Says a move from Free to Team leaves the macOS limit at 5 and cuts the macOS jobs instead. Ceiling case.                                                                       | 1.00  | 3 of 3   | 1.00           |
| `github-ci-operations/queue-under-the-limit-cancels-nothing`            | Asked to cancel older runs on `main` with 11 jobs running on a plan that allows 60, says the account is under its limit and cancels nothing.                                   | 1.00  | 3 of 3   | 0.00           |
| `github-ci-operations/queue-is-read-once-not-watched`                   | Asked for a loop that polls a run until its jobs start, gives one query of the job timestamps and no loop.                                                                     | 1.00  | 3 of 3   | 0.00           |
| `github-ci-operations/slow-step-comes-from-step-times-not-the-log`      | Asked for a command that prints a whole run's log to find a slow step, gives a query of step times and no log dump.                                                            | 1.00  | 6 of 6   | 0.00           |
| `github-issue/search-before-filing`                                     | Searches for a duplicate before filing, writes a self-contained body, and invents no label.                                                                                    | 0.83  | 2 of 3   | 0.00           |
| `github-issue/stale-notes-before-filing`                                | Checks that a months-old note still holds on the default branch before filing it.                                                                                              | 1.00  | 3 of 3   | 0.33           |
| `github-issue/unverified-finding-is-an-investigation`                   | Asked to file a follow-up from a review note about a possible race nobody has checked, files an investigation with the unknowns listed and any fix conditional on the finding. | 1.00  | 3 of 3   | 0.00           |
| `github-repository-settings/collaborators-only-prs`                     | Limits pull requests to collaborators and requires approval for every outside contributor's runs.                                                                              | 1.00  | 3 of 3   | 0.67           |
| `github-repository-settings/opentofu-provider-gap`                      | Says the OpenTofu provider has no attribute for two settings and gives the REST calls.                                                                                         | 1.00  | 3 of 3   | 0.00           |
| `glide-mq/failed-jobs-need-recovery-path`                               | Adds a recovery path for permanently failed jobs beyond the dead-letter queue.                                                                                                 | 1.00  | 3 of 3   | 1.00           |
| `glide-mq/never-enqueue-and-wait`                                       | Returns 202 with a job id instead of waiting on the job inside the request.                                                                                                    | 1.00  | 3 of 3   | 0.00           |
| `glide-mq/outbox-own-queue`                                             | Puts an outbox relay and a ledger write on a queue of their own, not a lane on the shared queue.                                                                               | 1.00  | 3 of 3   | 0.33           |
| `glide-mq/review-retry-from-failed-jobs`                                | Asks a repair job to read database rows, not the queue's failed jobs, and for failed jobs not to be kept forever.                                                              | 1.00  | 3 of 3   | 0.33           |
| `glide-mq/review-webhook-lane`                                          | Gives a floodable webhook job family its own lane.                                                                                                                             | 1.00  | 3 of 3   | 0.00           |
| `http-api-design/action-body-and-raw-tokens`                            | Uses resource paths, the public id, and hashed tokens.                                                                                                                         | 1.00  | 3 of 3   | 0.67           |
| `http-api-design/edge-claims-do-not-authorize`                          | Uses an edge-verified claim for cache bypass only, and lets the origin authorize.                                                                                              | 1.00  | 3 of 3   | 0.00           |
| `http-api-design/invite-handler-resolves-before-it-validates`           | Orders a new handler: authenticate, resolve the project in the URL, validate the body, then act.                                                                               | 1.00  | 6 of 6   | 0.00           |
| `http-api-design/uuid-slug-routes`                                      | Makes the slug the canonical route and permanently redirects old UUID links to it.                                                                                             | 1.00  | 3 of 3   | 0.00           |
| `lint-rule-authoring/untraceable-name-is-reported`                      | Asked to write a lint rule that finds its subject by an import, tests an indirect form and reports a name it cannot trace instead of passing silently.                         | 1.00  | 6 of 6   | 0.00           |
| `list-reads/capped-walk-keeps-paging`                                   | Caps an inbox read at 500 rows looked at and still tells the client to keep paging when the cap stops it short.                                                                | 1.00  | 6 of 6   | 1.00           |
| `list-reads/fixed-top-three-is-not-a-page`                              | Guard: returns a banner's three latest sign-ins with one fixed-limit query and no cursor or next-page flag; has no skill-fired grader.                                         | 1.00  | 6 of 6   | 1.00           |
| `list-reads/review-feed-candidate-pool`                                 | Asks for one walk over posts with the mute filter in the query, not a capped pool filtered afterward.                                                                          | 0.96  | 11 of 12 | 0.33           |
| `list-reads/slow-inbox-bounds-the-scan`                                 | Fixes a slow inbox read by bounding the rows one request scans, and keeps the client paging from where the scan stopped.                                                       | 1.00  | 6 of 6   | 0.33           |
| `llm-calls/new-tool-clamps-through-one-helper`                          | Bounds a new tool's limit and day range, which the model supplies, through one shared helper.                                                                                  | 0.92  | 5 of 6   | 0.33           |
| `llm-calls/summarize-fetched-page`                                      | Passes a fetched page to the model as delimited data, outside the system prompt, with an instruction not to follow it.                                                         | 1.00  | 3 of 3   | 1.00           |
| `llm-calls/ticket-classifier-takes-its-model`                           | Takes the model for a new classifier from configuration or an argument, with no model id or fallback in the code.                                                              | 1.00  | 6 of 6   | 0.00           |
| `native-app-architecture/core-tests-and-web-view`                       | Runs portable core tests once and asks for a written blocker before a web view.                                                                                                | 1.00  | 3 of 3   | 0.00           |
| `native-app-architecture/generated-project-file`                        | Commits the project specification and ignores the generated Xcode project.                                                                                                     | 1.00  | 3 of 3   | 0.00           |
| `native-app-architecture/inbox-ends-on-the-flag`                        | Ends a SwiftUI list and shows its empty state from the API's next-page flag, with the paging state outside the view.                                                           | 0.92  | 5 of 6   | 0.00           |
| `npm-publishing/bootstrap-new-package`                                  | Prepares a first publish for a person to run, and never publishes itself.                                                                                                      | 0.94  | 2 of 3   | 0.40           |
| `npm-publishing/existing-package-trust-only`                            | Sets up trusted publishing for an existing package without publishing or changing trust.                                                                                       | 1.00  | 3 of 3   | 0.73           |
| `package-json-checklist/pinned-transitive-version-replaces-the-package` | Asked for an override to force a transitive dependency's version, declines and says to replace or fork the package that pins it.                                               | 1.00  | 6 of 6   | 0.00           |
| `package-json-checklist/review-override-for-peer-warning`               | Accepts React 19 for one package with `peerDependencyRules`, not an override.                                                                                                  | 1.00  | 3 of 3   | 0.67           |
| `package-json-checklist/workspace-dependency-and-export`                | Adds dependencies with pnpm in the right fields and keeps the root export.                                                                                                     | 0.89  | 3 of 3   | 0.67           |
| `planning/blast-radius-tests-and-flows`                                 | Names the affected unit tests, the browser spec, and the user-visible surfaces, not only code callers.                                                                         | 1.00  | 3 of 3   | 1.00           |
| `planning/mechanical-change-skips-plan`                                 | Guard: does a mechanical rename and verifies it, without a plan document; has no skill-fired grader.                                                                           | 1.00  | 3 of 3   | 0.67           |
| `planning/plan-handoff-self-contained`                                  | Writes a plan that stands alone, with decisions and reasons, steps, non-goals, and stop conditions.                                                                            | 0.83  | 2 of 3   | 0.00           |
| `planning/plan-pulls-in-postgres-skill`                                 | Loads a PostgreSQL skill and carries lock and backfill safety into the steps.                                                                                                  | 1.00  | 3 of 3   | 1.00           |
| `planning/plan-saved-outside-repo`                                      | Saves a plan in an issue or pull request, not a committed file, and weighs an alternative.                                                                                     | 1.00  | 6 of 6   | 0.00           |
| `planning/plan-states-before-after`                                     | States in plain language what users see before and after the change.                                                                                                           | 0.62  | 5 of 8   | 0.00           |
| `planning/plan-verification-commands`                                   | Gives each step a verification command and selects the final tests from the change.                                                                                            | 1.00  | 3 of 3   | 0.00           |
| `playwright-authoring/metadata-is-not-a-browser-test`                   | Checks redirects and metadata over plain HTTP and locates a button by role.                                                                                                    | 1.00  | 3 of 3   | 0.00           |
| `playwright-authoring/review-computed-test-ids`                         | Asks for literal test ids and `getByTestId` with a row filter, not computed ids.                                                                                               | 1.00  | 3 of 3   | 0.00           |
| `postgres-locking/checkout-exact-stock`                                 | Guard: checkout keeps stock exact without an unbounded lock, and enqueues after commit.                                                                                        | 1.00  | 3 of 3   | 1.00           |
| `postgres-locking/exact-cap-no-lock`                                    | Enforces a cap as best effort, with no lock, counter, or claim table.                                                                                                          | 1.00  | 3 of 3   | 0.00           |
| `postgres-locking/prelock-before-conditional-update`                    | Asks for the `SELECT ... FOR UPDATE` before an already conditional `UPDATE` to be deleted.                                                                                     | 1.00  | 3 of 3   | 0.00           |
| `postgres-locking/race-finding-on-unwritten-row`                        | Answers a review bot's race finding with a guard inside the insert, not a lock on a row it does not write.                                                                     | 1.00  | 3 of 3   | 0.00           |
| `postgres-locking/review-advisory-lock-key`                             | Guard: checks the key of an advisory lock the author justified, and does not reject it on principle.                                                                           | 0.67  | 1 of 3   | 1.00           |
| `postgres-locking/review-last-admin-advisory-lock`                      | Asks for an advisory lock around a last-admin guard to be deleted, leaving it best effort.                                                                                     | 1.00  | 3 of 3   | 0.00           |
| `postgres-locking/review-race-test-that-waits-on-a-lock`                | Guard: accepts a race test that holds a row lock and waits for blocked writers, because it asserts the final balance; has no skill-fired grader.                               | 1.00  | 6 of 6   | 1.00           |
| `postgres-locking/rollup-trigger-deadlocks`                             | Replaces a trigger-kept daily rollup that deadlocks with closed days computed once, not ordered or advisory locks.                                                             | 1.00  | 3 of 3   | 0.00           |
| `postgres-node-performance-tuning/dedupe-keeps-statement-names-literal` | Removes duplication between three lookups by sharing the column list, and keeps each statement's name literal in its SQL.                                                      | 0.67  | 2 of 6   | 0.00           |
| `postgres-node-performance-tuning/index-change-rechecks-neighbors`      | Rechecks every query that depends on a changed index, found through the query builders.                                                                                        | 0.86  | 17 of 21 | 0.00           |
| `postgres-node-performance-tuning/new-query-named-and-indexed`          | Ships a new query with explicit columns, a bound, an operation-name comment, and its index.                                                                                    | 1.00  | 3 of 3   | 0.00           |
| `postgres-partitioning-uuid-v7/range-not-hash`                          | Partitions by `RANGE` on the id with a default partition, not `HASH`.                                                                                                          | 1.00  | 3 of 3   | 0.67           |
| `postgres-partitioning-uuid-v7/retention-with-survivors`                | Keeps a bounded delete sweep when old rows must survive, and states the reason in a table comment.                                                                             | 1.00  | 3 of 3   | 0.00           |
| `postgres-schema-design/customer-code-key`                              | References a generated id from other tables, not the customer's text code. Ceiling case.                                                                                       | 1.00  | 3 of 3   | 1.00           |
| `postgres-schema-design/membership-table-is-commented`                  | Comments a new table and every one of its columns in the database. Ceiling case.                                                                                               | 1.00  | 3 of 3   | 1.00           |
| `postgres-schema-design/membership-table-names-its-constraints`         | Names every constraint on a new table, its primary key included, with the `pk_`, `fk_`, `uq_`, and `ck_` prefixes.                                                             | 1.00  | 3 of 3   | 0.00           |
| `postgres-schema-design/per-run-cursor-rows-are-removed`                | Gives a table of one saved position per run a way to remove finished runs' rows: delete on completion, or drop old rows.                                                       | 1.00  | 3 of 3   | 0.33           |
| `postgres-schema-design/uuidv7-no-created-at-default`                   | Adds no `created_at DEFAULT now()` beside a UUIDv7 key.                                                                                                                        | 1.00  | 3 of 3   | 0.67           |
| `pr-description/behavior-change-shows-a-real-run`                       | Shows one real run of a changed command from a user's point of view, on the realistic scenario, not only a minimal fixture or a summary table.                                 | 1.00  | 3 of 3   | 0.33           |
| `pr-description/ci-gap-section`                                         | Adds a short section on what CI caught that the local check missed, without work history.                                                                                      | 1.00  | 3 of 3   | 0.00           |
| `pr-description/perf-change-with-flag`                                  | Shows a before/after table, states what a flag does not cover, and omits routine checks.                                                                                       | 1.00  | 3 of 3   | 0.00           |
| `pull-requests/review-round-dispositions`                               | Gives each review comment one disposition and settles the round with a single push.                                                                                            | 1.00  | 3 of 3   | 0.00           |
| `react-app-structure/abort-superseded-search`                           | Aborts a superseded search request with an `AbortController`.                                                                                                                  | 1.00  | 3 of 3   | 1.00           |
| `react-app-structure/client-needs-current-user`                         | Reads the signed-in user in the client from auth context, not a prop passed from the server page.                                                                              | 1.00  | 3 of 3   | 0.00           |
| `react-app-structure/load-more-follows-the-flag`                        | Pages a list while the API reports a next page, and shows the empty state only when no further page can be requested.                                                          | 0.83  | 5 of 6   | 0.17           |
| `react-app-structure/review-profile-card`                               | Objects to a user-supplied image rendered directly, a computed fetch URL, and a hand-built link.                                                                               | 1.00  | 3 of 3   | 0.67           |
| `resuming-work/note-says-about-to-push`                                 | Sees that the branch is already pushed and the pull request open, and goes to the failing check instead of repeating the step.                                                 | 0.83  | 2 of 3   | 1.00           |
| `review-ci-logs/first-error-in-a-long-log`                              | Asked why a job failed, with a long log pasted, names the first failure the repository owns and not the errors that follow from it. Ceiling case, kept for loading.            | 0.83  | 2 of 3   | 1.00           |
| `review-ci-logs/quiet-log-keeps-errors`                                 | Quiets a noisy log at its source and keeps stderr and failing exits.                                                                                                           | 1.00  | 3 of 3   | 1.00           |
| `review-ci-logs/retry-request-gets-the-cause-fixed`                     | Asked to wrap a migration that sometimes fails with connection refused in a retry, adds a database health check and no retry.                                                  | 1.00  | 3 of 3   | 0.00           |
| `revisit-followups/only-verified-deferred-work`                         | Keeps only explicit deferred work and has it verified before any issue is filed.                                                                                               | 0.83  | 2 of 3   | 0.00           |
| `rust-authoring/tests-in-separate-file`                                 | Puts unit tests for a private function in a separate file.                                                                                                                     | 1.00  | 3 of 3   | 0.00           |
| `service-boundaries/partner-webhook`                                    | Maps a partner payload once, keeps the raw body, and tests with captured payloads.                                                                                             | 1.00  | 3 of 3   | 1.00           |
| `service-boundaries/topology-in-app-repo`                               | Moves instance counts and regions out of the application repo into configuration.                                                                                              | 1.00  | 3 of 3   | 0.33           |
| `skill-authoring/repo-rule-not-in-shared-skill`                         | Keeps one team's package, field, and path out of a shared skill and puts them in that team's repository.                                                                       | 1.00  | 3 of 3   | 0.00           |
| `skill-authoring/split-by-trigger`                                      | Gives browser-test guidance its own skill, or an existing one, instead of a reference under the unit-test skill.                                                               | 0.83  | 2 of 3   | 0.00           |
| `static-analysis-checklist/parses-yaml-with-fixtures`                   | Parses YAML instead of matching text, and tests the check with fixtures.                                                                                                       | 1.00  | 3 of 3   | 0.50           |
| `static-analysis-checklist/tracked-files-only`                          | Limits a CI guard's file discovery to tracked workflow and action files.                                                                                                       | 1.00  | 3 of 3   | 0.33           |
| `static-code-analysis/new-rust-service`                                 | Picks the static checks for a new Rust service.                                                                                                                                | 1.00  | 6 of 6   | 0.83           |
| `static-code-analysis/new-typescript-library`                           | Picks the static checks for a new TypeScript library.                                                                                                                          | 1.00  | 6 of 6   | 0.00           |
| `structured-logging/log-identifier-not-lookup`                          | Logs the customer id with a static message instead of looking up an email for the log.                                                                                         | 1.00  | 3 of 3   | 0.00           |
| `structured-logging/request-body-is-not-logged`                         | Asked to log a webhook's whole request body on failure, logs safe fields and not the body, token, email, or name.                                                              | 1.00  | 6 of 6   | 0.00           |
| `structured-logging/review-lookup-in-catch`                             | Logs the customer id with a static message instead of looking up the name in a catch.                                                                                          | 1.00  | 3 of 3   | 0.00           |
| `technical-writing/incident-writeup-from-notes`                         | Opens with a summary, separates support from engineering, flags unchecked claims, ends with the queries.                                                                       | 1.00  | 3 of 3   | 0.00           |
| `technical-writing/proposal-for-two-audiences`                          | Labels sections by audience, tables every flag and plan combination and the before and after, defines jargon.                                                                  | 0.67  | 1 of 3   | 0.00           |
| `technical-writing/review-runbook-wall-of-text`                         | Asks for the action first, steps as a list, jargon defined, and changing numbers replaced by how to fetch them.                                                                | 1.00  | 3 of 3   | 0.00           |
| `test-authoring/dotnet-private-field-not-reflected`                     | Proves a private dictionary was emptied through the public method, without reflection.                                                                                         | 0.71  | 5 of 12  | 0.33           |
| `test-authoring/fake-routes-by-request`                                 | Has a fake HTTP client answer by request path, not by a queue of replies in call order.                                                                                        | 1.00  | 3 of 3   | 1.00           |
| `test-authoring/fixture-files-not-inline`                               | Reads saved fixture files instead of writing them in the test body.                                                                                                            | 1.00  | 3 of 3   | 0.00           |
| `test-authoring/review-direct-row-inserts`                              | Asks for an ordinary user to come from the factory, and accepts a direct insert for legacy data.                                                                               | 0.96  | 11 of 12 | 0.67           |
| `test-authoring/review-flake-fix-is-tradeoff`                           | Calls a retry, a raised timeout, and a sequential suite a trade-off, and says a change to production code is not test-only.                                                    | 0.96  | 11 of 12 | 1.00           |
| `test-authoring/review-helper-holds-assertions`                         | Flags an expected value recomputed with the production formula and assertions kept in a helper.                                                                                | 1.00  | 3 of 3   | 0.00           |
| `triage-codex-security/approval-wave-cap`                               | Treats approval given before a wave was shown as not approving that wave.                                                                                                      | 1.00  | 3 of 3   | 0.50           |
| `triage-codex-security/repository-mismatch`                             | Stops when the findings belong to a different repository.                                                                                                                      | 1.00  | 3 of 3   | 0.78           |
| `typescript-authoring/batch-first-wrapper`                              | Syncs a list with one call per I/O step and makes the single-item function a wrapper of that call.                                                                             | 1.00  | 3 of 3   | 0.00           |
| `typescript-authoring/rename-without-alias`                             | Updates every caller instead of keeping an alias, and adds the missing `await`.                                                                                                | 1.00  | 3 of 3   | 0.00           |
| `typescript-authoring/unlink-batched-cache-delete`                      | Deletes cache keys with one `UNLINK` call, not `DEL` per key.                                                                                                                  | 1.00  | 3 of 3   | n/a            |
| `verification/stale-result-after-later-edit`                            | Says a test result from before a later edit is stale and re-runs before agreeing to merge.                                                                                     | 0.50  | 0 of 12  | 1.00           |

## Where each row comes from

The rows are not from one run. [HISTORY.md](HISTORY.md) has the run for each.

- **`github-ci-operations/slow-step-comes-from-step-times-not-the-log`** takes its plugin score
  and loading from a plugin-only run of six attempts on 2026-11-23, on the current skill, and its
  "Without plugin" value from a two-arm run of three attempts earlier that day. The skill's other
  four rows take their plugin score and loading from a plugin-only run of three attempts on the
  current skill the same day, and keep their "Without plugin" values from earlier runs that day.
- **`structured-logging/request-body-is-not-logged`** takes its plugin score and loading from a
  plugin-only run of six attempts on 2026-11-23, on the current description, and its "Without
  plugin" value from a two-arm run of three attempts earlier that day. The skill's other two rows
  are from before the description changed; a plugin-only run of three attempts on the current
  description gave each 3 of 3, loaded 3 of 3.
- **`package-json-checklist/pinned-transitive-version-replaces-the-package`** is from one two-arm
  run of six attempts on 2026-11-23. The other two `package-json-checklist` rows take their plugin
  score and loading from a plugin-only run of three attempts the same day, after the skill's
  description and override rule changed; their "Without plugin" values are from earlier two-arm
  runs. Rule 8 was reworded after both runs, not re-measured.
- **Run:** the full run on 2026-11-21, with the plugin only, three attempts per case (78 cases,
  234 attempts, $35.50). It ran on the working tree committed as `9f4aaf5`, before the
  `http-api-design` description named edge workers. Four of its cases were dropped afterwards.
- **Other rows** are from later two-arm runs, three attempts per arm: the edge-claims
  and topology rows after the `http-api-design` change, and five new cases after their graders
  were narrowed in review. The `postgres-locking` rows and
  `postgres-schema-design/customer-code-key` (an earlier run; its row is now from 2026-11-24) are from the two-arm run on 2026-11-22 after the
  locking rules moved into their own skill, three attempts per arm. The `postgres-locking` "Score"
  and "Passed" columns are from a plugin-only rerun the same day, after review wording changes.
- **The `agent-workflow` and `pull-requests` rows** are from the two-arm run on 2026-11-22 after
  review answering moved to `pull-requests`, three attempts per arm.
- **`react-app-structure/load-more-follows-the-flag`** is from two two-arm runs of three attempts
  per arm on 2026-11-22, six attempts per arm, after its `empty-state` grader was tightened. The
  skill loaded in 5 of 6 attempts with the plugin, and each of those passed; the one that did
  not load it failed. The other `react-app-structure` rows, and the `list-reads` and
  `native-app-architecture` rows, predate the pagination rules added that day and were not
  re-measured.
- **The `github-actions-authoring`, `glide-mq`, `http-api-design`, `react-app-structure`, and
  `service-boundaries` rows** are from the two-arm run after their generic rules were added, three
  attempts per arm.
- **The `lint-rule-authoring` row** is from one two-arm run of six attempts per arm on 2026-11-24,
  on the current skill text; the skill loaded 6 of 6. **The two `static-analysis-checklist` rows**
  take their plugin score from a plugin-only run of three attempts the same day, after that
  skill's description stopped naming the writing of a lint rule; the skill loaded 3 of 3 in each.
  Their "Without plugin" is from earlier two-arm runs. These two rows were not measured against
  the earlier description in the same session, so they show that the skill still loads and passes,
  not a gain from the description change; `tracked-files-only` stood at 4 of 8 on 2026-11-22.
- **The two `evals` rows** predate the equal-score rule added to its Review section on
  2026-11-22 and were not re-measured; neither case asks about an equal score.
- **The two `git-commit-checklist` conflict rows** are from two-arm runs on 2026-11-22 after the
  lockfile rule was widened to every generated file, three attempts per arm.
  `generated-file-conflict-on-rebase` is a ceiling case: it shows the skill loads for a
  generated file that is not a lockfile, 3 of 3, and not that the rule helps.
- **The `test-authoring` rows** are from plugin-only runs on 2026-11-22 on the description that
  names changes to test retries, timeouts, or skips: twelve attempts for
  `review-flake-fix-is-tradeoff`, `review-direct-row-inserts`, and
  `dotnet-private-field-not-reflected`, three for the others. In those three rows every attempt
  gave a passing answer; "Passed" counts the attempts that also loaded the skill. Each "Without
  plugin" value is from an earlier two-arm run. `review-flake-fix-is-tradeoff` is a ceiling case
  on the answer and is kept as the loading check.
- **The `agent-rules` and `skill-authoring` rows** are from the two-arm run after the split, three
  attempts per arm. Two `documentation` rows are from a plugin-only run after its
  description stopped naming `AGENTS.md`.
- **The `planning` rows** are from the two-arm run after the levels, handoff, and verification
  changes, three attempts per arm. `plan-handoff-self-contained` is from a later run of that one
  case, after the skill said to state decisions as facts. `blast-radius-tests-and-flows` and
  `plan-pulls-in-postgres-skill` are ceiling cases: they show the skill loads and does no harm,
  not that it helps.
- **`postgres-schema-design/membership-table-names-its-constraints`** had an earlier run: the
  second two-arm run of six attempts on 2026-11-23, after its grader was narrowed to the naming
  rule and its pattern, where it passed 6 of 6 with the skill loaded in 6 of 6. Its row is now
  from the 2026-11-24 run.
- **`postgres-schema-design/membership-table-is-commented`** had an earlier run: a two-arm run of
  six attempts on 2026-11-23, where it passed 6 of 6 with the skill loaded in 6 of 6 against 1 of
  6 without. Its row is now from the 2026-11-24 run.
- **`http-api-design/invite-handler-resolves-before-it-validates`** is from a two-arm run of six
  attempts on 2026-11-23. The skill loaded in 6 of 6. Its grader dropped a status check after
  the run and the row was not re-measured.
- **`native-app-architecture/inbox-ends-on-the-flag`** is from a two-arm run of six attempts on
  2026-11-23. The skill loaded in 6 of 6. Its grader gained one FAIL line after the run and the
  row was not re-measured.
- **`llm-calls/new-tool-clamps-through-one-helper`** is from a two-arm run of six attempts on
  2026-11-23. The skill loaded in 6 of 6.
- **`llm-calls/ticket-classifier-takes-its-model`** is from a two-arm run of six attempts on
  2026-11-23.
- **The `llm-calls` row** is from the two-arm run on 2026-11-22 that added the skill, three
  attempts per arm. It is a ceiling case; the skill loaded in 3 of 3.
- **The four `dependabot` rows** are from the two-arm run on 2026-11-22 after the skill gained
  its rule for repairing a Dependabot pull request and its description named that work, three
  attempts per arm. `repair-pr-with-pushed-fix` is a ceiling case: it shows the skill loads for
  a repair request, 3 of 3, and not that the rule helps.
- **The `expand-contract-migrations` and `resuming-work` rows** are from the two-arm run on
  2026-11-22 that added the skills, three attempts per arm. Both are ceiling cases, and each
  loaded its skill in 3 of 3.
- **`error-handling`**: the first two rows are from one two-arm run of six attempts on
  2026-11-23, and `refund-guard-carries-its-numbers` is from a later two-arm run of six that day.
  `expected-coupon-failure-skips-the-tracker` is a ceiling case, kept as a check that the skill
  loads (6 of 6).
- **`postgres-node-performance-tuning/dedupe-keeps-statement-names-literal`** is from a two-arm
  run of six attempts on 2026-11-23. All six answers with the plugin pass; the score is lower
  because the skill loaded in 2 of them.
- **`postgres-locking/review-race-test-that-waits-on-a-lock`** is from a two-arm run of six
  attempts on 2026-11-23. It is a guard beside `review-last-admin-advisory-lock`.
- **`list-reads/fixed-top-three-is-not-a-page`** is from a two-arm run of six attempts on
  2026-11-23. It is a guard beside `slow-inbox-bounds-the-scan`.
- **`list-reads/slow-inbox-bounds-the-scan`** is from a two-arm run of six attempts on
  2026-11-23, the second of two with the same result.
- **`list-reads/capped-walk-keeps-paging`** is from a two-arm run of six attempts on 2026-11-23.
  It is a ceiling case: the model passes it without the plugin. It is kept as the check that
  the skill loads for a request to write a list read, which it did in 6 of 6.
- **`debugging/crash-fixed-at-cause-with-a-test`** is from a plugin-only run of three attempts on
  2026-11-22; the answer passed in all three and the skill loaded in two. Its "Without plugin"
  value is from a two-arm run the same day, in which the case listed Edit and Write and the
  runner granted them; the plugin-only run listed Bash only. It is a ceiling case: the model passes it without
  the plugin. It is kept as the skill's loading check, because the skill loaded in 14 of 15
  attempts across its runs.
- **The three `pr-description` rows** take their plugin score and loading from one plugin-only run
  of three attempts on 2026-11-24, on the current skill text. The "Without plugin" value of
  `behavior-change-shows-a-real-run` is from a two-arm run of three attempts the same day on the
  same text and case; those of the other two rows are from earlier two-arm runs.
- **The three `github-issue` rows** take their plugin score and loading from one plugin-only run
  of three attempts on 2026-11-24, on the current skill text and grader, the second run of the
  entry "lets an investigation issue carry a conditional fix". The "Without plugin" value of
  `unverified-finding-is-an-investigation` is from a two-arm run of three attempts the same day on
  the same text, case, and grader; those of the other two rows are from earlier two-arm runs.
- **`agent-rules/stated-rule-keeps-its-words`** takes its plugin score from a plugin-only run of
  all three `agent-rules` cases on 2026-11-24, three attempts, loading 3 of 3, and "Without
  plugin" from a two-arm run of three attempts the same day on the same text. The other two
  `agent-rules` cases passed and loaded 3 of 3 in that plugin-only run, as in their rows.
- **The five `postgres-schema-design` rows** are from one two-arm run of three attempts per arm on
  2026-11-24, after the cursor section of its table-shapes reference gained the retention
  sentence. The skill loaded 15 of 15. Other notes that name these rows describe earlier runs;
  before this run they stood at: `customer-code-key` 3 of 3 with, 1.00 without;
  `membership-table-is-commented` 6 of 6 with, 0.17 without;
  `membership-table-names-its-constraints` 6 of 6 with, 0.00 without;
  `uuidv7-no-created-at-default` 3 of 3 with, 0.00 without. `per-run-cursor-rows-are-removed` was
  rerun the same day after the sentence was scoped to per-run cursors, with the same result; the
  other four rows were not rerun on that wording.
- **The `static-code-analysis` rows** are from plugin-only runs of six attempts on 2026-11-22,
  after its per-language tables moved to references. Each "Without plugin" value is from an
  earlier two-arm run.
- **The nine `github-actions-authoring` rows** take their plugin score and loading from one
  plugin-only run of three attempts of all nine cases on 2026-11-24, on the current skill text. In
  it every answer that loaded the skill passed its outcome grader; `short-shards-are-merged`
  loaded the skill 1 of 3 and passed 3 of 3, and the one `working-shards-stay-parallel` answer
  that did not load it failed. Each "Without plugin" value is from an earlier two-arm run of that
  case: of three attempts on 2026-11-24 for `independent-jobs-are-not-chained` and
  `uploads-are-not-one-job-each`, before the skill changed; of three attempts on 2026-11-23 for
  `main-runs-are-not-cancelled` and, under an earlier grader, `working-shards-stay-parallel`; of
  six attempts on 2026-11-23 for `short-shards-are-merged`. Earlier runs with more attempts are in
  HISTORY and are on earlier text: `main-runs-are-not-cancelled` 3 of 6 and 5 of 6,
  `working-shards-stay-parallel` 6 of 6. The two new cases each had a plugin-only run of six
  attempts on an intermediate text, with one of the two edits or before the description changed,
  not on the committed text; each gave 5 of 6, loaded 5 of 6. The grader of
  `independent-jobs-are-not-chained` was tightened after the run, not re-measured.
- **`github-ci-operations/backlog-reads-the-log-before-a-rerun`** is from a two-arm run of
  three attempts on 2026-11-23; its grader gained a line after the run, not re-measured.
  **`github-ci-operations/queue-under-the-limit-cancels-nothing`** is from a two-arm run of
  three attempts on 2026-11-23, on the merged skill; its grader was tightened after the run,
  not re-measured.
  **`github-ci-operations/macos-queue-is-not-a-plan-problem`** is from a two-arm run of three
  attempts the same day; the skill's backlog steps moved to a reference and its measuring and
  backlog rules were edited after it, not re-measured.
- **The `debugging`, `verification`, and `agent-coordination` rows** are from plugin-only runs of
  twelve attempts on 2026-11-22. All three are ceiling cases: every answer passed, with and
  without the plugin, and the rows are below 1.00 only because "Passed" counts the attempts that
  also loaded the skill. Each "Without plugin" value is from the two-arm run that added the
  skill.
- **`postgres-node-performance-tuning/index-change-rechecks-neighbors`** is from two plugin-only
  runs on 2026-11-22, 21 attempts. The skill loaded in 19; two attempts that loaded it failed the
  answer. Its "Without plugin" value is from an earlier two-arm run.
- **The three `review-ci-logs` rows** take their plugin score and loading from one plugin-only run
  of three attempts on 2026-11-24, on the description that names a request to say why a job
  failed. The skill loaded in 2 of 3 attempts of `first-error-in-a-long-log` and 3 of 3 of the
  other two. "Without plugin" for `first-error-in-a-long-log` is from a two-arm run of six
  attempts the same day on the earlier description; it is a ceiling case kept for loading, which
  went from 0 of 6 to 4 of 6 in that session. "Without plugin" for the other two is from earlier
  two-arm runs.
- **`list-reads/review-feed-candidate-pool`** is from a plugin-only run of twelve attempts on
  2026-11-22, on the description that opens "Use whenever a task writes or reviews a query".
  The skill loaded in 11 of 12, and all twelve answers passed. "Without plugin" is 3 of 9, from
  an earlier two-arm run and a three-attempt pilot.
- **`planning/plan-saved-outside-repo`** is from a two-arm run of six attempts per arm on
  2026-11-22, after its grader was narrowed to where the plan is saved.
- **`planning/plan-states-before-after`** takes "Score" and "Passed" from a plugin-only run of
  eight attempts on 2026-11-22, after its description changed. On `main` in the same session it
  passed 1 of 8. "Without plugin" is from the earlier two-arm run.
- **The six `bounded-iteration` rows** are from one two-arm run of three attempts per arm on
  2026-11-24, after the rule on runs that must not overlap became its own numbered rule and said
  how to tell a starter from a run's job. The skill loaded in 14 of 18 attempts.
  `review-sweep-rewrites-its-trigger` did not load it in any of its three, so its row reads 0 of 3
  with the plugin against 3 of 3 without; all three plugin answers passed the outcome grader, and
  its description did not change. The "Without plugin" column has no loading grader, so the two
  columns of that row are not graded on the same set. The purge case's one failure also had not
  loaded the skill. Earlier the same day these rows stood at 3 of 3 for five cases and 2 of 3 for
  `review-sweep-rewrites-its-trigger`; before that day, the purge case at 5 of 6 and the three
  review cases at 8 of 8, 8 of 8, and 4 of 8.
- **The skill loaded in 224 of the 234 attempts.** The misses were in four cases:
  `documentation/write-scale-numbers` (0 of 3, then 2 of 3 on a rerun), the edge-claims case (0
  of 3, before its description named edge workers), `bounded-iteration/review-dispatcher-predicate-and-job-id`
  (1 of 3), and `postgres-schema-design/review-advisory-lock-key` (1 of 3; 2 of 3 after it moved to
  `postgres-locking`). In the rerun,
  `service-boundaries/topology-in-app-repo` loaded it in 1 of 3. In every miss the agent called no
  skill at all; it did not pick a wrong one.
- **Rows below 1.00 for other reasons** failed on the answer: `git-commit-checklist/lockfile-conflict-on-rebase`,
  `github-issue/search-before-filing`, `npm-publishing/bootstrap-new-package`,
  `package-json-checklist/workspace-dependency-and-export`, `revisit-followups/only-verified-deferred-work`,
  and `technical-writing/proposal-for-two-audiences`.
- **The 10 cases added on 2026-11-21** took their "Without plugin" score from a one-attempt pilot,
  except rows from a later two-arm run.
- **`glide-mq/review-retry-from-failed-jobs`, `postgres-schema-design/uuidv7-no-created-at-default`
  (an earlier run; its row is now from 2026-11-24),
  and the "Without plugin" score of `postgres-node-performance-tuning/index-change-rechecks-neighbors`**
  are from the two-arm run on 2026-11-22 after the second round of generic rules, three attempts
  per arm. The other rows of the skills that round changed were not replaced; HISTORY.md has their
  scores from that run.
- **Not measured without the plugin:** the row marked `n/a`.
