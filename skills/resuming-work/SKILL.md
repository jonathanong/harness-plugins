---
name: resuming-work
description: Use when asked to "continue", "resume", or "pick up where we left off", when starting from a summary or handoff note, after a crash, context reset, or long wait, and before leaving work that may be interrupted. Rebuild the real state before acting, and leave work resumable.
---

# Resuming work

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

A note records what was true when it was written. Time has passed, and the work may have moved on.
Act on the state you find, not on the note.

## Rebuild the state

Before any action, check the sources of truth:

- The branch, the working tree status, and the recent commits.
- What the remote has: is the branch pushed, and is it ahead or behind?
- Open pull requests for the branch, and the state of their checks and review comments.
- Running background jobs, deploys, and worktrees.

Compare each against the note. A step described as "about to" may already be done, and one
described as done may never have been pushed. To check claims in the note, use the
[status-reports](../status-reports/SKILL.md) skill.

## Do not repeat a step

Before a step that creates something (a commit, a branch, an issue, a pull request, a deploy,
a message), look for its effect. A second commit of the same change, a duplicate issue, or a
second deploy is harder to undo than the check is to run. When the effect exists, use it and
move on.

## Carry the constraints, not the approvals

- Re-read the standing instructions in the note: what not to touch, what needs approval, what
  was ruled out. They still apply.
- Approval given before the interruption covers the action it named, once. It does not extend
  to new actions, and it may be stale if the state changed. Ask again for anything not named.

## Pick the next step

Take the next step from the original request, not from the last thing in progress; that thing
may have been a detour. Say in one line what state you found and what you are doing next, then
continue without asking. Ask only as [deciding-or-asking](../deciding-or-asking/SKILL.md) says to.

## Leave work resumable

Do this before work that may be interrupted, and whenever you stop:

- Commit and push work in progress on its own branch, so a crash loses nothing.
- Write the state where the next reader will look, such as the pull request or the issue: what is
  done, what is in flight, what is next, and what was ruled out with the reason. For the handoff
  note itself, use [status-reports](../status-reports/SKILL.md).

## Clean up what was left

The previous session may have left stale worktrees, branches, temp files, or background
processes. Check that nothing is using them (no open pull request, no running process, no
uncommitted work) before removing them. If you cannot tell, leave them and say so.
