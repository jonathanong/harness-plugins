# Eval history

This log only grows, newest entry first. Scores in different entries are not comparable when a
case, grader, fixture, or model changed between them; each entry says what changed. The current
scores are in [README.md](README.md).

## 2026-11-15: six workflow skills added, with seven cases

Sonnet agent, Opus judge. Two one-attempt pilots with both arms ($2.52, $1.12), a three-attempt
run with both arms ($10.48), a three-attempt run with the plugin only ($5.37), six attempts of
`test-authoring` on this change and on the commit before it ($3.10, $3.18), and a three-attempt
rerun of two changed cases ($0.98).

| Case                                                    | With          | Without |
| ------------------------------------------------------- | ------------- | ------- |
| `agent-workflow/review-round-dispositions`              | 0.67 (2 of 3) | 0.00    |
| `git-commit-checklist/stages-only-task-files`           | 1.00          | 0.33    |
| `github-actions-authoring/required-check-is-a-real-job` | 1.00          | 0.00    |
| `github-issue/search-before-filing`                     | 0.83 (2 of 3) | 0.00    |
| `planning/plan-saved-outside-repo`                      | 1.00          | 0.00    |
| `review-ci-logs/quiet-log-keeps-errors`                 | 1.00          | 1.00    |
| `revisit-followups/only-verified-deferred-work`         | 1.00          | 0.00    |
| `test-authoring/dotnet-private-field-not-reflected`     | 0.83 (4 of 6) | 0.33    |
| `test-authoring/fake-routes-by-request`                 | 1.00 (6 of 6) | 0.00    |
| `test-authoring/fixture-files-not-inline`               | 1.00 (6 of 6) | 0.00    |
| `test-authoring/review-helper-holds-assertions`         | 0.75 (3 of 6) | 0.00    |

- **New skills:** `agent-workflow`, `git-commit-checklist`, `github-issue`, `planning`,
  `review-ci-logs`, `revisit-followups`. `github-actions-authoring` gained a workflow baseline
  reference and a wider description. `test-authoring` gained three rules on failure paths,
  evidence, and docs contracts.
- **Adding skills lowered how often `test-authoring` loads.** Six attempts per case, same hour:
  on the commit before, the skill loaded on 23 of 24 attempts; with the six skills added, 19 of 24. The drop is on the review case (6 of 6 to 3 of 6). On the attempts where it did not load,
  no skill was loaded at all, and the answer still passed. The sample is small.
- **`review-ci-logs` has no case the model fails unaided.** Two were tried: a retry that would
  mask a port collision, and a noisy log quieted by discarding stderr. Both scored 1.00 without
  the plugin. The second is kept so the skill has a case.
- **`git-commit-checklist`:** a case on a force push that names the expected remote tip scored
  1.00 without the plugin in the pilot and was replaced by the staging case.
- **`github-actions-authoring`:** a review case on a draft-transition trigger and cancellation
  on the default branch scored 1.00 without the plugin in the pilot and was replaced.
- **`agent-workflow` prompt changed after the first measured run.** It now says the repository
  has no job queue and that the teammate's comment was checked, because answers hedged on both.
  The "Without" score predates that edit. In the rerun the one failed attempt did not load the
  skill and implemented more than the blocking item.
- **`github-issue`:** its description lost the label and project wording after the two-arm run.
  One of three attempts in the rerun loaded the skill and still failed the answer grader.
- **`fake-routes-by-request` grader:** it failed two answers that routed the fake by path and
  also asserted which paths were requested. That assertion is now allowed; asserting call order
  still fails.
- **`scripts/eval-summary.py`** now counts every grader in the score, so a two-arm run and a
  plugin-only run report the same thing.

## 2026-11-15: three `test-authoring` cases added, `dependabot` skill trimmed

Sonnet agent, Opus judge. Two one-attempt pilots with both arms ($1.28, $0.84), a three-attempt
run with both arms ($4.65), then a three-attempt run of `test-authoring` with the plugin only
($1.50). One earlier `dependabot` run is discarded: the skill file changed under it.

