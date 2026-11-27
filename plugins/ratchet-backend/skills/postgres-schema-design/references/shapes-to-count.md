# Shapes to count

Read this when setting up or reviewing a check that keeps schema and SQL complexity from growing,
or when a change adds one of the shapes below.

A rule that says "needs a stated reason" does not hold a total down: each new lease table,
trigger, or planner fence arrives with a plausible reason, and nothing has to approve it. A count
does. Count each shape below, check the counts in as a baseline, and fail the build when a count
passes its baseline.

## The baseline

- It starts at the current count. Nothing is cleaned up first, and no existing object needs a
  reason to stay.
- The repository's owner approves any increase. Keep the baseline in its own file, so that code
  ownership can require that review. A failure names the objects added since the baseline, so the
  change either removes them or asks for the increase.
- Every removal lowers it. A count below the baseline fails until the baseline is lowered to
  match, so the number only moves down.

An agent working unattended does not raise a baseline. It ships the design on the lower rung of
[the ladder](../SKILL.md#the-simplest-design-first) and proposes the increase in the pull request
description.

## What to count

| Shape                                                           | Why it counts                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Lease tables: a table with `lease_token` and `lease_expires_at` | Each one repeats what a queue already does                          |
| Tables named `*_cursors`, `*_attempts`, `*_attempt_results`     | Near-identical copies; the position or the attempt often has a home |
| `generation` and fence counter columns                          | Coordination between writers that a conditional write often covers  |
| `latest_*_id` pointer columns                                   | A live row that depends on its own history                          |
| Trigger functions that write another table                      | Hidden writes, hidden locks, and a second copy of a value           |
| Trigger functions that take row locks                           | A lock order no caller can see                                      |
| Lock sites                                                      | Each adds waiting and deadlock risk                                 |
| `AS MATERIALIZED`, `LATERAL`, and recursive CTEs in service SQL | Query shapes that need a plan to justify them                       |
| Total tables, triggers, and indexes                             | The size of what every migration and every write pays for           |

The list is an opinion about which shapes are complexity; add or drop rows for the codebase. The
counter itself carries none: any check that counts objects in the catalog and patterns in service
SQL works. `jongleberry/no-mistakes` has `postgres-lock-inventory` for lock sites; check that the
installed release has a rule before relying on it.

Exclude generated families of objects, such as the partitions of one table, by name pattern, so
that routine maintenance does not move a count.

## What not to count

Do not set a size limit per feature, such as lines of SQL per file or tables per domain. Splitting
a file gets under the first, and the second punishes a domain for being large.
