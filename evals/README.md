# Evals

**Does an agent that has this plugin follow each skill's guidance on a realistic request?**

Each case gives an agent a request a person would make, such as "review this diff", without
naming a skill. Graders check that the agent loaded the right skill and that its answer made the
decision the skill asks for. The same case run without the plugin shows whether the skill was
needed.

## Headline

<!-- evals:headline -->

- **167 cases** across 50 skills.
- **With the plugin:** mean score 0.93.
- **Without it:** mean score 0.35, over the 166 cases measured both ways.
- **130 cases** are ones the model fails unaided. The other 36 it already gets right: 7 check that a skill stays out of the way, and 29 show at most that the skill loads.
- **162 of 167 cases** meet their target: critical 3 of 3, high 23 of 25, medium 113 of 115, low 23 of 24. The rows come from different runs, and a row with fewer attempts than planned stopped early: read it as a verdict, not a rate.
- **Loading** is counted for every case of 9 of 50 skills, and 5 of those load in at least 80% of attempts. For 22 more it is counted for some cases only, which does not show the skill meets the target. Under it on what was counted: `agent-coordination`, `debugging`, `deciding-or-asking`, `documentation`, `github-ci-operations`, `github-issue`, `implementing-changes`, `planning`, `postgres-node-performance-tuning`, `review-ci-logs`, `status-reports`, `test-authoring`.

<!-- /evals:headline -->

Agent Sonnet, judge Opus, three attempts per case unless [EVALS.md](EVALS.md) says a row
comes from a run with more. A score is the share of graders that passed,
averaged over attempts.

## By skill

<!-- evals:groups -->

| Skill                              | Cases | With plugin | Without plugin | Already right unaided | Loaded                               | Met target |
| ---------------------------------- | ----- | ----------- | -------------- | --------------------- | ------------------------------------ | ---------- |
| `agent-coordination`               | 1     | 0.50        | 1.00           | 1                     | 0 of 3, under 80%                    | 1 of 1     |
| `agent-rules`                      | 3     | 0.94        | 0.11           | 0                     | n/a                                  | 3 of 3     |
| `bounded-iteration`                | 9     | 0.96        | 0.11           | 0                     | 5 of 6, from 2 of 9 cases            | 9 of 9     |
| `change-review`                    | 1     | 1.00        | 1.00           | 1                     | 3 of 3                               | 1 of 1     |
| `debugging`                        | 2     | 0.70        | 1.00           | 2                     | 0 of 3, from 1 of 2 cases, under 80% | 2 of 2     |
| `deciding-or-asking`               | 1     | 0.17        | 0.33           | 0                     | 0 of 3, under 80%                    | 0 of 1     |
| `dependabot`                       | 4     | 1.00        | 0.50           | 1                     | 6 of 6, from 2 of 4 cases            | 4 of 4     |
| `documentation`                    | 3     | 0.78        | 0.56           | 1                     | 1 of 3, from 1 of 2 cases, under 80% | 2 of 3     |
| `error-handling`                   | 3     | 1.00        | 0.33           | 1                     | n/a                                  | 3 of 3     |
| `evals`                            | 4     | 1.00        | 0.25           | 0                     | 6 of 6, from 2 of 4 cases            | 4 of 4     |
| `expand-contract-migrations`       | 1     | 1.00        | 1.00           | 1                     | 3 of 3                               | 1 of 1     |
| `feature-rollout`                  | 3     | 0.94        | 0.33           | 1                     | 3 of 3, from 1 of 3 cases            | 2 of 3     |
| `git-commit-checklist`             | 4     | 0.96        | 0.33           | 1                     | 8 of 9, from 3 of 4 cases            | 4 of 4     |
| `github-actions-authoring`         | 10    | 0.98        | 0.20           | 1                     | 17 of 18, from 6 of 10 cases         | 10 of 10   |
| `github-ci-operations`             | 7     | 0.85        | 0.26           | 1                     | 2 of 6, from 2 of 7 cases, under 80% | 6 of 7     |
| `github-issue`                     | 5     | 0.83        | 0.20           | 0                     | 3 of 6, from 2 of 5 cases, under 80% | 4 of 5     |
| `github-repository-settings`       | 3     | 1.00        | 0.33           | 0                     | 3 of 3, from 1 of 3 cases            | 3 of 3     |
| `glide-mq`                         | 5     | 1.00        | 0.33           | 1                     | 3 of 3, from 1 of 5 cases            | 5 of 5     |
| `http-api-design`                  | 4     | 1.00        | 0.17           | 0                     | 6 of 6, from 2 of 4 cases            | 4 of 4     |
| `implementing-changes`             | 1     | 0.50        | 1.00           | 1                     | 0 of 3, under 80%                    | 1 of 1     |
| `lint-rule-authoring`              | 1     | 1.00        | 0.00           | 0                     | n/a                                  | 1 of 1     |
| `list-reads`                       | 4     | 0.99        | 0.67           | 2                     | n/a                                  | 4 of 4     |
| `llm-calls`                        | 3     | 0.97        | 0.44           | 1                     | 3 of 3, from 1 of 3 cases            | 3 of 3     |
| `native-app-architecture`          | 3     | 0.97        | 0.00           | 0                     | n/a                                  | 3 of 3     |
| `npm-publishing`                   | 2     | 1.00        | 0.56           | 0                     | 6 of 6                               | 2 of 2     |
| `package-json-checklist`           | 3     | 0.96        | 0.45           | 0                     | n/a                                  | 3 of 3     |
| `planning`                         | 7     | 0.93        | 0.38           | 2                     | 2 of 3, from 1 of 6 cases, under 80% | 7 of 7     |
| `playwright-authoring`             | 2     | 1.00        | 0.00           | 0                     | n/a                                  | 2 of 2     |
| `postgres-locking`                 | 12    | 0.99        | 0.39           | 4                     | 3 of 3, from 1 of 11 cases           | 12 of 12   |
| `postgres-node-performance-tuning` | 3     | 0.90        | 0.00           | 0                     | 2 of 3, from 1 of 3 cases, under 80% | 3 of 3     |
| `postgres-partitioning-uuid-v7`    | 2     | 1.00        | 0.34           | 0                     | 3 of 3, from 1 of 2 cases            | 2 of 2     |
| `postgres-schema-design`           | 5     | 1.00        | 0.60           | 2                     | n/a                                  | 5 of 5     |
| `pr-description`                   | 4     | 1.00        | 0.08           | 0                     | n/a                                  | 4 of 4     |
| `pull-requests`                    | 1     | 1.00        | 0.67           | 0                     | n/a                                  | 1 of 1     |
| `react-app-structure`              | 4     | 0.96        | 0.46           | 1                     | n/a                                  | 4 of 4     |
| `resuming-work`                    | 1     | 0.83        | 1.00           | 1                     | n/a                                  | 1 of 1     |
| `review-ci-logs`                   | 4     | 0.90        | 0.58           | 2                     | 1 of 3, from 1 of 4 cases, under 80% | 4 of 4     |
| `revisit-followups`                | 1     | 0.83        | 0.00           | 0                     | n/a                                  | 1 of 1     |
| `rust-authoring`                   | 1     | 1.00        | 0.00           | 0                     | n/a                                  | 1 of 1     |
| `service-boundaries`               | 2     | 1.00        | 0.67           | 1                     | n/a                                  | 2 of 2     |
| `skill-authoring`                  | 2     | 0.92        | 0.00           | 0                     | n/a                                  | 2 of 2     |
| `static-analysis-checklist`        | 2     | 1.00        | 0.42           | 0                     | n/a                                  | 2 of 2     |
| `static-code-analysis`             | 2     | 1.00        | 0.41           | 0                     | n/a                                  | 2 of 2     |
| `status-reports`                   | 4     | 0.67        | 0.75           | 3                     | 6 of 15, under 80%                   | 4 of 4     |
| `structured-logging`               | 3     | 0.94        | 0.00           | 0                     | 5 of 6, from 2 of 3 cases            | 3 of 3     |
| `technical-writing`                | 3     | 0.94        | 0.00           | 0                     | 3 of 3, from 1 of 3 cases            | 3 of 3     |
| `test-authoring`                   | 6     | 0.88        | 0.50           | 2                     | 0 of 3, from 1 of 6 cases, under 80% | 6 of 6     |
| `triage-codex-security`            | 2     | 1.00        | 0.64           | 0                     | 6 of 6                               | 2 of 2     |
| `typescript-authoring`             | 3     | 1.00        | 0.00           | 0                     | n/a                                  | 3 of 3     |
| `webhooks`                         | 1     | 1.00        | 1.00           | 1                     | 3 of 3                               | 1 of 1     |

