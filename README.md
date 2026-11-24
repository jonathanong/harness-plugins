# Harness plugins

The `harness-plugins` marketplace of agent plugins for Claude Code and Codex. Add the marketplace
once, then install any plugin from it.

## Plugins

| Plugin                                                                                              | What it does                                                                             |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [jong-skills](skills)                                                                               | Generic skills that explain a design or a procedure; listed [below](#jong-skills).       |
| [no-mistakes](https://github.com/jonathanong/no-mistakes)                                           | Answers how code connects from the import graph: what uses a symbol, which tests to run. |
| [no-mistakes-rules](https://github.com/jonathanong/no-mistakes/tree/main/plugins/no-mistakes-rules) | MUST NOT / SHOULD NOT rule skills that `no-mistakes` checks against.                     |
| [pr-shepherd](https://github.com/jonathanong/pr-shepherd)                                           | Takes a pull request through CI, review comments, and merge.                             |
| [service-status](https://github.com/jonathanong/service-status)                                     | Tells an agent when a failure is a third-party outage and not its bug.                   |
| [hook-harness](https://github.com/jonathanong/hook-harness)                                         | Turns GitHub events into agent runs.                                                     |
| [agent-blackboard](https://github.com/jonathanong/agent-blackboard)                                 | Records agent telemetry so agents can improve from their own sessions.                   |
| [code-reviewer](https://github.com/jonathanong/code-reviewer)                                       | Standing multi-pillar code reviewer with label intake and follow-up reviews.             |

`jong-skills` lives in this repository. Each other plugin lives in its own repository, and the
marketplace points at it.

## Install

Claude Code:

```bash
claude plugin marketplace add jonathanong/harness-plugins
claude plugin install jong-skills@harness-plugins
claude plugin install pr-shepherd@harness-plugins
```

Codex:

```bash
codex plugin marketplace add jonathanong/harness-plugins --ref main
codex plugin add jong-skills@harness-plugins
codex plugin add pr-shepherd@harness-plugins
```

A plugin whose manifest sets no `version`, such as `jong-skills`, has no releases to track: Claude
Code treats each commit on its `main` as an update. A plugin whose manifest sets a `version`
updates only when its repository releases a new version. Codex picks up changes when you run
`codex plugin marketplace upgrade harness-plugins`.

## jong-skills

Generic agent skills that explain a design or a procedure. A skill here may say which approach to
pick and why. It holds no organization-specific policy; a consuming repository adds its own rules
on top, in its `AGENTS.md`. Skills load as `jong-skills:<skill>`, for example
`jong-skills:dependabot`.

| Skill                                                                                  | Use it when                                                                           |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`static-code-analysis`](skills/static-code-analysis/SKILL.md)                         | Creating a repository: which static checks to add and how strict to start.            |
| [`static-analysis-checklist`](skills/static-analysis-checklist/SKILL.md)               | Adding or changing one static-analysis invariant.                                     |
| [`lint-rule-authoring`](skills/lint-rule-authoring/SKILL.md)                           | Writing the code of a lint rule or AST check: bindings, untraceable names, fixtures.  |
| [`github-actions-authoring`](skills/github-actions-authoring/SKILL.md)                 | Writing workflows: events not polling, triggers, timeouts, runners, pins, job size.   |
| [`github-ci-operations`](skills/github-ci-operations/SKILL.md)                         | CI that is slow, queued, or costly: measuring, runner limits, clearing a backlog.     |
| [`dependabot`](skills/dependabot/SKILL.md)                                             | Configuring Dependabot coverage, grouping, cooldowns, secrets, and runs.              |
| [`github-repository-settings`](skills/github-repository-settings/SKILL.md)             | Limiting pull requests to collaborators and gating outside contributors' CI.          |
| [`package-json-checklist`](skills/package-json-checklist/SKILL.md)                     | Changing `package.json`, a lockfile, or a package entry point.                        |
| [`npm-publishing`](skills/npm-publishing/SKILL.md)                                     | Preparing a first npm publish, trusted publishing, and the release workflow.          |
| [`triage-codex-security`](skills/triage-codex-security/SKILL.md)                       | Triaging Codex Security findings into explicitly approved actions.                    |
| [`postgres-schema-design`](skills/postgres-schema-design/SKILL.md)                     | Designing tables, relations, history, and retention.                                  |
| [`postgres-locking`](skills/postgres-locking/SKILL.md)                                 | When PostgreSQL code may take a lock, and what to use instead.                        |
| [`postgres-node-performance-tuning`](skills/postgres-node-performance-tuning/SKILL.md) | Writing or tuning a query: shape, indexes, plans, round trips.                        |
| [`postgres-partitioning-uuid-v7`](skills/postgres-partitioning-uuid-v7/SKILL.md)       | Partitioning and pruning a table keyed by UUIDv7.                                     |
| [`bounded-iteration`](skills/bounded-iteration/SKILL.md)                               | Writing a sweep, backfill, dispatcher, or export that must stay bounded.              |
| [`list-reads`](skills/list-reads/SKILL.md)                                             | Writing a list endpoint, feed, or paginated query.                                    |
| [`glide-mq`](skills/glide-mq/SKILL.md)                                                 | Designing glide-mq queues, lanes, concurrency, rate limits, and leases.               |
| [`evals`](skills/evals/SKILL.md)                                                       | Choosing kinds of eval, and documenting scores, run history, and rules.               |
| [`error-handling`](skills/error-handling/SKILL.md)                                     | Throwing, matching, and reporting errors: codes, attributes, and a tracker.           |
| [`pr-description`](skills/pr-description/SKILL.md)                                     | Writing a pull request description: problem, change, impact, before/after.            |
| [`pull-requests`](skills/pull-requests/SKILL.md)                                       | Scoping, stacking, answering review on, finishing, and merging pull requests.         |
| [`documentation`](skills/documentation/SKILL.md)                                       | Deciding what goes in docs and code comments.                                         |
| [`agent-rules`](skills/agent-rules/SKILL.md)                                           | Deciding what goes in `AGENTS.md`, a skill, docs, or a check.                         |
| [`skill-authoring`](skills/skill-authoring/SKILL.md)                                   | Writing a skill: description, body, references, splitting, and evals.                 |
| [`technical-writing`](skills/technical-writing/SKILL.md)                               | Structuring a document for scanning: summary first, audiences, facts, terms.          |
| [`test-authoring`](skills/test-authoring/SKILL.md)                                     | Which tests to write; fixtures, mocks, guards; Vitest, Storybook, Swift, .NET.        |
| [`playwright-authoring`](skills/playwright-authoring/SKILL.md)                         | Writing browser tests: what needs a browser, locators, and test ids.                  |
| [`typescript-authoring`](skills/typescript-authoring/SKILL.md)                         | Writing TypeScript without aliases, shims, or hidden calls.                           |
| [`react-app-structure`](skills/react-app-structure/SKILL.md)                           | Structuring API calls, links, redirects, and config in a React app.                   |
| [`native-app-architecture`](skills/native-app-architecture/SKILL.md)                   | Structuring a native app around a portable core with thin views.                      |
| [`rust-authoring`](skills/rust-authoring/SKILL.md)                                     | Laying out Rust tests and caches, and running heavy cargo builds.                     |
| [`http-api-design`](skills/http-api-design/SKILL.md)                                   | Shaping an HTTP API: resources, thin handlers, identifiers, secrets.                  |
| [`service-boundaries`](skills/service-boundaries/SKILL.md)                             | Calling another service or a partner API, or handling a webhook.                      |
| [`feature-rollout`](skills/feature-rollout/SKILL.md)                                   | Adding a feature flag, or a table or service that needs an entry point.               |
| [`expand-contract-migrations`](skills/expand-contract-migrations/SKILL.md)             | Renaming or dropping a column, table, or field without a deploy-time break.           |
| [`structured-logging`](skills/structured-logging/SKILL.md)                             | Writing log lines with a static message and structured fields.                        |
| [`agent-workflow`](skills/agent-workflow/SKILL.md)                                     | Implementing, gathering evidence, handing off, and reviewing a change.                |
| [`planning`](skills/planning/SKILL.md)                                                 | Planning a non-trivial change: impact, verification, a handoff plan.                  |
| [`git-commit-checklist`](skills/git-commit-checklist/SKILL.md)                         | Committing, and rebasing or force-pushing a branch others also push to.               |
| [`github-issue`](skills/github-issue/SKILL.md)                                         | Filing, editing, closing, and linking GitHub issues.                                  |
| [`review-ci-logs`](skills/review-ci-logs/SKILL.md)                                     | Diagnosing a CI failure or noisy CI output from the logs.                             |
| [`debugging`](skills/debugging/SKILL.md)                                               | Finding the cause of a failure before changing code.                                  |
| [`verification`](skills/verification/SKILL.md)                                         | Checking a claim against observed results before reporting it.                        |
| [`resuming-work`](skills/resuming-work/SKILL.md)                                       | Picking up work after an interruption, and leaving it resumable.                      |
| [`agent-coordination`](skills/agent-coordination/SKILL.md)                             | Delegating to workers and handling messages from other agents.                        |
| [`llm-calls`](skills/llm-calls/SKILL.md)                                               | Calling a language model: one call per decision, untrusted content in prompts, tools. |
| [`revisit-followups`](skills/revisit-followups/SKILL.md)                               | Sweeping merged work for deferred follow-ups that are still needed.                   |

### Evals

Every skill has [eval cases](evals) run with
[`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals), with and without the plugin.

<!-- evals:headline -->

- **144 cases** across 47 skills.
- **With the plugin:** mean score 0.95.
- **Without it:** mean score 0.33, over the 143 cases measured both ways.
- **113 cases** are ones the model fails unaided. The other 30 it already gets right: 5 check that a skill stays out of the way, and 25 show at most that the skill loads.

<!-- /evals:headline -->

Scores by skill are in [`evals/README.md`](evals/README.md), every case in
[`evals/EVALS.md`](evals/EVALS.md), the run log in [`evals/HISTORY.md`](evals/HISTORY.md), and
planned work in [`ROADMAP.md`](ROADMAP.md).

## License

[MIT](LICENSE)
