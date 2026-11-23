# Evals

**Does an agent that has this plugin follow each skill's guidance on a realistic request?**

Each case gives an agent a request a person would make, such as "review this diff", without
naming a skill. Graders check that the agent loaded the right skill and that its answer made the
decision the skill asks for. The same case run without the plugin shows whether the skill was
needed.

## Headline

<!-- evals:headline -->

- **114 cases** across 45 skills.
- **With the plugin:** mean score 0.94.
- **Without it:** mean score 0.38, over the 113 cases measured both ways.
- **86 cases** are ones the model fails unaided. The other 27 it already gets right: 5 check that a skill stays out of the way, and 22 show at most that the skill loads.

<!-- /evals:headline -->

Agent Sonnet, judge Opus, three attempts per case. A score is the share of graders that passed,
averaged over attempts.

## By skill

<!-- evals:groups -->

| Skill                              | Cases | With plugin | Without plugin | Already right unaided |
| ---------------------------------- | ----- | ----------- | -------------- | --------------------- |
| `agent-coordination`               | 1     | 0.50        | 1.00           | 1                     |
| `agent-rules`                      | 2     | 1.00        | 0.50           | 1                     |
| `agent-workflow`                   | 1     | 1.00        | 0.00           | 0                     |
| `bounded-iteration`                | 3     | 0.92        | 0.33           | 0                     |
| `debugging`                        | 2     | 0.78        | 1.00           | 2                     |
| `dependabot`                       | 4     | 1.00        | 0.50           | 1                     |
| `documentation`                    | 2     | 0.75        | 0.34           | 0                     |
| `error-handling`                   | 2     | 1.00        | 0.50           | 1                     |
| `evals`                            | 2     | 1.00        | 0.00           | 0                     |
| `expand-contract-migrations`       | 1     | 1.00        | 1.00           | 1                     |
| `feature-rollout`                  | 3     | 1.00        | 0.33           | 1                     |
| `git-commit-checklist`             | 3     | 0.94        | 0.44           | 1                     |
| `github-actions-authoring`         | 4     | 0.92        | 0.38           | 1                     |
| `github-issue`                     | 2     | 0.92        | 0.17           | 0                     |
| `github-repository-settings`       | 2     | 1.00        | 0.34           | 0                     |
| `glide-mq`                         | 5     | 1.00        | 0.33           | 1                     |
| `http-api-design`                  | 3     | 1.00        | 0.22           | 0                     |
| `list-reads`                       | 4     | 0.99        | 0.67           | 2                     |
| `llm-calls`                        | 2     | 1.00        | 0.50           | 1                     |
| `native-app-architecture`          | 2     | 1.00        | 0.00           | 0                     |
| `npm-publishing`                   | 2     | 0.97        | 0.56           | 0                     |
| `package-json-checklist`           | 2     | 0.95        | 0.67           | 0                     |
| `planning`                         | 7     | 0.92        | 0.38           | 2                     |
| `playwright-authoring`             | 2     | 1.00        | 0.00           | 0                     |
| `postgres-locking`                 | 8     | 0.96        | 0.38           | 3                     |
| `postgres-node-performance-tuning` | 3     | 0.84        | 0.00           | 0                     |
| `postgres-partitioning-uuid-v7`    | 2     | 1.00        | 0.34           | 0                     |
| `postgres-schema-design`           | 2     | 1.00        | 0.50           | 1                     |
| `pr-description`                   | 2     | 1.00        | 0.00           | 0                     |
| `pull-requests`                    | 1     | 1.00        | 0.00           | 0                     |
| `react-app-structure`              | 4     | 0.96        | 0.46           | 1                     |
| `resuming-work`                    | 1     | 0.83        | 1.00           | 1                     |
| `review-ci-logs`                   | 1     | 0.89        | 1.00           | 1                     |
| `revisit-followups`                | 1     | 0.83        | 0.00           | 0                     |
| `rust-authoring`                   | 1     | 1.00        | 0.00           | 0                     |
| `service-boundaries`               | 2     | 1.00        | 0.67           | 1                     |
| `skill-authoring`                  | 2     | 0.92        | 0.00           | 0                     |
| `static-analysis-checklist`        | 2     | 0.81        | 0.42           | 0                     |
| `static-code-analysis`             | 2     | 1.00        | 0.41           | 0                     |
| `structured-logging`               | 2     | 1.00        | 0.00           | 0                     |
| `technical-writing`                | 3     | 0.89        | 0.00           | 0                     |
| `test-authoring`                   | 6     | 0.94        | 0.50           | 2                     |
| `triage-codex-security`            | 2     | 1.00        | 0.64           | 0                     |
| `typescript-authoring`             | 3     | 1.00        | 0.00           | 0                     |
| `verification`                     | 1     | 0.50        | 1.00           | 1                     |

<!-- /evals:groups -->

## Reading the numbers

- The gap between the two columns is the result. A high score with no gap means the model does as
  well without the skill.
- Three attempts is a small sample, and the two columns often come from different days. Read a gap
  as "the model fails this unaided", not as a precise difference.
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
python3 scripts/eval-summary.py # per-case rows for EVALS.md, from evals/results/latest.json
python3 scripts/eval-docs.py    # rebuild the tables above from EVALS.md
```

The run needs Claude Code signed in, grants the agent `Bash`, and executes each case's
`fixture.sh` on your machine, so run it only on a checkout you trust. It does not run in CI. Raw
results land in `evals/results/`, which git ignores.
