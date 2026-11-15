# Evals

**Does an agent that has this plugin follow each skill's guidance on a realistic request?**

Each case gives an agent a request a person would make, such as "review this diff" or "write this
workflow", without naming a skill. Graders then check two things: that the agent loaded the right
skill, and that its answer made the decision the skill asks for.

- Rules for adding and running cases: [AGENTS.md](AGENTS.md)
- Every earlier run and every change to a case or grader: [HISTORY.md](HISTORY.md)

## Current results

Agent Sonnet, judge Opus, with the plugin installed, Claude Code 2.1.325. 43 cases.

- 24 rows are from the last full run on 2026-11-15 (33 cases, 99 attempts, $15.38), where every
  case passed every attempt.
- 19 rows are from later targeted runs, after a case or its skill was added or changed: the
  three replaced cases, `structured-logging`, `playwright-authoring`, `pr-description`, both `dependabot` rows,
  and every row of `test-authoring` and of the six skills added last (`agent-workflow`,
  `git-commit-checklist`, `github-issue`, `planning`, `review-ci-logs`, `revisit-followups`),
  plus `github-actions-authoring/required-check-is-a-real-job`.
- The suite has not been run in full since those six skills were added. The `test-authoring`
  rows were run six times with them present, and the skill loaded less often than before:
  19 of 24 attempts, against 23 of 24 on the commit before. See [HISTORY.md](HISTORY.md).
- Rows below 1.00: the skill did not load on some attempts, or, for `github-issue` and one
  `agent-workflow` attempt, the answer failed.

| Case                                                           | Score | Passed | Without plugin |
| -------------------------------------------------------------- | ----- | ------ | -------------- |
| `agent-workflow/review-round-dispositions`                     | 0.67  | 2 of 3 | 0.00           |
| `bounded-iteration/review-dispatcher-predicate-and-job-id`     | 0.67  | 2 of 3 | 0.33           |
| `dependabot/groups-by-family`                                  | 1.00  | 3 of 3 | 0.33           |
| `dependabot/request-update-check`                              | 1.00  | 3 of 3 | 0.67           |
| `documentation/review-readme-drift`                            | 1.00  | 3 of 3 | 0.00           |
| `evals/document-new-suite`                                     | 1.00  | 3 of 3 | 0.00           |
| `evals/record-partial-rerun`                                   | 1.00  | 3 of 3 | 0.00           |
| `feature-rollout/flag-defaults-on`                             | 1.00  | 3 of 3 | 0.00           |
| `git-commit-checklist/stages-only-task-files`                  | 1.00  | 3 of 3 | 0.33           |
| `github-actions-authoring/publish-gated-on-ci`                 | 1.00  | 3 of 3 | 0.00           |
| `github-actions-authoring/rejects-polling`                     | 1.00  | 3 of 3 | 0.67           |
| `github-actions-authoring/required-check-is-a-real-job`        | 1.00  | 3 of 3 | 0.00           |
| `github-issue/search-before-filing`                            | 0.83  | 2 of 3 | 0.00           |
| `glide-mq/never-enqueue-and-wait`                              | 1.00  | 3 of 3 | 0.00           |
| `glide-mq/review-webhook-lane`                                 | 1.00  | 3 of 3 | 0.33           |
| `http-api-design/action-body-and-raw-tokens`                   | 1.00  | 3 of 3 | 0.33           |
| `native-app-architecture/core-tests-and-web-view`              | 1.00  | 3 of 3 | 0.00           |
| `npm-publishing/bootstrap-new-package`                         | 1.00  | 3 of 3 | 0.40           |
| `npm-publishing/existing-package-trust-only`                   | 1.00  | 3 of 3 | 0.73           |
| `package-json-checklist/workspace-dependency-and-export`       | 1.00  | 3 of 3 | 0.67           |
| `planning/plan-saved-outside-repo`                             | 1.00  | 3 of 3 | 0.00           |
| `playwright-authoring/metadata-is-not-a-browser-test`          | 1.00  | 3 of 3 | 0.00           |
| `postgres-node-performance-tuning/new-query-named-and-indexed` | 1.00  | 3 of 3 | 0.00           |
| `postgres-partitioning-uuid-v7/range-not-hash`                 | 1.00  | 3 of 3 | 0.00           |
| `postgres-schema-design/exact-cap-no-lock`                     | 1.00  | 3 of 3 | 0.00           |
| `postgres-schema-design/review-last-admin-advisory-lock`       | 1.00  | 3 of 3 | 0.00           |
| `pr-description/perf-change-with-flag`                         | 1.00  | 3 of 3 | 0.00           |
| `react-app-structure/review-profile-card`                      | 1.00  | 3 of 3 | 0.33           |
| `review-ci-logs/quiet-log-keeps-errors`                        | 1.00  | 3 of 3 | 1.00           |
| `revisit-followups/only-verified-deferred-work`                | 1.00  | 3 of 3 | 0.00           |
| `rust-authoring/tests-in-separate-file`                        | 1.00  | 3 of 3 | 0.00           |
| `service-boundaries/partner-webhook`                           | 1.00  | 3 of 3 | 0.33           |
| `static-analysis-checklist/parses-yaml-with-fixtures`          | 1.00  | 3 of 3 | 0.50           |
| `static-code-analysis/new-rust-service`                        | 1.00  | 3 of 3 | 0.83           |
| `static-code-analysis/new-typescript-library`                  | 1.00  | 3 of 3 | 0.00           |
| `structured-logging/log-identifier-not-lookup`                 | 1.00  | 3 of 3 | 0.00           |
| `test-authoring/dotnet-private-field-not-reflected`            | 0.83  | 4 of 6 | 0.33           |
| `test-authoring/fake-routes-by-request`                        | 1.00  | 6 of 6 | 0.00           |
| `test-authoring/fixture-files-not-inline`                      | 1.00  | 6 of 6 | 0.00           |
| `test-authoring/review-helper-holds-assertions`                | 0.75  | 3 of 6 | 0.00           |
| `triage-codex-security/approval-wave-cap`                      | 1.00  | 3 of 3 | 0.50           |
| `triage-codex-security/repository-mismatch`                    | 1.00  | 3 of 3 | 0.78           |
| `typescript-authoring/rename-without-alias`                    | 1.00  | 3 of 3 | 0.00           |

