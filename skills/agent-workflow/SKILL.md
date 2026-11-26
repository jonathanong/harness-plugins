---
name: agent-workflow
description: Use when starting an implementation task, working unattended, or deciding whether to ask the person or go ahead. Carries a repository change from start to handoff - implement it, decide without stalling, gather evidence, and split work to run in parallel. To review a diff, use change-review; for a status or handoff note, status-reports; for an open pull request, pull-requests.
---

# Agent workflow

Read every applicable `AGENTS.md` first, from the repository root down to the files being
changed. Repository-local policy overrides these defaults. It owns branches, worktrees, the
review system, and merge policy.

Look at the checkout before starting, without discarding anything in it. Keep the scope explicit:
a blocker or a follow-up found on the way does not widen the task.

## Implement

- Before fixing code, find out why it exists: its history, callers, tests, and linked issues. A
  fix that ignores the original purpose breaks it or patches a symptom.
- If the code no longer serves a purpose, delete it with its tests, configuration, and docs
  instead of fixing it.
- Start from a failing test of the behavior when one can be written. Finish the real path. Do not
  leave a placeholder, a compatibility shim nobody asked for, or a production branch that exists
  for a test.
- When behavior changes, change the public contract, docs, fixtures, and generated artifacts that
  describe it in the same change.
- Removing a timeout or an abort bound needs a replacement on the same path, or a test showing
  every caller supplies its own.
- When changing one row of a policy table, read the sibling rows for a convention it now breaks.

## Before handoff

- Map each acceptance criterion to a focused test, an inspection, or a manual check with a
  concrete result. A skipped check is a finding: say what blocked it and what risk remains.
- When one defect is found, search sibling call sites and write sites for the same shape. Say why
  the remaining matches are safe.
- Compare the final diff with what was agreed. Check that docs, generated output, and public
  contracts agree with the code.
- Report the validation that actually ran, the open pull requests, and what is still blocked.
  What a pull request needs before it is handed off, and how to answer its review comments, is
  in the `pull-requests` skill.
- Keep large logs out of the conversation. Report bounded findings and their evidence.

## Decide, then report

Every question stops the work until a person answers. Ask only when the answer cannot be
worked out and a wrong guess cannot be undone.

- When repository policy, the request, or the evidence settles a choice, take it and say which
  one you took. A minor upgrade the policy allows, a missing index, a rebase, a stale branch to
  delete: these are not questions.
- When a choice is open but reversible, take the smallest option, record it as an **Agent:**
  decision (see `status-reports`, "Record who decided"), and continue.
- Ask before an action that is destructive or irreversible, that ships a release or spends
  money, or that is outside what was authorized. Recommend one option with the reason; do not
  list options. Ask every open question at once, and keep working on what does not depend on the
  answers.
- Filing an issue, opening a pull request, and messaging an owner are ordinary steps wherever
  the repository allows them. Being public does not make them questions.
- An instruction given once stands. Do not ask again for approval already given.
- Work that belongs to another owner or agent goes to them, in one message they can act on
  without this conversation. Do not bring it to the person, and do not do it yourself.
- Use the tool built for a job, such as the repository's pull request tool for waiting on checks,
  before writing a polling loop or a watcher script.
- What a status or handoff note says, and what it may list as "needs you", is in the
  `status-reports` skill.

## Parallel by default

Split the work into independent units and run them at the same time, one worker and one worktree
each, within any limit the person set. Make a unit wait only for a named dependency:

- it needs an upstream change that is not released yet
- it changes the same files or contract as another unit; stack those instead of waiting (see
  the `pull-requests` skill)
- it would write in the same worktree

A pull request that is waiting on review or checks does not pause the other units.
