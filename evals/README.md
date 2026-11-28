# Evals

**Does an agent that has a plugin follow each skill's guidance on a realistic request?**

Each case gives an agent a request a person would make, such as "review this diff", without
naming a skill. Graders check that the agent loaded the right skill and that its answer made the
decision the skill asks for. The same case run without the plugin shows whether the skill was
needed.

## Headline

<!-- evals:headline -->

- **177 cases** across 51 skills.
- **With the plugin:** mean score 0.91.
- **Without it:** mean score 0.35, over the 175 cases measured both ways.
- **139 cases** are ones the model fails unaided. The other 36 it already gets right: 7 check that a skill stays out of the way, and 29 show at most that the skill loads.
- **167 of 177 cases** meet their target: critical 3 of 3, high 25 of 25, medium 117 of 125, low 22 of 24. The rows come from different runs, and a row with fewer attempts than planned stopped early: read it as a verdict, not a rate.
- **Loading** is counted for every case of 50 of 51 skills, and 37 of those load in at least 80% of attempts. For 1 more it is counted for some cases only, which does not show the skill meets the target. Under it on what was counted: `agent-coordination`, `debugging`, `deciding-or-asking`, `implementing-changes`, `llm-calls`, `planning`, `postgres-node-performance-tuning`, `pull-requests`, `resuming-work`, `review-ci-logs`, `service-boundaries`, `skill-authoring`, `status-reports`, `typescript-authoring`.

<!-- /evals:headline -->

**Every score below but two was measured before the split on 2026-11-26, when the skills were
one plugin of 51.** A case now runs with only its skill's plugin installed, 11 to 15 skills, and
no row has been re-measured since. The exceptions are
`npm-publishing/release-workflow-bumps-and-publishes` and
`postgres-schema-design/review-trigger-that-keeps-a-counter`, which were added after the split; see "`jong-skills` becomes four plugins" in [HISTORY.md](HISTORY.md).

Agent Sonnet, judge Opus, three attempts per case unless [EVALS.md](EVALS.md) says a row
comes from a run with more. A score is the share of graders that passed,
averaged over attempts.

## By skill

<!-- evals:groups -->