"Without plugin" is the case's last measured score with no plugin installed. Those come from
separate, earlier runs with three attempts each; [HISTORY.md](HISTORY.md) has the run for each.

A score is the mean over a case's attempts. An attempt's score is the share of its graders that
passed, so 1.00 means every grader passed on every attempt.

## What each case checks

| Case                                                           | Checks that the agent                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `agent-workflow/review-round-dispositions`                     | Gives each review comment one disposition and settles the round with a single push.               |
| `bounded-iteration/review-dispatcher-predicate-and-job-id`     | Flags a dispatcher predicate no index can serve and a job id keyed only by the entity.            |
| `dependabot/groups-by-family`                                  | Groups updates by package family with a cooldown, not by version type or a catch-all.             |
| `dependabot/request-update-check`                              | Sends the user to the web page that starts a Dependabot run, and invents no API call.             |
| `documentation/review-readme-drift`                            | Flags restated config values, history and plans in a README, and a comment that explains history. |
| `evals/document-new-suite`                                     | Proposes a README, a history log, and an agent rules file for a new eval suite.                   |
| `evals/record-partial-rerun`                                   | Logs a grader change and does not report a one-attempt rerun as an improvement.                   |
| `feature-rollout/flag-defaults-on`                             | Defaults a new flag to off and reports deployed separately from enabled.                          |
| `git-commit-checklist/stages-only-task-files`                  | Stages the files of the fix by name and leaves unrelated and generated changes out.               |
| `github-actions-authoring/publish-gated-on-ci`                 | Gates a publish on CI with `needs` or `workflow_run`, not a status lookup.                        |
| `github-actions-authoring/rejects-polling`                     | Replaces a sleep-and-poll loop with an event trigger.                                             |
| `github-actions-authoring/required-check-is-a-real-job`        | Builds a combined required check as a fan-in job, not a posted commit status.                     |
| `github-issue/search-before-filing`                            | Searches for a duplicate before filing, writes a self-contained body, and invents no label.       |
| `glide-mq/never-enqueue-and-wait`                              | Returns 202 with a job id instead of waiting on the job inside the request.                       |
| `glide-mq/review-webhook-lane`                                 | Gives a floodable webhook job family its own lane.                                                |
| `http-api-design/action-body-and-raw-tokens`                   | Uses resource paths, the public id, and hashed tokens.                                            |
| `native-app-architecture/core-tests-and-web-view`              | Runs portable core tests once and asks for a written blocker before a web view.                   |
| `npm-publishing/bootstrap-new-package`                         | Prepares a first publish for a person to run, and never publishes itself.                         |
| `npm-publishing/existing-package-trust-only`                   | Sets up trusted publishing for an existing package without publishing or changing trust.          |
| `package-json-checklist/workspace-dependency-and-export`       | Adds dependencies with pnpm in the right fields and keeps the root export.                        |
| `planning/plan-saved-outside-repo`                             | Saves a plan in an issue or pull request, not a committed file, and weighs an alternative.        |
| `playwright-authoring/metadata-is-not-a-browser-test`          | Checks redirects and metadata over plain HTTP and locates a button by role.                       |
| `postgres-node-performance-tuning/new-query-named-and-indexed` | Ships a new query with explicit columns, a bound, an operation-name comment, and its index.       |
| `postgres-partitioning-uuid-v7/range-not-hash`                 | Partitions by `RANGE` on the id with a default partition, not `HASH`.                             |
| `postgres-schema-design/exact-cap-no-lock`                     | Enforces a cap as best effort, with no lock, counter, or claim table.                             |
| `postgres-schema-design/review-last-admin-advisory-lock`       | Asks for an advisory lock around a last-admin guard to be deleted, leaving it best effort.        |
| `pr-description/perf-change-with-flag`                         | Shows a before/after table, states what a flag does not cover, and omits routine checks.          |
| `react-app-structure/review-profile-card`                      | Objects to a user-supplied image rendered directly, a computed fetch URL, and a hand-built link.  |
| `review-ci-logs/quiet-log-keeps-errors`                        | Quiets a noisy log at its source and keeps stderr and failing exits.                              |
| `revisit-followups/only-verified-deferred-work`                | Keeps only explicit deferred work and has it verified before any issue is filed.                  |
| `rust-authoring/tests-in-separate-file`                        | Puts unit tests for a private function in a separate file.                                        |
| `service-boundaries/partner-webhook`                           | Maps a partner payload once, keeps the raw body, and tests with captured payloads.                |
| `static-analysis-checklist/parses-yaml-with-fixtures`          | Parses YAML instead of matching text, and tests the check with fixtures.                          |
| `static-code-analysis/new-rust-service`                        | Picks the static checks for a new Rust service.                                                   |
| `static-code-analysis/new-typescript-library`                  | Picks the static checks for a new TypeScript library.                                             |
| `structured-logging/log-identifier-not-lookup`                 | Logs the customer id with a static message instead of looking up an email for the log.            |
| `test-authoring/dotnet-private-field-not-reflected`            | Proves a private dictionary was emptied through the public method, without reflection.            |
| `test-authoring/fake-routes-by-request`                        | Has a fake HTTP client answer by request path, not by a queue of replies in call order.           |
| `test-authoring/fixture-files-not-inline`                      | Reads saved fixture files instead of writing them in the test body.                               |
| `test-authoring/review-helper-holds-assertions`                | Flags an expected value recomputed with the production formula and assertions kept in a helper.   |
| `triage-codex-security/approval-wave-cap`                      | Treats approval given before a wave was shown as not approving that wave.                         |
| `triage-codex-security/repository-mismatch`                    | Stops when the findings belong to a different repository.                                         |
| `typescript-authoring/rename-without-alias`                    | Updates every caller instead of keeping an alias, and adds the missing `await`.                   |

