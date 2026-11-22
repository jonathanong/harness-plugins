---
name: revisit-followups
description: Use when asked to sweep for follow-ups, unfinished checklists, or dropped work over a recent period. Find deferred work that was promised in merged pull requests, closed issues, and instruction files, check that it is still needed, and draft issues for it.
---

# Revisit follow-ups

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

1. Fix the lookback window: a duration such as `1w` or a date. If none was given, use one week
   and say so in the report.
2. Collect only explicit signals of deferred work from merged and closed pull requests, closed
   issues, and repository instructions: an unchecked box, a numbered list left partly done, "will
   do in a follow-up".
3. Reject settled decisions, standing policy, completed checklists, and text that merely looks
   like a TODO. Finding nothing is a valid result.
4. Check each remaining candidate against the current default branch, its history, how the
   original work was closed, existing issues, and open pull requests. Much deferred work was
   done later under another name.
5. Group related candidates into issue drafts that stand alone. Keep the original evidence and
   say why the work is still needed.
6. Stay read-only unless issue creation was asked for. When it was, file through the
   `github-issue` skill. Report what was skipped, what is already covered, and what was created.

## Collecting

- Read bodies first. Fetch comments only for candidates found in a body, unless comments were
  asked for.
- Do not exclude a whole issue because it is a plan, and do not rely on a fixed list of headings.
- A full page of search results means the search was cut off, not finished. Split the date range
  at its midpoint and search both halves, down to timestamps within a day. Report truncation only
  when the smallest range is still full.
- Keep fetched bodies in a temporary directory, one file per collector, and remove it afterwards.
  Do not print them into the conversation.
