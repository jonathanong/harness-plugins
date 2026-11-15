# Eval history

This log only grows, newest entry first. Scores in different entries are not comparable when a
case, grader, fixture, or model changed between them; each entry says what changed. The current
scores are in [README.md](README.md).

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
