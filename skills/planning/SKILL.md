---
name: planning
description: Use when asked to plan, scope, or design a change before implementing it, or when starting a non-trivial feature, migration, or refactor across areas. Covers outcome, options, impact tracing, verification commands, and a plan another agent can run. Not for mechanical changes.
---

# Planning

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

## Pick a level

Pick the lowest level that fits. Move up when tracing finds more than you expected. A change to a
value users feel, such as a timeout, a limit, or copy, changes behavior and is not mechanical.

| Level       | When                                                                                                            | Output                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Mechanical  | Rename, version bump, typo, or a change whose whole impact one graph query answers, with no change in behavior. | No plan. Do it and verify.                                                                                           |
| Small       | One area, known approach.                                                                                       | A few lines in the issue or PR description: outcome, impact, verification commands.                                  |
| Substantial | Crosses areas or services, changes user-visible behavior, migrates data, or has open decisions.                 | The full plan document below.                                                                                        |
| Initiative  | Several PRs, services, or a rollout.                                                                            | The full document plus phases, each a separately shippable and verifiable PR, and the rollout per `feature-rollout`. |

## Plan

1. State the outcome in words a non-engineer can read: what a user sees or can do today and what
   they will see or do after, as a before/after table with a row for each behavior that changes. A
   config value or a code change is not an outcome. Compare making no change, reusing something
   that exists, and the alternatives. Choose the smallest option that lasts. When a product choice is
   open, take the smallest reversible option and record it as an assumption; see
   `agent-workflow`, "Decide, then report".
2. Read the instructions, docs, current code, tests, and recent changes from a fresh copy of the
   default branch. Note which evidence supports each step. An issue's file paths are a snapshot;
   check them against the current source.
3. Trace what the change touches, starting from the changed surface: imports, callers,
   configuration, generated artifacts, tests. Name what is affected, not only the code that
   depends on it: unit and integration tests, browser or end-to-end specs, and the user-visible
   behavior that changes or could break (flows, pages, API responses, emails, jobs). Use a
   dependency-graph tool such as `no-mistakes` when it is installed, and grep otherwise; the
   commands are in [impact tracing](references/impact-tracing.md). A tool that finds no dependent
   has not proved there is none; say what was queried and what remains uncertain.
4. Load the skills and rule sets whose triggers match the areas the change touches (a migration,
   a workflow, a browser test, a queue). Fold each constraint into the step it governs and name
   the skill it came from.
5. Write the steps in order. Give every step, including investigation and cleanup, an acceptance
   criterion and a `Verify:` line with a command the implementer can run (a test path, a query, a
   search); "check that it works" is not a command. Mark which steps can run at the same time and what makes each other step wait. Add rollout
   detail only when the repository has a deployment contract that needs it, and then per
   `feature-rollout`.
6. Save the plan once, outside the repository's history: an existing issue, a pull request
   description, or the plan store local policy names. Do not commit a task plan to the
   repository; it goes stale the day the work merges and then reads as documentation. A scratch
   file is not a saved plan. Link the record from the handoff instead of repeating it.

## Verify after implementing

The plan's final step selects tests from the change, then checks the before/after behaviors:

```bash
pnpm exec vitest run $(no-mistakes tests plan vitest --from-git-diff origin/main...HEAD --format paths)
pnpm exec playwright test $(no-mistakes tests plan playwright --from-git-diff origin/main...HEAD --format paths)
no-mistakes impacted-checks --base origin/main
```

Use the repository's own runner and package manager. Check that the selection is not empty before
running it: with no paths, some runners run every test and others run none. Explain an empty
selection (a docs-only change, or a gap in the graph) instead of passing over it. Then confirm each
before/after row holds, with the e2e spec that covers it or a manual step. Add broader validation
when a shared contract, a package boundary, or a generated artifact changes.

## The plan is a handoff

Write it for an agent with no access to this conversation, possibly another model or vendor. It
must stand alone: no "as discussed", "as agreed", or other reference to chat history, and every
term defined or linked. State each decision as a fact with its reason, not as who agreed to it. Structure it per the `technical-writing` skill; the section template is in
[plan document](references/plan-document.md). It holds:

- a summary with the before/after table, and the context to start from (repo, base commit,
  folders, symbols, commands, linked issues), as pointers and not pasted code;
- decisions with the alternatives rejected and why;
- constraints from related skills and `AGENTS.md`: name the skill or file, and when the reader may
  not have it, quote the specific constraint once;
- impact with the queries run, ordered steps with acceptance criteria and verification commands,
  non-goals, risks and rollback;
- assumptions to verify first, stop conditions (the destructive, irreversible, money-spending, release, or unauthorized steps
  where the implementer stops and asks; everything else it decides and reports), and a definition of done with the evidence to attach.
