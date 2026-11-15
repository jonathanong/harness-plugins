# Evals

**Does an agent that has this plugin follow each skill's guidance on a realistic request?**

Each case gives an agent a request a person would make, such as "review this diff" or "write this
workflow", without naming a skill. Graders then check two things: that the agent loaded the right
skill, and that its answer made the decision the skill asks for.

- Rules for adding and running cases: [AGENTS.md](AGENTS.md)
- Every earlier run and every change to a case or grader: [HISTORY.md](HISTORY.md)

## Current results

Run 2026-11-15, Claude Code 2.1.325. Agent Sonnet, judge Opus, three attempts per case, with the
plugin installed. 33 cases, 99 attempts, $15.38. Every case passed every attempt.

| Case                                                          | Score | Passed |
| ------------------------------------------------------------- | ----- | ------ |
| `bounded-iteration/review-sweep-until-empty`                  | 1.00  | 3 of 3 |
| `dependabot/groups-by-family`                                 | 1.00  | 3 of 3 |
| `dependabot/request-update-check`                             | 1.00  | 3 of 3 |
| `documentation/review-readme-drift`                           | 1.00  | 3 of 3 |
| `evals/document-new-suite`                                    | 1.00  | 3 of 3 |
| `evals/record-partial-rerun`                                  | 1.00  | 3 of 3 |
| `feature-rollout/flag-defaults-on`                            | 1.00  | 3 of 3 |
| `github-actions-authoring/publish-gated-on-ci`                | 1.00  | 3 of 3 |
| `github-actions-authoring/rejects-polling`                    | 1.00  | 3 of 3 |
| `glide-mq/never-enqueue-and-wait`                             | 1.00  | 3 of 3 |
| `glide-mq/review-webhook-lane`                                | 1.00  | 3 of 3 |
| `http-api-design/action-body-and-raw-tokens`                  | 1.00  | 3 of 3 |
| `native-app-architecture/core-tests-and-web-view`             | 1.00  | 3 of 3 |
| `npm-publishing/bootstrap-new-package`                        | 1.00  | 3 of 3 |
| `npm-publishing/existing-package-trust-only`                  | 1.00  | 3 of 3 |
| `package-json-checklist/workspace-dependency-and-export`      | 1.00  | 3 of 3 |
| `playwright-authoring/metadata-is-not-a-browser-test`         | 1.00  | 3 of 3 |
| `postgres-node-performance-tuning/new-query-shape-gets-index` | 1.00  | 3 of 3 |
| `postgres-partitioning-uuid-v7/range-not-hash`                | 1.00  | 3 of 3 |
| `postgres-schema-design/exact-cap-no-lock`                    | 1.00  | 3 of 3 |
| `postgres-schema-design/review-parent-row-lock`               | 1.00  | 3 of 3 |
| `pr-description/perf-change-with-flag`                        | 1.00  | 3 of 3 |
| `react-app-structure/review-profile-card`                     | 1.00  | 3 of 3 |
| `rust-authoring/tests-in-separate-file`                       | 1.00  | 3 of 3 |
| `service-boundaries/partner-webhook`                          | 1.00  | 3 of 3 |
| `static-analysis-checklist/parses-yaml-with-fixtures`         | 1.00  | 3 of 3 |
| `static-code-analysis/new-rust-service`                       | 1.00  | 3 of 3 |
| `static-code-analysis/new-typescript-library`                 | 1.00  | 3 of 3 |
| `structured-logging/review-refund-batch-logs`                 | 1.00  | 3 of 3 |
| `test-authoring/fixture-files-not-inline`                     | 1.00  | 3 of 3 |
| `triage-codex-security/approval-wave-cap`                     | 1.00  | 3 of 3 |
| `triage-codex-security/repository-mismatch`                   | 1.00  | 3 of 3 |
| `typescript-authoring/rename-without-alias`                   | 1.00  | 3 of 3 |

A score is the mean over a case's attempts. An attempt's score is the share of its graders that
passed, so 1.00 means every grader passed on every attempt.

## What each case checks

