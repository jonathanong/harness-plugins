---
name: skill-authoring
description: Use when writing, splitting, or reviewing a skill or a plugin of skills, including its description, references, and eval cases. Covers how a description triggers loading, what stays in SKILL.md, what moves to references, and when to split a skill.
---

# Skill authoring

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

An agent pays for every line of a skill it loads, so load detail only when the task needs it. For
where a rule belongs at all (`AGENTS.md`, a skill, docs, a check), use the `agent-rules` skill.

## Description

The description is the only part of a skill that is always in context, and it decides whether the
skill loads.

- Open with when to use it ("Use when writing or reviewing ..."), then say what the skill covers.
  An agent loads a skill far more often when the trigger comes first.
- Name the plain requests that should trigger it, such as "review a diff", as well as the topic.
  People do not ask in the skill's own words.
- Keep it short, a few hundred characters. Every installed description is loaded in every
  session.
- Keep it distinct from its neighbors'. Two descriptions that overlap split the loads between
  them.

## Body

- `SKILL.md` holds what every use of the skill needs: the decisions, the defaults, and the
  reasons. Give it a line budget and enforce the budget with a check.
- Start the body by deferring to the repository: "Read every applicable `AGENTS.md` first.
  Repository-local policy overrides these defaults." A shared skill is a default, not the
  repository's policy.
- Write each rule as what to do, with the reason when it is not obvious. A reader who knows the
  reason can handle the case the rule did not foresee.
- Prefer one short example to a paragraph of description.
- Put anything only one branch of the work needs in `references/<topic>.md`: long examples,
  tables of options, per-tool or per-framework detail, step-by-step procedures. Link it from
  `SKILL.md` with one line that says when to read it.
- Give each reference file one topic, and split it when it grows past what a reader scans.

## Splitting and placing

- Split a skill in two when its parts are triggered by different work, such as writing tests and
  writing browser tests. Each skill then names the other for the neighboring case.
- Do not split a skill only to meet a limit. Move detail to references first.
- Do not repeat a rule in two skills. State it in the skill that owns it and link from the other.
- Keep generic skills in a shared plugin and a repository's own skills in that repository. A
  rule that depends on one repository's tooling, layout, or policy does not belong in a shared
  skill.
- By default a skill is prose. Where a rule needs code to work, such as a hook or a script,
  point to a tool that lives in its own repository rather than embedding the code.

## Evals

- Give a skill eval cases: one that checks it loads for the plain requests that should trigger
  it, and one that checks the answer follows its rules. For how to lay out, run, and record
  them, use the `evals` skill.
- Change a description or a rule only on evidence from those cases, measured against the old
  version in the same session.

## Review

Ask of a new or changed skill:

- Does the description open with when to use it, and name plain requests?
- Does it overlap a neighbor's description?
- Is anything in `SKILL.md` needed by only one branch? Move it to a linked reference.
- Is a rule repeated from another skill? Link the owner instead.
- Does it hold a rule that is one repository's policy?
- Is a limit stated without a check that enforces it?
- Are there cases for loading and for the rules, and did a measurement support the change?
