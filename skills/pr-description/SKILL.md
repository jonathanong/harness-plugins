---
name: pr-description
description: Write a pull request description a reviewer can act on without opening the diff - the problem, the change, the impact, and before/after evidence. Use when opening or updating a pull request, writing its title or body, deciding whether to split work across pull requests, or reviewing a description.
---

# Pull request descriptions

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults. Use the
repository's pull request template when it has one, and fit these points into it.

A description is read by a reviewer deciding what to check, and later by someone asking why the
code is this way. Write for both. Build it from the final diff, not from the plan.

## What to write

1. **Problem.** What was wrong or missing, and who it affected. One or two sentences. Link the
   issue when there is one.
2. **Change.** What the pull request does, at the level of behavior. Name a design decision and
   the alternative it rejected when a reviewer would otherwise ask.
3. **Impact.** What is different after merge, for users, operators, and callers. State the blast
   radius: which services, packages, routes, jobs, or tables can behave differently, and which
   cannot.
4. **Before and after.** Show the difference as evidence, in a table when there are two or more
   rows.
5. **Rollout and risk**, when they apply: a migration, a flag, an order of deploys, how to revert.

## Before and after tables

Use a table whenever the change moves something a reader can compare.

| Kind of change | Columns                                             |
| -------------- | --------------------------------------------------- |
| Behavior       | Case, before, after                                 |
| Performance    | Measure, before, after, how it was measured         |
| API or schema  | Field or endpoint, before, after, who must change   |
| Flag or config | Flag, default, what it turns on, the paths it gates |
| User interface | State, before and after screenshots                 |

- Give measured numbers with the method and sample size. Do not claim a speedup without them.
- For each flag, say what it covers and what happens when it is off. A reviewer needs to know
  which code paths the flag does not protect.
- Keep one row per case. Leave out rows that did not change.

## What to leave out

- Routine passing checks. "Tests pass" and "lint is clean" are what CI reports. Mention a check
  only when it is new, was skipped, or is the evidence for a claim.
- A file-by-file narration of the diff.
- The history of the work: abandoned attempts, the order things were done in, the conversation
  that led here.
- Anything private when the repository is public.

Say plainly what was not done or not verified. A known gap stated in the description costs less
than one found in review.

## Scope

- Keep related work in one pull request. Split only for a risk reason: a migration that must land
  first, a change that needs its own revert, or a diff too large to review.
- When work is split, say in each description what the other parts are and in what order they
  land.
- Leave unrelated cleanups out, or put them in their own commit and say so.

## Title

Say what changes, in the imperative, in under about 70 characters. Do not put the ticket number
alone, and do not describe the activity ("fixes", "updates").