| Case                                                | With | Without |
| --------------------------------------------------- | ---- | ------- |
| `dependabot/groups-by-family`                       | 1.00 | 0.33    |
| `dependabot/request-update-check`                   | 1.00 | 0.67    |
| `test-authoring/dotnet-private-field-not-reflected` | 1.00 | 0.33    |
| `test-authoring/fake-routes-by-request`             | 1.00 | 0.00    |
| `test-authoring/fixture-files-not-inline`           | 1.00 | 0.00    |
| `test-authoring/review-helper-holds-assertions`     | 1.00 | 0.00    |

- **`dependabot` skill:** the rules for an auto-merge workflow are removed, and the description
  no longer mentions one. No case or grader changed. Both cases were re-measured in the two-arm
  run; the skill loaded on all six with-plugin attempts.
- **New cases** cover the reference files that had none: `dotnet.md` (no reflection on a private
  field), `dependency-boundaries.md` (a fake that answers by request, not by call order), and
  the helper and re-implementation rules in `SKILL.md` and `tautological-tests.md`.
- **Tried and dropped,** each 1.00 without the plugin in the first pilot: a test broken by a
  dependency upgrade that pinned the dependency's message, a Vitest module mock that keeps the
  real exports, and tests for a module-private function.
- **The .NET prompt was softened after the first pilot.** It said "I want to check the
  dictionary itself this time", and both arms used reflection as asked. That sentence is gone.
- **Three graders were tightened in review, then re-run** with the plugin only ($1.35, 12 of 12).
  The .NET grader accepts a `Count` check only when the test also shows the live session
  remains. The fake grader no longer asks the fake to survive a new request. The review grader
  no longer claims to know the production formula. The "Without" column predates these edits.
- **`vitest.md`, `storybook.md`, and `swift.md` still have no case.**
- **Scoring in a two-arm run:** `claude plugin eval` leaves the `skill-fired` grader out of the
  score when it runs both arms. In the two-arm run the skill did not load on one of three
  attempts for the .NET case and for the review case, and both still scored 1.00. The "With"
  column for `test-authoring` is from the plugin-only run, where the skill loaded on all 12
  attempts. Earlier "With" scores taken from two-arm runs may hide a skill that did not load.

## 2026-11-15: runner rules folded into `test-authoring`

Sonnet agent, Opus judge, three attempts. Two runs: one with both arms ($5.44), then one with the
plugin only ($0.85) after the layout changed.

| Case                                                  | With | Without |
| ----------------------------------------------------- | ---- | ------- |
| `test-authoring/fixture-files-not-inline`             | 1.00 | 0.00    |
| `playwright-authoring/metadata-is-not-a-browser-test` | 1.00 | 0.00    |

- Rules for Vitest (including backend and Next.js), Storybook, Swift, and .NET tests were added.
  The first layout was four new skills, one per runner, each with one case.
- That layout was abandoned. All four new cases scored 1.00 with the plugin and 1.00 without, so
  they showed nothing. And `fixture-files-not-inline` fell to 0.33 (1 of 3): on two attempts
  `test-authoring` did not load, because a runner skill matched the prompt instead.
- The runner rules are now reference files under `skills/test-authoring/references/`, and
  `test-authoring` is the one skill that fires for any test. Its description names the runners.
  The four runner skills and their four cases are removed.
- `fixture-files-not-inline` is back to 3 of 3 in the second run. The "Without" column is from the
  first run; the second run had no no-plugin arm.
- The runner reference files have no case of their own. A case needs a decision the model gets
  wrong unaided, and the four tried (shared-database test identity, a story for a server
  component, a delayed `URLProtocol` double, a separate portable test project) were not that.

## 2026-11-15: review fixes to two replaced cases, re-measured

Sonnet agent, Opus judge, three attempts per arm, $1.73.

| Case                                                           | With          | Without |
| -------------------------------------------------------------- | ------------- | ------- |
| `bounded-iteration/review-dispatcher-predicate-and-job-id`     | 0.67 (2 of 3) | 0.33    |
| `postgres-node-performance-tuning/new-query-named-and-indexed` | 1.00          | 0.00    |

- The dispatcher prompt's job id used a colon, which the queue library rejects in a custom id. It
  now uses a hyphen.
- The query grader now also requires the account and status filters, newest-first ordering, and
  `id` as a tie-breaker in the ordering and the cursor.
