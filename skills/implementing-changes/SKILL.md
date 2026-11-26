---
name: implementing-changes
description: Use when asked to fix a bug, build a feature, change behavior, or remove code in a repository, and before saying that change is ready to hand off. Find why the code exists before changing it, finish the real path, change the contract and docs with the behavior, and map each acceptance criterion to evidence. To find the cause of a failure first, use debugging.
---

# Implementing a change

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

Whether to ask the person about a choice met on the way is in the `deciding-or-asking` skill.
For the status or handoff note, use `status-reports`; to review a diff, `change-review`; to
split the work across workers, `agent-coordination`.
