---
name: planning
description: Use when asked for a plan, a design, or an approach before implementing, or when a task is large or uncertain enough to need one. Plan a repository change - compare the options, trace what the change touches, order the steps, and save the plan where it will be found.
---

# Planning

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Scale the plan to the uncertainty and the impact. No fixed headings, tables, or diagrams are
required.

1. State the desired outcome. Compare making no change, reusing something that exists, and the
   alternatives. Choose the smallest option that lasts. Ask before treating an open product
   choice as settled.
2. Read the instructions, docs, current code, tests, and recent changes from a fresh copy of the
   default branch. Note which evidence supports each step.
3. Trace what the change touches. Start from the changed surface and follow imports, callers,
   configuration, generated artifacts, and tests. An issue's file paths are a snapshot; check
   them against the current source. A search or graph tool that finds no dependent has not
   proved there is none; say what was searched and what remains uncertain.
4. Record the chosen approach, the steps, how each will be verified, and the open decisions. Mark
   which steps can run at the same time, and name the dependency that forces each other step to
   wait. Add rollout detail only when the repository has a deployment contract that needs it.
5. Save the plan once, outside the repository's history: an existing issue, a pull request
   description, or the plan store local policy names. Do not commit a task plan to the
   repository; it goes stale the day the work merges and then reads as documentation. A scratch
   file is not a saved plan. Link the record from the handoff instead of repeating it.

Choose focused tests from the real dependents found in step 3. Add broader validation when a
shared contract, a package boundary, or a generated artifact changes.
