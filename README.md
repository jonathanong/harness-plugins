# Skills

Generic agent skills that explain a design or a procedure. A skill here may say which approach to
pick and why. It holds no organization-specific policy; a consuming repository adds its own rules
on top, in its `AGENTS.md`.

The repository is one plugin, `skills`, for both Claude Code and Codex.

## Skills

| Skill                              | Use it when                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `static-code-analysis`             | Creating a repository: which static checks to add and how strict to start.  |
| `static-analysis-checklist`        | Adding or changing one static-analysis invariant.                           |
| `github-actions-authoring`         | Designing workflows that react to events instead of polling.                |
| `dependabot`                       | Configuring Dependabot coverage, grouping, cooldowns, auto-merge, and runs. |
| `package-json-checklist`           | Changing `package.json`, a lockfile, or a package entry point.              |
| `npm-publishing`                   | Preparing a first npm publish and trusted publishing for a human to run.    |
| `triage-codex-security`            | Triaging Codex Security findings into explicitly approved actions.          |
| `postgres-schema-design`           | Designing tables, relations, history, retention, and row locking.           |
| `postgres-node-performance-tuning` | Writing or tuning a query: shape, indexes, plans, round trips.              |
| `postgres-partitioning-uuid-v7`    | Partitioning and pruning a table keyed by UUIDv7.                           |
| `bounded-iteration`                | Writing a sweep, backfill, dispatcher, or list read that must stay bounded. |
| `glide-mq`                         | Designing glide-mq queues, lanes, concurrency, rate limits, and leases.     |

## Install

Claude Code:

```bash
claude plugin marketplace add jonathanong/skills
claude plugin install skills@jonathanong-skills
```

Inside a session, `/plugin install skills --marketplace jonathanong/skills` does both steps.

Codex:

```bash
codex plugin marketplace add jonathanong/skills --ref main
codex plugin add skills@jonathanong-skills
```

## Layout

```
.claude-plugin/     Claude Code plugin and marketplace manifests
.codex-plugin/      Codex plugin manifest
.agents/plugins/    Codex marketplace manifest
plugin.json         Open plugin manifest
skills/<skill>/     SKILL.md and its references
evals/<skill>/      Eval cases for that skill, one directory per case
```

To add a skill, create `skills/<skill>/SKILL.md` and at least one case under `evals/<skill>/` that
asserts the skill fired. `pnpm run evals:check` enforces that, and CI runs it.

## Evals

The plugin carries a [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals) suite.
Every case runs with the plugin and without it, so the report shows what each skill changes.

```bash
pnpm run evals                  # every skill
pnpm run evals npm-publishing   # one skill
```

Sonnet runs the cases and Opus judges them. Override with `EVAL_MODEL`, `EVAL_JUDGE_MODEL`,
`EVAL_CONCURRENCY`, or pass extra flags in `EVAL_FLAGS`. Results land in `evals/results/`, which
git ignores.

The suite grants the agent `Bash` and runs each case's `fixture.sh` on your machine, so run it only
on a checkout you trust. Cases that guard an action grade the commands the agent attempts. Their
fixtures are synthetic and point at a dead local registry, so a failing run cannot publish.

## Development

```bash
pnpm install
pnpm run lint
pnpm run format:check
pnpm run evals:check
```

## License

[MIT](LICENSE)