| Skill                              | Plugin              | Cases | With plugin | Without plugin | Already right unaided | Loaded                               | Met target |
| ---------------------------------- | ------------------- | ----- | ----------- | -------------- | --------------------- | ------------------------------------ | ---------- |
| `agent-coordination`               | `ratchet-workflows` | 1     | 0.50        | 1.00           | 1                     | 0 of 3, under 80%                    | 1 of 1     |
| `agent-rules`                      | `ratchet-workflows` | 3     | 0.89        | 0.11           | 0                     | 8 of 9                               | 3 of 3     |
| `bounded-iteration`                | `ratchet-backend`   | 10    | 0.95        | 0.13           | 0                     | 28 of 30                             | 10 of 10   |
| `change-review`                    | `ratchet-workflows` | 1     | 1.00        | 1.00           | 1                     | 3 of 3                               | 1 of 1     |
| `debugging`                        | `ratchet-workflows` | 2     | 0.70        | 1.00           | 2                     | 0 of 3, from 1 of 2 cases, under 80% | 2 of 2     |
| `deciding-or-asking`               | `ratchet-workflows` | 1     | 0.17        | 0.33           | 0                     | 0 of 3, under 80%                    | 0 of 1     |
| `dependabot`                       | `ratchet-github`    | 4     | 1.00        | 0.50           | 1                     | 12 of 12                             | 4 of 4     |
| `documentation`                    | `ratchet-workflows` | 3     | 0.94        | 0.56           | 1                     | 8 of 9                               | 3 of 3     |
| `error-handling`                   | `ratchet-backend`   | 3     | 1.00        | 0.33           | 1                     | 9 of 9                               | 3 of 3     |
| `evals`                            | `ratchet-workflows` | 5     | 0.97        | 0.20           | 0                     | 15 of 15                             | 5 of 5     |
| `expand-contract-migrations`       | `ratchet-backend`   | 1     | 1.00        | 1.00           | 1                     | 3 of 3                               | 1 of 1     |
| `feature-rollout`                  | `ratchet-backend`   | 3     | 1.00        | 0.33           | 1                     | 9 of 9                               | 3 of 3     |
| `git-commit-checklist`             | `ratchet-github`    | 5     | 0.97        | 0.27           | 1                     | 14 of 15                             | 5 of 5     |
| `github-actions-authoring`         | `ratchet-github`    | 10    | 0.85        | 0.20           | 1                     | 25 of 30                             | 8 of 10    |
| `github-ci-operations`             | `ratchet-github`    | 7     | 0.92        | 0.26           | 1                     | 24 of 27                             | 7 of 7     |
| `github-issue`                     | `ratchet-github`    | 5     | 0.93        | 0.20           | 0                     | 18 of 18                             | 5 of 5     |
| `github-repository-settings`       | `ratchet-github`    | 3     | 1.00        | 0.33           | 0                     | 9 of 9                               | 3 of 3     |
| `glide-mq`                         | `ratchet-backend`   | 5     | 0.97        | 0.33           | 1                     | 15 of 15                             | 5 of 5     |
| `http-api-design`                  | `ratchet-backend`   | 4     | 1.00        | 0.17           | 0                     | 12 of 12                             | 4 of 4     |
| `implementing-changes`             | `ratchet-workflows` | 1     | 0.50        | 1.00           | 1                     | 0 of 3, under 80%                    | 1 of 1     |
| `lint-rule-authoring`              | `ratchet-code`      | 1     | 1.00        | 0.00           | 0                     | 3 of 3                               | 1 of 1     |
| `list-reads`                       | `ratchet-backend`   | 4     | 1.00        | 0.67           | 2                     | 9 of 9                               | 4 of 4     |
| `llm-calls`                        | `ratchet-backend`   | 3     | 0.89        | 0.44           | 1                     | 7 of 9, under 80%                    | 3 of 3     |
| `native-app-architecture`          | `ratchet-code`      | 3     | 0.94        | 0.00           | 0                     | 9 of 9                               | 3 of 3     |
| `npm-publishing`                   | `ratchet-code`      | 3     | 1.00        | 0.54           | 0                     | 9 of 9                               | 3 of 3     |
| `package-json-checklist`           | `ratchet-code`      | 3     | 0.89        | 0.45           | 0                     | 8 of 9                               | 3 of 3     |
| `planning`                         | `ratchet-workflows` | 6     | 0.81        | 0.28           | 1                     | 11 of 15, under 80%                  | 5 of 6     |
| `playwright-authoring`             | `ratchet-code`      | 2     | 1.00        | 0.00           | 0                     | 6 of 6                               | 2 of 2     |
| `postgres-locking`                 | `ratchet-backend`   | 12    | 0.93        | 0.39           | 4                     | 31 of 33                             | 11 of 12   |
| `postgres-node-performance-tuning` | `ratchet-backend`   | 5     | 0.85        | 0.17           | 0                     | 13 of 18, under 80%                  | 4 of 5     |
| `postgres-partitioning-uuid-v7`    | `ratchet-backend`   | 2     | 1.00        | 0.34           | 0                     | 6 of 6                               | 2 of 2     |
| `postgres-schema-design`           | `ratchet-backend`   | 6     | 1.00        | 0.50           | 2                     | 18 of 18                             | 6 of 6     |
| `pr-description`                   | `ratchet-github`    | 5     | 0.97        | 0.07           | 0                     | 17 of 18                             | 5 of 5     |
| `pull-requests`                    | `ratchet-github`    | 1     | 0.67        | 0.67           | 0                     | 1 of 3, under 80%                    | 1 of 1     |
| `react-app-structure`              | `ratchet-code`      | 4     | 1.00        | 0.46           | 1                     | 12 of 12                             | 4 of 4     |
| `resuming-work`                    | `ratchet-workflows` | 1     | 0.50        | 1.00           | 1                     | 2 of 3, under 80%                    | 0 of 1     |
| `review-ci-logs`                   | `ratchet-github`    | 4     | 0.88        | 0.58           | 2                     | 9 of 12, under 80%                   | 4 of 4     |
| `revisit-followups`                | `ratchet-workflows` | 1     | 1.00        | 0.00           | 0                     | 3 of 3                               | 1 of 1     |
| `rust-authoring`                   | `ratchet-code`      | 1     | 1.00        | 0.00           | 0                     | 3 of 3                               | 1 of 1     |
| `service-boundaries`               | `ratchet-backend`   | 2     | 0.83        | 0.67           | 1                     | 4 of 6, under 80%                    | 2 of 2     |
| `skill-authoring`                  | `ratchet-workflows` | 2     | 0.58        | 0.00           | 0                     | 4 of 6, under 80%                    | 1 of 2     |
| `static-analysis-checklist`        | `ratchet-code`      | 2     | 0.83        | 0.42           | 0                     | 5 of 6                               | 2 of 2     |
| `static-code-analysis`             | `ratchet-code`      | 2     | 0.95        | 0.41           | 0                     | 6 of 6                               | 2 of 2     |
| `status-reports`                   | `ratchet-workflows` | 4     | 0.79        | 0.75           | 3                     | 9 of 15, under 80%                   | 4 of 4     |
| `structured-logging`               | `ratchet-backend`   | 3     | 0.94        | 0.00           | 0                     | 8 of 9                               | 3 of 3     |
| `technical-writing`                | `ratchet-workflows` | 3     | 0.83        | 0.00           | 0                     | 8 of 9                               | 3 of 3     |
| `test-authoring`                   | `ratchet-code`      | 6     | 0.89        | 0.50           | 2                     | 15 of 18                             | 6 of 6     |
| `triage-codex-security`            | `ratchet-github`    | 2     | 1.00        | 0.64           | 0                     | 6 of 6                               | 2 of 2     |
| `typescript-authoring`             | `ratchet-code`      | 3     | 0.44        | 0.00           | 0                     | 3 of 9, under 80%                    | 1 of 3     |
| `upstream-contributions`           | `ratchet-github`    | 3     | 1.00        | 0.72           | 1                     | 9 of 9                               | 3 of 3     |
| `webhooks`                         | `ratchet-backend`   | 1     | 1.00        | 1.00           | 1                     | 3 of 3                               | 1 of 1     |

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
- Each case runs in an empty sandbox with only the plugin of its skill installed, on Claude Code. The suite
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
python3 scripts/eval-summary.py # record evals/results/latest-*.json in cases.csv
python3 scripts/eval-docs.py    # rebuild EVALS.md and the tables above from cases.csv
```

The run needs Claude Code signed in, grants the agent `Bash`, and executes each case's
`fixture.sh` on your machine, so run it only on a checkout you trust. It does not run in CI. Raw
results land in `evals/results/`, which git ignores.
