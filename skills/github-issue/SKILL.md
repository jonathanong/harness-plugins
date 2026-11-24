---
name: github-issue
description: Use when filing or editing an issue, recording a follow-up, closing an issue, or linking a pull request to an issue. Search for, write, label, link, and close GitHub issues without filing duplicates or writing where you may not.
---

# GitHub issues

Read every applicable `AGENTS.md` first, then the issue templates. Repository-local policy
overrides these defaults. It owns which repositories may be written to, the labels, and the
template.

## Authority to write

- Having a credential is not permission. The person asking must have asked for this issue, label,
  or change. Filing an issue records work; it does not approve doing it.
- Resolve the repository before writing: its canonical name, that it is not archived, that issues
  are enabled, and that the signed-in account can create or triage issues. A renamed repository
  still resolves under its old name, so compare the name returned with the name you were given.
- A missing permission is a stop, not something approval can override. Report it and return the
  draft. Do not route around it through another account, repository, or API.
- Applying a label, milestone, or project that already exists is part of filing the issue.
  Creating a label is not: omit it, file the issue without it, and report the label that would
  fit. Renaming or deleting one is outside what filing authorizes; ask first (see
  `agent-workflow`, "Decide, then report").

When the target repository cannot be written to, read
[denied target](references/denied-target.md) before filing anywhere else.

## File an issue

1. Search open issues and relevant closed ones in the destination. Return a likely duplicate
   instead of filing a second.
2. Check that the paths and the behavior the issue names are still true on the default branch. An
   issue copied from an older note often describes code that has moved.
3. An issue that asks for a fix or a change states a verified problem. Verified means you
   reproduced it or traced it in the code, and the issue shows the evidence: a failing run, a
   reproduction, or the file and line that make it reachable. A review note, a hunch, or "this
   could happen" is not verification. When the problem is not verified, verify it first, or
   file an investigation issue: say so in the title and the body, list what is unknown, and
   make the outcome a finding that proves the problem or rules it out. The same issue may
   carry the fix, as a step that happens only if the finding proves the problem: investigate,
   then fix it here if it is real, and close it with the reason if it is not. Do not hand an investigation issue
   to an implementer as a fix; a fix built for a problem that cannot happen is wasted work
   and unreachable code. A symptom the reporter saw happen is a verified problem: file it as
   a bug, and put a guessed cause in the body as a guess.
4. Write it so a reader with no other context can act: the problem, the desired outcome, what is
   out of scope, the files or areas involved, how to verify it, and links to outside context.
5. Fetch the live labels and milestones. Apply the ones that match. Omit an optional label rather
   than inventing one.
6. Read the created issue back and check its labels, milestone, and project. Report the URL and
   what was applied. If part of it failed, report that; do not create the issue again.

For a batch, validate every entry before creating any. If creation fails partway, stop and list
what was created. Do not retry an entry that succeeded.

## Change an issue

- Read the issue and its discussion again immediately before editing, commenting, or closing.
- Close an issue only when the outcome it describes is done and there is evidence. Otherwise
  leave it open and say what is missing.
- Close an issue as superseded, without asking, when an issue or pull request this work opened
  replaces it. Comment with the reason and a link to the replacement, close it as not planned,
  and carry over anything the replacement still needs. The replacing work is the authority.
- Do not set a project status that closes the issue, such as Done with auto-close on, unless
  closing was asked for.

## Link work

- Use a closing reference (`Fixes #12`) only when the pull request fully resolves the issue. Use
  `Part of #12` for a partial change. Write cross-repository references in full:
  `owner/repo#12`.
- Use sub-issues for a real parent and child, blocked-by for a known dependency, and a prose link
  for related work.
- A blocker found while working does not widen the task. Reproduce it on the current default
  branch, search for an existing fix or issue, and record it as its own issue. Do not take it on; report
  what was recorded (see `agent-workflow`, "Decide, then report").

## Report

- A search: at most five lines of `#N: title - url`.
- A duplicate: `Duplicate of #N: <url>`.
- A write: the action, the URL, and the labels, milestone, and project applied.
