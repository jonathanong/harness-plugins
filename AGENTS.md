# Harness plugins repository

This repository holds plugins for Claude Code and Codex. It is public. The skills plugin sits at the
repository root; each code plugin lives in its own directory under `plugins/`.

## What belongs here

- A skill explains a design or a procedure that holds in any repository. It may say which approach
  to pick and why.
- Do not add a rule that depends on one repository's tooling, file layout, service names, or
  product policy. Leave that to the consuming repository's `AGENTS.md`.
- Skills are prose only. Anything that needs code to work, such as a hook or a CLI tool, is not a
  skill: it is a code plugin in its own directory under `plugins/<plugin>/`, with its own
  manifest, tests, and 100% test coverage. A skill may tell the reader to use such a plugin. An
  MCP server or a tool with its own release cycle still belongs in its own repository. The
  scripts under `scripts/` only check and run this repository's evals.
- A code plugin holds mechanism, not policy. Rules that belong to one repository, such as protected
  paths, banned commands, and guidance text, are configuration the consuming repository supplies.
- Do not name a private organization, repository, product, or person in a skill, an eval case, a
  commit, or a pull request.

## Code plugins

- `plugins/<plugin>/` holds the plugin's `.claude-plugin/plugin.json`, its hook or command wiring,
  its source, and its tests. Register it in `.claude-plugin/marketplace.json` with
  `"source": "./plugins/<plugin>"`.
- Source is TypeScript in `.mts` files that Node 24 runs directly by stripping types. Do not add a
  build step. Use only syntax that type stripping supports: no enums, no namespaces, no
  constructor parameter properties.
- Tests are Vitest files next to the source (`*.test.mts`). Coverage is 100% for statements,
  branches, functions, and lines, enforced by `pnpm run test:coverage` and uploaded to Codecov in
  CI. Process glue under `plugins/*/bin/` is excluded and exercised by a smoke test that runs it
  as a child process.
- `oxlint` limits every file, tests included, to 200 lines. Split a test file by topic.
- Fix a false positive with a regression test that names the command it wrongly blocked.

## Skill size: progressive disclosure

An agent pays for every line of a skill it loads, so load detail only when the task needs it.

- The `description` in the frontmatter is the only part always in context. Say what the skill
  covers and when to use it ("Use when writing or reviewing ..."). Keep it under 400 characters.
- `SKILL.md` holds what every use of the skill needs: the decisions, the defaults, and the reasons.
  Keep it to 150 lines. `pnpm run evals:check` enforces that.
- Put anything only one branch of the work needs in `skills/<skill>/references/<topic>.md`: long
  examples, tables of options, per-tool or per-framework detail, step-by-step procedures. Link it
  from `SKILL.md` with one line that says when to read it.
- A reference file covers one topic. Split it when it passes about 500 lines.
- Split a skill in two when its parts are triggered by different work, such as writing tests and
  writing browser tests. Each skill then names the other for the neighboring case. Do not split a
  skill only to get under the line limit; move detail to references first.
- Do not repeat a rule in two skills. State it in the skill that owns it and link from the other.

## Writing a skill

- Start the body with "Read every applicable `AGENTS.md` first. Repository-local policy overrides
  these defaults."
- Write each rule as what to do, with the reason when it is not obvious. A reader who knows the
  reason can handle the case the rule did not foresee.
- Prefer one short example to a paragraph of description.
- Add the skill to the table in `README.md`.

## Evals

Every skill has eval cases under `evals/<skill>/`. The rules are in
[`evals/AGENTS.md`](evals/AGENTS.md). A change to a skill, a case, a grader, or a fixture updates
`evals/README.md` and `evals/HISTORY.md` in the same pull request.

## Checks

```bash
pnpm run lint
pnpm run format:check
pnpm run evals:check
pnpm run typecheck
pnpm run test:coverage
```

CI also checks every Markdown link with `lychee`.

## Pull requests

- Do not enable auto-merge in this repository, and do not add a workflow that does. Merge with a
  plain merge once checks pass.
