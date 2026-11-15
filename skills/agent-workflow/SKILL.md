---
name: agent-workflow
description: Carry a repository change from start to handoff - implement it, gather evidence, review a diff, and answer review feedback, splitting independent work to run in parallel. Use when starting an implementation task, preparing a handoff, reviewing a change, or deciding what to do with review comments from a person or a bot.
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
- Keep large logs out of the conversation. Report bounded findings and their evidence.

## Review a change

Review the whole diff, not only the changed lines of implementation. Check the premise and scope,
compatibility of public contracts, failure paths, authorization, untrusted input, and secrets.
Ask for dead paths and stale docs to be removed, not labeled legacy. Check the pull request
description against the final behavior.

## Answer review feedback

Read [review response](references/review-response.md) before acting on review comments. In short:
read the whole round first, give every item exactly one disposition, and push once.

## Parallel by default

Split the work into independent units and run them at the same time, one worker and one worktree
each, within any limit the person set. Make a unit wait only for a named dependency:

- it needs an upstream change that is not released yet
- it changes the same files or contract as another unit; stack those instead of waiting
- it would write in the same worktree

A pull request that is waiting on review or checks does not pause the other units.
