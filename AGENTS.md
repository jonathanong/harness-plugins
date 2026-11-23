# Skills repository

This repository is one plugin of generic skills for Claude Code and Codex. It is public.

## What belongs here

- A skill explains a design or a procedure that holds in any repository. It may say which approach
  to pick and why.
- Do not add a rule that depends on one repository's tooling, file layout, service names, or
  product policy. Leave that to the consuming repository's `AGENTS.md`.
- This repository holds prose only. Anything that needs code to work, such as a hook, a CLI
  tool, an MCP server, or a script a skill runs, belongs in its own repository. A skill may tell
  the reader to use such a tool. The scripts under `scripts/` only check this repository's
  marketplaces and check and run its evals.
- Keep a rule even when the evals show no improvement from it. The evals run on one strong
  model, and these skills also have to work on weaker models that do not already follow the rule.
  Remove a rule because it is wrong, repeated, or one repository's policy, not because the
  current model passes without it.
- Do not name a private organization, repository, product, or person in a skill, an eval case, a
  commit, or a pull request.

## Skill size: progressive disclosure

An agent pays for every line of a skill it loads, so load detail only when the task needs it.

- The `description` in the frontmatter is the only part always in context. Open it with when to
  use it ("Use when writing or reviewing ..."), then say what the skill covers. Name the plain
  requests that should trigger it, such as a review of a diff, as well as the topic. Keep it under
  400 characters. An agent loads a skill far more often when its description opens with the
  trigger; see `evals/HISTORY.md`, 2026-11-21.
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
- A rule is for production code unless it says otherwise. When a rule also binds tests,
  fixtures, or scripts, say so in the rule. When a reviewer would likely apply a runtime rule to
  test code by mistake, say near the top of the skill what tests may do.
- Prefer one short example to a paragraph of description.
- Add the skill to the table in `README.md`.

## Evals

Every skill has eval cases under `evals/<skill>/`. The rules are in
[`evals/AGENTS.md`](evals/AGENTS.md). A change to a skill, a case, a grader, or a fixture updates
`evals/EVALS.md` and `evals/HISTORY.md` in the same pull request, and runs
`scripts/eval-docs.py` to rebuild the tables in `evals/README.md` and `README.md`.

## Checks

```bash
pnpm run lint
pnpm run format:check
pnpm run evals:check
pnpm run marketplace:check
```

`marketplace:check` checks that the Claude Code and Codex marketplaces list the same plugins, that
the README lists every plugin, and that every source resolves to a manifest
with the plugin's name. It fetches from GitHub; pass `-- --offline` to skip that part. CI also checks
every Markdown link and the marketplace URLs with `lychee`, and runs every check daily, since a
change in another repository can break a source.

## Pull requests

- Do not add a workflow that auto-merges Dependabot pull requests; a person merges each one.
  Auto-merge on other pull requests is fine.
