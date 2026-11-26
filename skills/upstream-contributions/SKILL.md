---
name: upstream-contributions
description: Use when opening a pull request or an issue in a repository you do not own - an open-source project, an upstream, or any repository reached through a fork - or when asked to "send this upstream". Read the project's contribution rules first and stop when they say to, fill in its templates, and open and watch a pull request in the fork alongside the upstream one.
---

# Contributing to a repository you do not own

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

A maintainer owes an outside contributor nothing, and reads a pull request that ignores the
project's rules as a cost. Follow their process, not yours. What the description says is in
`pr-description`; scoping and review rounds are in `pull-requests`.

## Read the project's rules before opening anything

Read these in the upstream repository, at its default branch, before you open a pull request or
an issue:

- `CONTRIBUTING.md`, in the root, `docs/`, or `.github/`, and the contributing section of the
  README.
- `AGENTS.md`, `CLAUDE.md`, and any policy on AI-written or automated contributions.
- The pull request and issue templates: `.github/PULL_REQUEST_TEMPLATE.md`, the
  `.github/PULL_REQUEST_TEMPLATE/` and `.github/ISSUE_TEMPLATE/` directories.
- `CODE_OF_CONDUCT.md`, `SECURITY.md` when the change is a security fix, and any sign-off or
  contributor agreement the project requires.

Then do what they say: an issue before a pull request, a commit format, a sign-off line, a
changelog entry, the checks to run first.

## Stop when the directions tell an agent to stop

Some projects refuse contributions written by an agent, or require a person to open them, or
require an assigned issue first. When the directions say that, stop:

- Open nothing upstream: no pull request, no issue, no comment.
- Tell the person which file and line said so, and what is left for them to do, such as opening
  it themselves. Hand them the branch and a draft they can use.
- Do not look for a reading that lets you continue, and do not hide that an agent wrote the
  change. When the project asks for disclosure, disclose in the place it names.

A rule that only adds a step, such as "open an issue first", is not a stop: do the step.

## Fill in every template

- Start from the project's template, not from your own layout. A body passed on the command
  line, as with `gh pr create --body-file`, replaces the template, so copy the template's
  headings into the body yourself.
- Keep every heading and every checklist item, in order. Fill each one in. Write "Not
  applicable" with the reason instead of deleting a section.
- Tick a checkbox only for what was done and observed. Leave the others unticked and say why.
- Fit the points `pr-description` asks for into the template's sections; do not add your own
  sections above theirs.
- Leave out private names, internal links, and anything from the person's other work.

## Open a pull request in the fork as well

When the change goes upstream from a fork, open two pull requests from the same branch: one
upstream, and one in the fork against the fork's default branch.

- The fork runs your checks and your reviewers. Upstream often runs nothing until a maintainer
  approves a first-time contributor's workflows, and its review differs from yours.
- Bring the fork's default branch up to date with upstream first, so both pull requests show
  the same diff.
- Both follow the branch, so a fix for a finding from either lands in both with one push.
- Watch the two together, in one run of the repository's pull request tool when it takes
  several pull requests. Do not call the work ready on the fork's checks alone, or wait on
  upstream alone while the fork's review has findings.
- Do not merge the fork's pull request. It is there for checks and review; only the upstream
  pull request lands.
- Do not close it when upstream merges, either. First pull upstream's default branch into the
  fork's default branch, so the fork has the change the way upstream landed it. Then close the
  fork's pull requests whose change that brought in, each with a link to the upstream merge.
- When upstream declines, ask the person whether the fork should carry the change before
  closing or merging anything.
- Link each pull request from the other, and say in the fork's that upstream is the one that
  lands.