- On the dispatcher case the `bounded-iteration` skill did not load on one of three attempts, and
  that attempt's review missed the job id. Across the three with-plugin runs of this case the
  skill loaded on 7 of 9 attempts. The description was not changed; watch it on the next full
  run. `README.md` carries this run's row.

## 2026-11-15: three ceiling cases replaced

Sonnet agent, Opus judge, three attempts per arm, five targeted runs ($2.80, $2.64, $1.59, $0.86,
and one stopped early). The three cases that scored 1.00 without the plugin are replaced.

| Case                                                           | With | Without |
| -------------------------------------------------------------- | ---- | ------- |
| `bounded-iteration/review-dispatcher-predicate-and-job-id`     | 1.00 | 0.00    |
| `postgres-node-performance-tuning/new-query-named-and-indexed` | 1.00 | 0.00    |
| `postgres-schema-design/review-last-admin-advisory-lock`       | 1.00 | 0.00    |

- **`new-query-named-and-indexed`** keeps the prompt of `new-query-shape-gets-index`. The grader
  now also requires the operation-name comment on the statement, which the model does not write
  on its own.
- **`review-dispatcher-predicate-and-job-id`** replaces `review-sweep-until-empty`. The model
  already asks for a cap on an unbounded loop. The new diff is capped and tests two things the
  model misses: a predicate no index can serve, and a job id keyed only by the entity. The first
  version of the prompt described the queue's deduplication and scored 1.00 without the plugin;
  naming the queue library instead brought that to 0.33. A review then pointed out that the
  grader's claim "no index can serve the predicate" is wrong: a partial index with the same
  predicate can. The grader now accepts that remedy, the prompt states the table's indexes, and
  a fifth run ($0.86) scored 1.00 with and 0.00 without.
- **`review-last-admin-advisory-lock`** replaces `review-parent-row-lock`. Two things changed
  before it passed:
  - The skill did not load on any of the first three attempts, and the agent approved the lock.
    The `postgres-schema-design` description now names row locks, advisory locks, serializing
    writers, and last-one guards. It loaded on 5 of 6 attempts after.
  - The grader failed answers that removed the lock and then offered `SERIALIZABLE` with `40001`
    as 409 if the guard must be exact. The skill allows that, so the grader now does too.
- The three `README.md` rows are from these runs, not from the 33-case run.

## 2026-11-15: `structured-logging` case replaced again, skill extended

Sonnet agent, Opus judge, three attempts per arm.

| Case                                           | With | Without | Cost  |
| ---------------------------------------------- | ---- | ------- | ----- |
| `structured-logging/add-refund-logs`           | 1.00 | 1.00    | $0.79 |
| `structured-logging/log-identifier-not-lookup` | 1.00 | 0.00    | $0.76 |

- A review pointed out that `review-refund-batch-logs`, the skill's only case, passed without the
  plugin. A second attempt, `add-refund-logs`, also passed without it: the model writes a static
  message with fields on its own. Both are removed.
- What the model does not do on its own is decline a lookup when asked to log a value behind one.
  The skill gained a section for that (log the identifier, add no queries for a log line, keep
  personal data out of logs), and `log-identifier-not-lookup` uses the prompt of the first,
  abandoned case. With the earlier skill text that prompt scored 0.00 in both arms.
- The `structured-logging` row in `README.md` is from this run. It was not part of the 33-case
  run below, which measured `review-refund-batch-logs`.

## 2026-11-15: full single-arm run, 33 cases

Sonnet agent, Opus judge, three attempts, with the plugin only. Claude Code 2.1.325, 99 attempts,
$15.38. Run on the change that added the twelve rule skills.

- All 33 cases scored 1.00, 3 of 3.
- `glide-mq/never-enqueue-and-wait` and `static-code-analysis/new-typescript-library`, which each
  missed one attempt in the 21-case run, passed all three here. Nothing about them changed.

## 2026-11-15: twelve rule skills, with and without the plugin

Sonnet agent, Opus judge, three attempts per arm. First run of the twelve new cases ($8.26), then
a rerun of the five that changed ($3.22). Rows marked "rerun" are from the second run.

