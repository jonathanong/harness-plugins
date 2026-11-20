# Harness plugins

Generic agent skills that explain a design or a procedure. A skill here may say which approach to
pick and why. It holds no organization-specific policy; a consuming repository adds its own rules
on top, in its `AGENTS.md`.

The repository is one plugin, `jong-skills`, for both Claude Code and Codex. Skills load as
`jong-skills:<skill>`, for example `jong-skills:dependabot`.

## Harness plugins

| Skill                              | Use it when                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `static-code-analysis`             | Creating a repository: which static checks to add and how strict to start.     |
| `static-analysis-checklist`        | Adding or changing one static-analysis invariant.                              |
| `github-actions-authoring`         | Writing workflows: events not polling, triggers, timeouts, runners, pins.      |
| `dependabot`                       | Configuring Dependabot coverage, grouping, cooldowns, secrets, and runs.       |
| `github-repository-settings`       | Limiting pull requests to collaborators and gating outside contributors' CI.   |
| `package-json-checklist`           | Changing `package.json`, a lockfile, or a package entry point.                 |
| `npm-publishing`                   | Preparing a first npm publish, trusted publishing, and the release workflow.   |
| `triage-codex-security`            | Triaging Codex Security findings into explicitly approved actions.             |
| `postgres-schema-design`           | Designing tables, relations, history, retention, and row locking.              |
| `postgres-node-performance-tuning` | Writing or tuning a query: shape, indexes, plans, round trips.                 |
| `postgres-partitioning-uuid-v7`    | Partitioning and pruning a table keyed by UUIDv7.                              |
| `bounded-iteration`                | Writing a sweep, backfill, dispatcher, or list read that must stay bounded.    |
| `glide-mq`                         | Designing glide-mq queues, lanes, concurrency, rate limits, and leases.        |
| `evals`                            | Documenting an eval suite: current scores, run history, and rules.             |
| `pr-description`                   | Writing a pull request description: problem, change, impact, before/after.     |
| `documentation`                    | Deciding what goes in docs, comments, and agent instruction files.             |
| `test-authoring`                   | Which tests to write; fixtures, mocks, guards; Vitest, Storybook, Swift, .NET. |
| `playwright-authoring`             | Writing browser tests: what needs a browser, locators, and test ids.           |
| `typescript-authoring`             | Writing TypeScript without aliases, shims, or hidden calls.                    |
| `react-app-structure`              | Structuring API calls, links, redirects, and config in a React app.            |
| `native-app-architecture`          | Structuring a native app around a portable core with thin views.               |
| `rust-authoring`                   | Laying out Rust tests and caches, and running heavy cargo builds.              |
| `http-api-design`                  | Shaping an HTTP API: resources, thin handlers, identifiers, secrets.           |
| `service-boundaries`               | Calling another service or a partner API, or handling a webhook.               |
| `feature-rollout`                  | Adding a feature flag, or a table or service that needs an entry point.        |
| `structured-logging`               | Writing log lines with a static message and structured fields.                 |
| `agent-workflow`                   | Implementing, handing off, reviewing, and answering review comments.           |
| `planning`                         | Planning a change: options, what it touches, steps, where the plan lives.      |
| `git-commit-checklist`             | Committing, and rebasing or force-pushing a branch others also push to.        |
| `github-issue`                     | Filing, editing, closing, and linking GitHub issues.                           |
| `review-ci-logs`                   | Diagnosing a CI failure or noisy CI output from the logs.                      |
| `revisit-followups`                | Sweeping merged work for deferred follow-ups that are still needed.            |

## Install

Claude Code:

```bash
claude plugin marketplace add jonathanong/harness-plugins
claude plugin install jong-skills@harness-plugins
```

Inside a session, `/plugin install jong-skills --marketplace jonathanong/harness-plugins` does both steps.

Codex:

```bash
codex plugin marketplace add jonathanong/harness-plugins --ref main
codex plugin add jong-skills@harness-plugins
```

The manifests set no `version`, so there are no releases to track. Claude Code treats each commit
on `main` as an update. Codex picks up new commits when you run
`codex plugin marketplace upgrade harness-plugins`.

Moving from the old name: this plugin was `skills@jonathanong-skills`, from the repository
`jonathanong/skills`. Remove the old plugin and marketplace, then install as above:

```bash
claude plugin uninstall skills@jonathanong-skills
claude plugin marketplace remove jonathanong-skills
codex plugin remove skills@jonathanong-skills
codex plugin marketplace remove jonathanong-skills
```

Skills now load as `jong-skills:<skill>`, not `skills:<skill>`, so update any instruction file or
setting that names a skill with the old prefix.

## Layout

```
.claude-plugin/     Claude Code plugin and marketplace manifests
.codex-plugin/      Codex plugin manifest
.agents/plugins/    Codex marketplace manifest
plugin.json         Open plugin manifest
skills/<skill>/     SKILL.md and its references
evals/<skill>/      Eval cases for that skill, one directory per case
evals/README.md     Current eval scores and what each case checks
AGENTS.md           Rules for contributors and agents, including the skill size limit
```

To add a skill, create `skills/<skill>/SKILL.md` and at least one case under `evals/<skill>/` that
asserts the skill fired. Keep `SKILL.md` to 150 lines and put detail in `references/`.
`pnpm run evals:check` enforces both, and CI runs it. See [`AGENTS.md`](AGENTS.md).

## Evals

Every skill has eval cases run with [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals).
The current scores and what each case checks are in [`evals/README.md`](evals/README.md). The run
log is in [`evals/HISTORY.md`](evals/HISTORY.md), and the rules for cases are in
[`evals/AGENTS.md`](evals/AGENTS.md).

```bash
pnpm run evals                  # every skill
pnpm run evals npm-publishing   # one skill
```

## Development

```bash
pnpm install
pnpm run lint
pnpm run format:check
pnpm run evals:check
pnpm run marketplace:check
```

## Other plugins in this marketplace

The `harness-plugins` marketplace also lists these plugins. Each lives in its own repository, and the
marketplace points at it, so add the marketplace once and install any of them the same way:

```bash
claude plugin install pr-shepherd@harness-plugins
codex plugin add pr-shepherd@harness-plugins
```

| Plugin                                                              | What it does                                                                             |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [no-mistakes](https://github.com/jonathanong/no-mistakes)           | Answers how code connects from the import graph: what uses a symbol, which tests to run. |
| `no-mistakes-rules` (same repository)                               | MUST NOT / SHOULD NOT rule skills that `no-mistakes` checks against.                     |
| [pr-shepherd](https://github.com/jonathanong/pr-shepherd)           | Takes a pull request through CI, review comments, and merge.                             |
| [service-status](https://github.com/jonathanong/service-status)     | Tells an agent when a failure is a third-party outage and not its bug.                   |
| [hook-harness](https://github.com/jonathanong/hook-harness)         | Turns GitHub events into agent runs.                                                     |
| [agent-blackboard](https://github.com/jonathanong/agent-blackboard) | Records agent telemetry so agents can improve from their own sessions.                   |
| [code-reviewer](https://github.com/jonathanong/code-reviewer)       | Standing multi-pillar code reviewer with label intake and follow-up reviews.             |

If you added one of these repositories as its own marketplace, remove that marketplace and reinstall
the plugin from `harness-plugins`, for example
`claude plugin marketplace remove pr-shepherd` and `codex plugin marketplace remove pr-shepherd`.

## License

[MIT](LICENSE)
