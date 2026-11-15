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
| `evals`                            | Documenting an eval suite: current scores, run history, and rules.          |

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
```

## License

[MIT](LICENSE)