## How to read the numbers

- **Three attempts is a small sample.** One failed attempt moves a case by a third of a grader's
  weight. Treat a single miss as something to re-run, not a finding.
- **The two score columns are not from the same run.** The default run has only the with-plugin
  arm. The no-plugin score was measured once per case, when the case was added or last replaced,
  and scores drift between days. Read the gap as "the model fails this without the skill", not
  as a precise difference. One case, `review-ci-logs/quiet-log-keeps-errors`, scores 1.00
  without the plugin; every other case scores below it.
- **A two-arm run leaves the loaded-the-skill grader out of both scores**, so the arms compare
  on the answer alone. `scripts/eval-summary.py` counts that grader again, so the "Score"
  column means the same thing from either kind of run.
- **The loaded-the-skill grader counts toward the score.** A good answer from an agent that did
  not load the skill scores below 1.00.

## What the suite does not measure

- **Whether the skill fires in a real session.** Each case runs in an empty sandbox with only this
  plugin installed. Other plugins and a real repository compete for the agent's attention.
- **Codex.** Every score is from Claude Code.
- **The effect of the command.** The publishing and triage cases grade the commands the agent
  attempts against synthetic fixtures. Nothing is published and no hosted service is written to.
- **Models other than the two named above.**

## Run it

```bash
pnpm run evals                  # every case
pnpm run evals npm-publishing   # one skill
python3 scripts/eval-summary.py # the table above, from evals/results/latest.json
```

The run needs Claude Code signed in, grants the agent `Bash`, and executes each case's
`fixture.sh` on your machine, so run it only on a checkout you trust. It does not run in CI. Raw
results land in `evals/results/`, which git ignores.