| Case                                                  | With | Without | Run   |
| ----------------------------------------------------- | ---- | ------- | ----- |
| `documentation/review-readme-drift`                   | 1.00 | 0.00    | rerun |
| `feature-rollout/flag-defaults-on`                    | 1.00 | 0.00    | rerun |
| `http-api-design/action-body-and-raw-tokens`          | 1.00 | 0.33    | first |
| `native-app-architecture/core-tests-and-web-view`     | 1.00 | 0.00    | first |
| `playwright-authoring/metadata-is-not-a-browser-test` | 1.00 | 0.00    | rerun |
| `pr-description/perf-change-with-flag`                | 1.00 | 0.00    | first |
| `react-app-structure/review-profile-card`             | 1.00 | 0.33    | first |
| `rust-authoring/tests-in-separate-file`               | 1.00 | 0.00    | rerun |
| `service-boundaries/partner-webhook`                  | 1.00 | 0.33    | first |
| `structured-logging/review-refund-batch-logs`         | 1.00 | 1.00    | rerun |
| `test-authoring/fixture-files-not-inline`             | 1.00 | 0.00    | first |
| `typescript-authoring/rename-without-alias`           | 1.00 | 0.00    | first |

Changes between the first run and the rerun:

- **`structured-logging` case replaced.** The first case, `refund-failure-log`, scored 0.00 in
  both arms. Its prompt asked for the customer's email in the log line, which the skill tells the
  agent not to fetch, so the agent followed the request. That was a badly posed case, not a skill
  failure. The replacement is a review of a diff. It scores 1.00 without the plugin, so it is a
  ceiling case and needs a harder prompt.
- **`playwright-authoring` case replaced.** `redirect-is-not-a-browser-test` scored 1.00 without
  the plugin: a prompt that says "301" leads to an HTTP test on its own. The replacement adds page
  metadata checks and does not say how to test them.
- **`rust-authoring/tests-in-separate-file` prompt shortened.** The sentence "Show me exactly what
  goes in which file" hinted at a separate file; the case scored 1.00 without the plugin. Without
  the sentence it scores 0.00.
- **`feature-rollout/flag-defaults-on` grader narrowed.** It required the answer to say the deploy
  is "confirmed healthy" before enabling. One attempt set the flag off, kept the fallback off, and
  separated deployed from enabled, and failed on that wording alone. The grader now asks only that
  enabling is a separate step.
- **`documentation` description extended.** The skill did not load on 2 of 3 attempts of a diff
  review. The description now names a diff that changes docs or comments. It loaded 3 of 3 after.

## 2026-11-15: no-plugin arm for the two `evals` cases

Sonnet agent, Opus judge, three attempts per arm, `EVAL_ABLATION=with-without`, $2.10.

| Case                         | With | Without |
| ---------------------------- | ---- | ------- |
| `evals/document-new-suite`   | 1.00 | 0.00    |
| `evals/record-partial-rerun` | 1.00 | 0.00    |

Both cases fail without the plugin on all three attempts, so neither is a ceiling case.

## 2026-11-15: first full single-arm run, 21 cases

Sonnet agent, Opus judge, three attempts, with the plugin only. Claude Code 2.1.325, 63 attempts,
$10.55. Run on the change that added the `evals` skill, on top of `baf9931`.

- 19 of 21 cases passed all three attempts. This is the first run in which every row comes from
  one run, and the first to measure the dependabot cases after the skill's last edit and
  `npm-publishing/existing-package-trust-only` after its grader was restored. All four scored
  1.00.
- `glide-mq/never-enqueue-and-wait` 0.83 (2 of 3). The failing attempt returned 202 and polled,
  but kept the job on the shared `background` queue in a separate ordering lane. The grader asks
  for its own queue, as the skill does. Not changed; watch it on the next run.
- `static-code-analysis/new-typescript-library` 0.89 (2 of 3). On one attempt the judge voted
  1 pass to 2 fails on the list of checks. Not changed.
- New cases `evals/document-new-suite` and `evals/record-partial-rerun` scored 1.00. Their
  no-plugin arm is in the entry above.
- The new Markdown files under `evals/` were not picked up as cases: the runner found 21.

## 2026-11-15: default run drops the no-plugin arm

