---
name: agent-rules
description: Use when writing, reviewing, or setting up rules for coding agents - AGENTS.md, CLAUDE.md, path-scoped rules such as .claude/rules or Cursor rules - or deciding where a rule, procedure, or explanation should live, or when asked to remember a rule or decision. Puts principles in AGENTS.md, procedures in skills, explanations in docs.
---

# Agent rules

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Every line an agent loads costs context on every task that loads it. Put each rule where it is
loaded only when it is needed, and nowhere else.

## Where each thing goes

| What                                                    | Where                         | Loaded                              |
| ------------------------------------------------------- | ----------------------------- | ----------------------------------- |
| A principle that holds for all work in a directory      | `AGENTS.md` in that directory | Always, for work there              |
| A procedure or set of rules one kind of task needs      | A skill                       | On demand, when its trigger fits    |
| How a system works, why it is built so, and its gotchas | A docs page                   | When a link or a person leads to it |
| A rule a machine can check                              | A lint rule or CI check       | On every change, without fail       |
| What the code, schema, or configuration already shows   | Nowhere                       | Read from the source                |

- **A skill** holds what one kind of work needs. For writing or reviewing one, use the
  `skill-authoring` skill.
- **Docs** are for people first: a wiki that explains how a system works. Lead with tables and
  Mermaid diagrams, and spend the prose on why a design was chosen and on gotchas a reader would
  not guess. For what belongs in a document, use the `documentation` skill; for how to structure
  one, use `technical-writing`.
- **Do not copy what the code shows into rules or written docs.** File lists, function
  signatures, configuration values, and dependency lists drift the day they are copied. Name the
  setting, or the folder that holds it, and let the reader open it. Reference docs that users need,
  such as an API reference, are generated from the source.
- **Enforce what you can.** A rule in prose is advice an agent may miss. When a pattern can be
  detected, add the check (see `static-analysis-checklist`) and keep at most one line in
  `AGENTS.md` that names it.

## AGENTS.md and CLAUDE.md

- `AGENTS.md` holds short, imperative principles. Give it a size budget and enforce it with a
  check, as for any limit. Move anything only some tasks need into a skill, and anything that
  explains into docs.
- Scope a rule to the directory it governs with a nested `AGENTS.md`; this is the only home for a
  path-scoped rule. A nested file adds to its parent and never repeats it. It scopes by directory,
  not by file pattern, so a rule for only some files in a directory says which ones.
- The most specific instruction wins: a nested `AGENTS.md` over the root one, and the
  repository's files over a shared skill. A person's direct instruction overrides them all. Say so
  in a shared skill, so it defers to the repository.
- Write rules in portable files: `AGENTS.md`, skills, and docs. Do not put rules in one
  harness's own rule format, such as Claude Code's `.claude/rules/` or Cursor-only rules; another
  agent never sees them.
- When a harness reads only its own file name, such as `CLAUDE.md`, make that file a symlink to
  `AGENTS.md` or a one-line import of it, beside every `AGENTS.md`, nested ones included. Never
  keep two copies.
- When one agent hands work to another, name the `AGENTS.md` files and skills to read instead of
  retyping their rules. A retyped rule is a second copy that drifts.

## Links

- Link each docs page from the `AGENTS.md` or skill of the area it explains, with one line that
  says when to read it. An unlinked page is never read by an agent.
- Check links in CI, for example with `lychee`, so a moved or deleted page fails the build
  instead of leaving a dead pointer.
- Link a document instead of copying it. State each rule once and link to it from elsewhere.

## Capture decisions

- When a decision reached with a person will come up again, encode it where it is shared:
  `AGENTS.md`, a skill, docs, or a check. Report where you put it; do not ask first (see
  `deciding-or-asking`).
- Do not keep a principle, or a repository or global rule, only in an agent's memory. Memory
  belongs to one agent on one machine; other agents, other people, and CI never see it. Write the
  rule where it is shared, and keep memory for personal preferences and pointers.

## Writing a rule

- Do not guess at a rule a person stated. Ask until you understand it. Think through the cases they
  have not considered, and ask about those too. Then write the rule concisely and correctly, and
  show them the wording. When they cannot be asked now, write only what you understand and list the
  open questions with it. An exception, a reason, or a scope you add without asking is your reading
  of what they meant, and the next agent follows it as theirs. Mark it as yours wherever you write
  it down, above all in memory.
- Write what to do, with the reason when it is not obvious. A reader who knows the reason can
  handle the case the rule did not foresee.
- Write the rule, not the incident that produced it. The story belongs in the commit or the
  issue.
- Prefer one short example to a paragraph of description.
- State the principle, not a number that drifts; see the `documentation` skill.
- Point at folders, commands, and symbols, not line numbers or files. A line number is wrong
  after the next edit, and a file path breaks on a rename. When a rule must name a path, change
  the rule in the same change that moves it.
- Leave out private detail, as in any document.

## Review

Ask of a change to agent rules:

- Is anything in `AGENTS.md` needed only by some tasks? Move it to a skill.
- Does any file restate what the code shows? Delete it and point at the source.
- Could a check enforce this rule instead of prose?
- Is any rule in a harness-specific file, or copied into two files?
- Is every new docs page linked from where an agent will look, and is the link checked?
- Does any rule hold a number that will drift (`documentation`)?
- Was a decision from this work saved only to memory?
- Is a new or changed skill reviewed with `skill-authoring`?
