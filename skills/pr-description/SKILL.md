---
name: pr-description
description: Use when opening or updating a pull request, writing its title or body, or reviewing a description. Write a pull request description a reviewer can act on without opening the diff - the problem, the change, the impact, and before/after evidence.
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
4. **Before and after.** Show the difference as evidence: a real run for a change in behavior,
   and a table when there are two or more rows to compare.
5. **Rollout and risk**, when they apply: a migration, a flag, an order of deploys, how to revert.
6. **Decisions**, marked **User:** or **Agent:**, per `agent-workflow`'s "Record who decided".

## Show one real run

When the change alters what a command, endpoint, screen, or job does, show one real run of it
from the point of view of a customer or user: what they had, what they did, and what they got
back, before and after the change.

- Take the example from a real scenario: the business case or the report that led to the
  change, with realistic names and data. Do not use a contrived, narrow example such as a
  minimal fixture with `foo` and `bar`. That shows a code path ran, not that the feature does
  what its user needs. Replace anything private.
- The reader should be able to tell from the description alone how the feature works. That is
  how a feature built wrongly is caught before merge: the reviewer sees what the user gets and
  it is not what they expected.
- Show the inputs and outputs themselves, in code blocks, or in screenshots for an interface.
  A table, a checklist, or a sentence such as "now reports 2 instead of 4" summarizes a run
  and does not replace it. A table may sit beside the run when there are several cases.
- Copy the output; do not retype or tidy it. Cut a long output only with a visible marker, and
  keep the lines that differ.
- When the behavior was not run, say so. Do not write output that was not produced.
- A change with no behavior to run, such as documentation or a dependency bump, has none to
  show. For a performance change, the measured numbers and their method are the evidence.

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
- Keep one row per case. Leave out rows that did not change, except a case a reviewer would
  worry about: show that one as unchanged.

## Detail the change warrants

- When a request or event crosses components, add a Mermaid `sequenceDiagram` of the new flow.
  Use a `flowchart` for decision logic.
- Say when the change takes effect: the flag, plan, environment, or rollout step that turns it
  on, and whether current deployments already meet it.
- For a cost change, give the direction and scope. Label each figure measured or estimated, with
  the workload and assumptions. Say unmeasured when there is no defensible figure.
- For a schema change, list the tables, columns, constraints, and indexes added, removed, and
  changed, and which readers and writers change with them.
- Put long inventories, secondary diagrams, and calculations in a collapsed `<details>` block.
  Keep the problem, the main table, and material risks outside it. Leave a blank line after
  `</summary>` and before `</details>`, or the Markdown inside does not render.
- A one-line fix needs only prose.

Read [examples](references/examples.md) when choosing between a table, a diagram, and prose.

## When CI caught what local checks missed

Add a short section only when a CI failure was traced to a local check that was skipped, or one
that passed locally in a different scope. Link the first failing run and its commit, say what was
run locally and why it missed the failure, and name the correction. Keep the section after CI
turns green. An outage or a failure that can only happen in CI is not a gap; do not record one.

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

When work is split across pull requests, say in each description what the other parts are and in
what order they land. Whether to split or stack is in the `pull-requests` skill.

## Title

Say what changes, in the imperative, in under about 70 characters. Do not put the ticket number
alone, and do not describe the activity ("fixes", "updates").
