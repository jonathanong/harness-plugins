# Ratchet stack

The `ratchet-stack` marketplace of agent plugins for Claude Code and Codex. Add the marketplace
once, then install any plugin from it.

## Plugins

| Plugin                                                                                              | What it does                                                                                                |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [ratchet-workflows](plugins/ratchet-workflows)                                                      | How an agent works on a task: planning, deciding or asking, debugging, review, status, docs, and evals.     |
| [ratchet-github](plugins/ratchet-github)                                                            | Git and GitHub work: commits, pull requests, issues, Actions, CI, Dependabot, and repository settings.      |
| [ratchet-backend](plugins/ratchet-backend)                                                          | Backend design: PostgreSQL, migrations, lists and loops, queues, HTTP APIs, webhooks, errors, and logging.  |
| [ratchet-code](plugins/ratchet-code)                                                                | Writing code and its checks: TypeScript, Rust, React and native apps, tests, packages, and static analysis. |
| [no-mistakes](https://github.com/jongleberry/no-mistakes)                                           | Answers how code connects from the import graph: what uses a symbol, which tests to run.                    |
| [no-mistakes-rules](https://github.com/jongleberry/no-mistakes/tree/main/plugins/no-mistakes-rules) | MUST NOT / SHOULD NOT rule skills that `no-mistakes` checks against.                                        |
| [pr-shepherd](https://github.com/jongleberry/pr-shepherd)                                           | Takes a pull request through CI, review comments, and merge.                                                |
| [service-status](https://github.com/jongleberry/service-status)                                     | Tells an agent when a failure is a third-party outage and not its bug.                                      |
| [hook-harness](https://github.com/jongleberry/hook-harness)                                         | Turns GitHub events into agent runs.                                                                        |
| [agent-blackboard](https://github.com/jongleberry/agent-blackboard)                                 | Records agent telemetry so agents can improve from their own sessions.                                      |
| [code-reviewer](https://github.com/jongleberry/code-reviewer)                                       | Standing multi-pillar code reviewer with label intake and follow-up reviews.                                |

The four `ratchet-*` plugins are generic skills and live in this repository; their skills are
listed [below](#skills). Each other plugin lives in its own repository, and the marketplace points
at it.

## Install

Claude Code:

```bash
claude plugin marketplace add jongleberry/ratchet-stack
claude plugin install ratchet-workflows@ratchet-stack
claude plugin install pr-shepherd@ratchet-stack
```

Codex:

```bash
codex plugin marketplace add jongleberry/ratchet-stack --ref main
codex plugin add ratchet-workflows@ratchet-stack
codex plugin add pr-shepherd@ratchet-stack
```

A plugin whose manifest sets no `version`, such as the `ratchet-*` plugins, has no releases to track: Claude
Code treats each commit on its `main` as an update. A plugin whose manifest sets a `version`
updates only when its repository releases a new version. Codex picks up changes when you run
`codex plugin marketplace upgrade ratchet-stack`.

## Skills

Generic agent skills that explain a design or a procedure. A skill may say which approach to pick
and why. It holds no organization-specific policy; a consuming repository adds its own rules on
top, in its `AGENTS.md`. Install only the plugins whose work you do: an agent keeps the description
of every installed skill in context. A skill loads as `<plugin>:<skill>`, for example
`ratchet-github:dependabot`.

### ratchet-workflows

How an agent works on a task: planning, deciding or asking, debugging, review, status, docs, and evals.

| Skill                                                                                    | Use it when                                                                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`agent-coordination`](plugins/ratchet-workflows/skills/agent-coordination/SKILL.md)     | Delegating to workers and handling messages from other agents.                       |
| [`agent-rules`](plugins/ratchet-workflows/skills/agent-rules/SKILL.md)                   | Deciding what goes in `AGENTS.md`, a skill, docs, or a check.                        |
| [`change-review`](plugins/ratchet-workflows/skills/change-review/SKILL.md)               | Reviewing a change and verifying a finding before acting on it.                      |
| [`debugging`](plugins/ratchet-workflows/skills/debugging/SKILL.md)                       | Finding the cause of a failure before changing code.                                 |
| [`deciding-or-asking`](plugins/ratchet-workflows/skills/deciding-or-asking/SKILL.md)     | Taking a settled choice without asking, and asking only about what cannot be undone. |
| [`documentation`](plugins/ratchet-workflows/skills/documentation/SKILL.md)               | Deciding what goes in docs and code comments.                                        |
| [`evals`](plugins/ratchet-workflows/skills/evals/SKILL.md)                               | Choosing kinds of eval, and documenting scores, run history, and rules.              |
| [`implementing-changes`](plugins/ratchet-workflows/skills/implementing-changes/SKILL.md) | Fixing or building a change, and the checks before handing it off.                   |
| [`planning`](plugins/ratchet-workflows/skills/planning/SKILL.md)                         | Planning a non-trivial change: impact, verification, a handoff plan.                 |
| [`resuming-work`](plugins/ratchet-workflows/skills/resuming-work/SKILL.md)               | Picking up work after an interruption, and leaving it resumable.                     |
| [`revisit-followups`](plugins/ratchet-workflows/skills/revisit-followups/SKILL.md)       | Sweeping merged work for deferred follow-ups that are still needed.                  |
| [`skill-authoring`](plugins/ratchet-workflows/skills/skill-authoring/SKILL.md)           | Writing a skill: description, body, references, splitting, and evals.                |
| [`status-reports`](plugins/ratchet-workflows/skills/status-reports/SKILL.md)             | Writing a status or handoff note: checked claims, who is affected, who decided.      |
| [`technical-writing`](plugins/ratchet-workflows/skills/technical-writing/SKILL.md)       | Structuring a document for scanning: summary first, audiences, facts, terms.         |

### ratchet-github

Git and GitHub work: commits, pull requests, issues, Actions, CI, Dependabot, and repository settings.

| Skill                                                                                             | Use it when                                                                                                              |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`dependabot`](plugins/ratchet-github/skills/dependabot/SKILL.md)                                 | Configuring Dependabot coverage, grouping, cooldowns, secrets, and runs.                                                 |
| [`git-commit-checklist`](plugins/ratchet-github/skills/git-commit-checklist/SKILL.md)             | Committing, and rebasing or force-pushing a branch others also push to.                                                  |
| [`github-actions-authoring`](plugins/ratchet-github/skills/github-actions-authoring/SKILL.md)     | Writing workflows: events not polling, triggers, timeouts, runners, pins, job size.                                      |
| [`github-ci-operations`](plugins/ratchet-github/skills/github-ci-operations/SKILL.md)             | CI that is slow, queued, or costly: measuring, runner limits, a backlog, which runs to cancel, with tested scripts.      |
| [`github-issue`](plugins/ratchet-github/skills/github-issue/SKILL.md)                             | Filing, organizing, labeling, closing, and linking GitHub issues, with a high bar for new labels.                        |
| [`github-repository-settings`](plugins/ratchet-github/skills/github-repository-settings/SKILL.md) | Limiting pull requests to collaborators, gating outside contributors' CI, and auditing labels, milestones, and projects. |
| [`pr-description`](plugins/ratchet-github/skills/pr-description/SKILL.md)                         | Writing a pull request description: problem, change, impact, before/after.                                               |
| [`pull-requests`](plugins/ratchet-github/skills/pull-requests/SKILL.md)                           | Scoping, stacking, answering review on, finishing, and merging pull requests.                                            |
| [`review-ci-logs`](plugins/ratchet-github/skills/review-ci-logs/SKILL.md)                         | Diagnosing a CI failure or noisy CI output from the logs.                                                                |
| [`triage-codex-security`](plugins/ratchet-github/skills/triage-codex-security/SKILL.md)           | Triaging Codex Security findings into explicitly approved actions.                                                       |
| [`upstream-contributions`](plugins/ratchet-github/skills/upstream-contributions/SKILL.md)         | Contributing to a repository you do not own: its rules first, its templates, and a pull request in the fork too.         |

### ratchet-backend

Backend design: PostgreSQL, migrations, lists and loops, queues, HTTP APIs, webhooks, errors, and logging.

| Skill                                                                                                          | Use it when                                                                                       |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [`bounded-iteration`](plugins/ratchet-backend/skills/bounded-iteration/SKILL.md)                               | Writing a sweep, backfill, dispatcher, or export that must stay bounded.                          |
| [`error-handling`](plugins/ratchet-backend/skills/error-handling/SKILL.md)                                     | Throwing, matching, and reporting errors: codes, attributes, and a tracker.                       |
| [`expand-contract-migrations`](plugins/ratchet-backend/skills/expand-contract-migrations/SKILL.md)             | Renaming or dropping a column, table, or field without a deploy-time break.                       |
| [`feature-rollout`](plugins/ratchet-backend/skills/feature-rollout/SKILL.md)                                   | Adding a feature flag, or a table or service that needs an entry point.                           |
| [`glide-mq`](plugins/ratchet-backend/skills/glide-mq/SKILL.md)                                                 | Designing glide-mq queues, lanes, concurrency, rate limits, and leases.                           |
| [`http-api-design`](plugins/ratchet-backend/skills/http-api-design/SKILL.md)                                   | Shaping an HTTP API: resources, thin handlers, identifiers, secrets.                              |
| [`list-reads`](plugins/ratchet-backend/skills/list-reads/SKILL.md)                                             | Writing a list endpoint, feed, or paginated query.                                                |
| [`llm-calls`](plugins/ratchet-backend/skills/llm-calls/SKILL.md)                                               | Calling a language model: one call per decision, untrusted content in prompts, tools.             |
| [`postgres-locking`](plugins/ratchet-backend/skills/postgres-locking/SKILL.md)                                 | When PostgreSQL code may take a lock, and what to use instead.                                    |
| [`postgres-node-performance-tuning`](plugins/ratchet-backend/skills/postgres-node-performance-tuning/SKILL.md) | Writing or tuning a query: shape, indexes, plans, round trips.                                    |
| [`postgres-partitioning-uuid-v7`](plugins/ratchet-backend/skills/postgres-partitioning-uuid-v7/SKILL.md)       | Partitioning and pruning a table keyed by UUIDv7.                                                 |
| [`postgres-schema-design`](plugins/ratchet-backend/skills/postgres-schema-design/SKILL.md)                     | Designing tables, relations, history, and retention, simplest design first.                       |
| [`service-boundaries`](plugins/ratchet-backend/skills/service-boundaries/SKILL.md)                             | Calling another service or a partner API, or handling a webhook.                                  |
| [`structured-logging`](plugins/ratchet-backend/skills/structured-logging/SKILL.md)                             | Writing log lines with a static message and structured fields.                                    |
| [`webhooks`](plugins/ratchet-backend/skills/webhooks/SKILL.md)                                                 | Receiving or sending webhooks: signatures, replay, duplicates, order, retries, and customer URLs. |

### ratchet-code

Writing code and its checks: TypeScript, Rust, React and native apps, tests, packages, and static analysis.

| Skill                                                                                         | Use it when                                                                               |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`lint-rule-authoring`](plugins/ratchet-code/skills/lint-rule-authoring/SKILL.md)             | Writing the code of a lint rule or AST check: bindings, untraceable names, fixtures.      |
| [`native-app-architecture`](plugins/ratchet-code/skills/native-app-architecture/SKILL.md)     | Structuring a native app around a portable core with thin views.                          |
| [`npm-publishing`](plugins/ratchet-code/skills/npm-publishing/SKILL.md)                       | A first npm publish, trusted publishing, and a release workflow that bumps and publishes. |
| [`package-json-checklist`](plugins/ratchet-code/skills/package-json-checklist/SKILL.md)       | Changing `package.json`, a lockfile, or a package entry point.                            |
| [`playwright-authoring`](plugins/ratchet-code/skills/playwright-authoring/SKILL.md)           | Writing browser tests: what needs a browser, locators, and test ids.                      |
| [`react-app-structure`](plugins/ratchet-code/skills/react-app-structure/SKILL.md)             | Structuring API calls, links, redirects, and config in a React app.                       |
| [`rust-authoring`](plugins/ratchet-code/skills/rust-authoring/SKILL.md)                       | Laying out Rust tests and caches, and running heavy cargo builds.                         |
| [`static-analysis-checklist`](plugins/ratchet-code/skills/static-analysis-checklist/SKILL.md) | Adding or changing one static-analysis invariant.                                         |
| [`static-code-analysis`](plugins/ratchet-code/skills/static-code-analysis/SKILL.md)           | Creating a repository: which static checks to add and how strict to start.                |
| [`test-authoring`](plugins/ratchet-code/skills/test-authoring/SKILL.md)                       | Which tests to write; fixtures, mocks, guards; Vitest, Storybook, Swift, .NET.            |
| [`typescript-authoring`](plugins/ratchet-code/skills/typescript-authoring/SKILL.md)           | Writing TypeScript without aliases, shims, or hidden calls.                               |

### Evals

Every skill has [eval cases](evals) run with
[`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals), with and without the plugin.

<!-- evals:headline -->

- **174 cases** across 51 skills.
- **With the plugin:** mean score 0.91.
- **Without it:** mean score 0.36, over the 172 cases measured both ways.
- **136 cases** are ones the model fails unaided. The other 36 it already gets right: 7 check that a skill stays out of the way, and 29 show at most that the skill loads.
- **164 of 174 cases** meet their target: critical 3 of 3, high 25 of 25, medium 114 of 122, low 22 of 24. The rows come from different runs, and a row with fewer attempts than planned stopped early: read it as a verdict, not a rate.
- **Loading** is counted for every case of 49 of 51 skills, and 36 of those load in at least 80% of attempts. For 2 more it is counted for some cases only, which does not show the skill meets the target. Under it on what was counted: `agent-coordination`, `debugging`, `deciding-or-asking`, `implementing-changes`, `llm-calls`, `planning`, `postgres-node-performance-tuning`, `pull-requests`, `resuming-work`, `review-ci-logs`, `service-boundaries`, `skill-authoring`, `status-reports`, `typescript-authoring`.

<!-- /evals:headline -->

All but two of these scores were measured when the skills were one plugin, and have not been
re-measured since the split into four. The exceptions are the newest `npm-publishing` and
`postgres-schema-design` cases.

Scores by skill are in [`evals/README.md`](evals/README.md), every case in
[`evals/EVALS.md`](evals/EVALS.md), the run log in [`evals/HISTORY.md`](evals/HISTORY.md), and
planned work in [`ROADMAP.md`](ROADMAP.md).

## License

[MIT](LICENSE)