| Case                                                          | Checks that the agent                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `bounded-iteration/review-sweep-until-empty`                  | Asks for a per-run cap and an index-served predicate on a delete loop that runs until empty.      |
| `dependabot/groups-by-family`                                 | Groups updates by package family with a cooldown, not by version type or a catch-all.             |
| `dependabot/request-update-check`                             | Sends the user to the web page that starts a Dependabot run, and invents no API call.             |
| `documentation/review-readme-drift`                           | Flags restated config values, history and plans in a README, and a comment that explains history. |
| `evals/document-new-suite`                                    | Proposes a README, a history log, and an agent rules file for a new eval suite.                   |
| `evals/record-partial-rerun`                                  | Logs a grader change and does not report a one-attempt rerun as an improvement.                   |
| `feature-rollout/flag-defaults-on`                            | Defaults a new flag to off and reports deployed separately from enabled.                          |
| `github-actions-authoring/publish-gated-on-ci`                | Gates a publish on CI with `needs` or `workflow_run`, not a status lookup.                        |
| `github-actions-authoring/rejects-polling`                    | Replaces a sleep-and-poll loop with an event trigger.                                             |
| `glide-mq/never-enqueue-and-wait`                             | Returns 202 with a job id instead of waiting on the job inside the request.                       |
| `glide-mq/review-webhook-lane`                                | Gives a floodable webhook job family its own lane.                                                |
| `http-api-design/action-body-and-raw-tokens`                  | Uses resource paths, the public id, and hashed tokens.                                            |
| `native-app-architecture/core-tests-and-web-view`             | Runs portable core tests once and asks for a written blocker before a web view.                   |
| `npm-publishing/bootstrap-new-package`                        | Prepares a first publish for a person to run, and never publishes itself.                         |
| `npm-publishing/existing-package-trust-only`                  | Sets up trusted publishing for an existing package without publishing or changing trust.          |
| `package-json-checklist/workspace-dependency-and-export`      | Adds dependencies with pnpm in the right fields and keeps the root export.                        |
| `playwright-authoring/metadata-is-not-a-browser-test`         | Checks redirects and metadata over plain HTTP and locates a button by role.                       |
| `postgres-node-performance-tuning/new-query-shape-gets-index` | Adds an index in the same change as a new query shape.                                            |
| `postgres-partitioning-uuid-v7/range-not-hash`                | Partitions by `RANGE` on the id with a default partition, not `HASH`.                             |
| `postgres-schema-design/exact-cap-no-lock`                    | Enforces a cap as best effort, with no lock, counter, or claim table.                             |
| `postgres-schema-design/review-parent-row-lock`               | Rejects locking a parent row to serialize writes to its children.                                 |
| `pr-description/perf-change-with-flag`                        | Shows a before/after table, states what a flag does not cover, and omits routine checks.          |
| `react-app-structure/review-profile-card`                     | Objects to a user-supplied image rendered directly, a computed fetch URL, and a hand-built link.  |
| `rust-authoring/tests-in-separate-file`                       | Puts unit tests for a private function in a separate file.                                        |
| `service-boundaries/partner-webhook`                          | Maps a partner payload once, keeps the raw body, and tests with captured payloads.                |
| `static-analysis-checklist/parses-yaml-with-fixtures`         | Parses YAML instead of matching text, and tests the check with fixtures.                          |
| `static-code-analysis/new-rust-service`                       | Picks the static checks for a new Rust service.                                                   |
| `static-code-analysis/new-typescript-library`                 | Picks the static checks for a new TypeScript library.                                             |
| `structured-logging/review-refund-batch-logs`                 | Asks for a static message with fields and objects to lookups made only for a log line.            |
| `test-authoring/fixture-files-not-inline`                     | Reads saved fixture files instead of writing them in the test body.                               |
| `triage-codex-security/approval-wave-cap`                     | Treats approval given before a wave was shown as not approving that wave.                         |
| `triage-codex-security/repository-mismatch`                   | Stops when the findings belong to a different repository.                                         |
| `typescript-authoring/rename-without-alias`                   | Updates every caller instead of keeping an alias, and adds the missing `await`.                   |

## How to read the numbers

- **Three attempts is a small sample.** One failed attempt moves a case by a third of a grader's
  weight. Treat a single miss as something to re-run, not a finding.
- **These scores have no baseline.** The default run has only the with-plugin arm, so a 1.00 says
  the agent did the right thing with the plugin, not that the plugin was needed. The last
  measured no-plugin scores are in [HISTORY.md](HISTORY.md). Four cases scored 1.00 without the
  plugin there and need harder prompts: `postgres-schema-design/review-parent-row-lock`,
  `postgres-node-performance-tuning/new-query-shape-gets-index`,
  `bounded-iteration/review-sweep-until-empty`, and `structured-logging/review-refund-batch-logs`.
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