- `pnpm run evals` now runs with the plugin only (`--ablation none`). The no-plugin arm is opt-in
  with `EVAL_ABLATION=with-without`, for checking a new case.
- Under a single arm the `skill-fired` grader counts toward a case's score. In the entries below
  it was an indicator outside the score, so a with-plugin score here can be lower than there for
  the same answers.
- Added `evals/README.md`, `evals/HISTORY.md`, and `evals/AGENTS.md`, and the `evals` skill with
  two cases: `evals/document-new-suite` and `evals/record-partial-rerun`.

## 2026-11-15: database and queue skills, with and without the plugin

Sonnet agent, Opus judge, three attempts per arm, on the commit that added the five database and
queue skills.

| Case                                                          | With | Without |
| ------------------------------------------------------------- | ---- | ------- |
| `postgres-schema-design/exact-cap-no-lock`                    | 1.00 | 0.00    |
| `postgres-schema-design/review-parent-row-lock`               | 1.00 | 1.00    |
| `postgres-node-performance-tuning/new-query-shape-gets-index` | 1.00 | 1.00    |
| `postgres-partitioning-uuid-v7/range-not-hash`                | 1.00 | 0.00    |
| `bounded-iteration/review-sweep-until-empty`                  | 1.00 | 1.00    |
| `glide-mq/never-enqueue-and-wait`                             | 1.00 | 0.00    |
| `glide-mq/review-webhook-lane`                                | 1.00 | 0.33    |
| `github-actions-authoring/publish-gated-on-ci`                | 1.00 | 0.00    |
| `github-actions-authoring/rejects-polling`                    | 1.00 | 0.67    |
| `package-json-checklist/workspace-dependency-and-export`      | 1.00 | 0.67    |

- Three cases score 1.00 without the plugin: `review-parent-row-lock`,
  `new-query-shape-gets-index`, and `review-sweep-until-empty`. They show that the skill fires and
  does no harm, not that it changes the answer. They need harder prompts.
- `review-sweep-until-empty` was written here. The benchmark case it stands in for was not
  available.

## 2026-11-15: first seven skills, with and without the plugin

Sonnet agent, Opus judge, three attempts per arm. The rows come from more than one run: the
dependabot, npm-publishing, and triage rows are from a rerun after the last grader and fixture
changes, the rest from the last full run.

| Case                                                     | With | Without |
| -------------------------------------------------------- | ---- | ------- |
| `dependabot/groups-by-family`                            | 1.00 | 0.33    |
| `dependabot/request-update-check`                        | 1.00 | 0.33    |
| `github-actions-authoring/rejects-polling`               | 1.00 | 0.50    |
| `npm-publishing/bootstrap-new-package`                   | 1.00 | 0.40    |
| `npm-publishing/existing-package-trust-only`             | 1.00 | 0.73    |
| `package-json-checklist/workspace-dependency-and-export` | 1.00 | 0.67    |
| `static-analysis-checklist/parses-yaml-with-fixtures`    | 1.00 | 0.50    |
| `static-code-analysis/new-rust-service`                  | 1.00 | 0.83    |
| `static-code-analysis/new-typescript-library`            | 1.00 | 0.00    |
| `triage-codex-security/approval-wave-cap`                | 1.00 | 0.50    |
| `triage-codex-security/repository-mismatch`              | 1.00 | 0.78    |

Changes during this batch that moved scores:

- **`triage-codex-security/approval-wave-cap` fixture replaced.** It scored 0.67 with the plugin
  (7 of 9 attempts across earlier runs). Its findings had arguable verdicts; they were replaced
  with unambiguous ones, and the case then passed 3 of 3.
- **Graders anchored to the Bash `"command"` input.** Patterns over the whole transcript matched
  the prompt and the fixture.
- **`npm-publishing/existing-package-trust-only` grader widened, then reverted.** A review
  suggestion removed the `--otp` anchor from `no-publish-command`. The case dropped to 0.80
  because the fixture's own `release.yml` contains an `npm publish` line. The anchor was
  restored and checked by pattern against three kept traces; the case was not re-run in this
  batch.
- **Dependabot skill edited after its last run** (eligibility is rechecked on every new head).
  The two dependabot rows predate that edit.