<!-- /evals:groups -->

## Reading the numbers

- The gap between the two columns is the result. A high score with no gap means the model does as
  well without the skill.
- Three attempts is a small sample, and the two columns often come from different days. Read a gap
  as "the model fails this unaided", not as a precise difference.
- Each case has a priority, and with it a pass rate it must reach: critical 80%, high 70%, medium
  60%, low 50%. "Met target" counts the cases that reach theirs. At three attempts that is 3 of
  3 for critical and high and 2 of 3 for the rest, and 3 of 3 still cannot be told from a case
  that passes half the time. The priorities were proposed by an agent and are open to
  correction.
- A case has two layers. "Loaded" is how often the skill loaded, and it has its own target: 80%
  of a skill's attempts, over all its cases. A case is counted once it has a loading count
  from a run of every planned attempt; "from 1 of 9 cases" means the other eight are not
  counted yet, and the skill is not shown to meet the target until all are. "Passed" counts the attempts whose answer was right,
  whether or not the skill loaded, and is what a case's target applies to; [EVALS.md](EVALS.md)
  also gives the passes among the attempts that loaded. A skill with "n/a" under "Loaded" was
  last measured before 2026-11-26, when an attempt passed only if the skill had also loaded, so
  its "Met target" can be a loading miss. Most loading counts are three attempts of one case,
  which cannot tell 70% from 90%: read "under 80%" on three attempts as a case to rerun, and 0
  of 3 as a skill that does not load for that request.
- Each case runs in an empty sandbox with only this plugin installed, on Claude Code. The suite
  does not show how often a skill loads in a real session, or how Codex or another model does.
- Nothing is published and no hosted service is written to; cases that publish or triage are
  graded on the commands the agent attempts.

## More

- [EVALS.md](EVALS.md): every case, what it checks, and its score.
- [HISTORY.md](HISTORY.md): every run and every change to a case or grader.
- [AGENTS.md](AGENTS.md): the rules for adding and running cases.
- [ROADMAP.md](../ROADMAP.md): what is planned for the suite and the skills.

## Run it

```bash
pnpm run evals                  # every case
pnpm run evals npm-publishing   # one skill
EVAL_STOP_EARLY=1 pnpm run evals # stop each case once its verdict is settled
python3 scripts/eval-summary.py # record evals/results/latest.json in cases.csv
python3 scripts/eval-docs.py    # rebuild EVALS.md and the tables above from cases.csv
```

The run needs Claude Code signed in, grants the agent `Bash`, and executes each case's
`fixture.sh` on your machine, so run it only on a checkout you trust. It does not run in CI. Raw
results land in `evals/results/`, which git ignores.
