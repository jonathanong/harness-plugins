---
name: expand-contract-migrations
description: Use when renaming or dropping a column or table, changing a column type, making a column NOT NULL, renaming an API or event field, splitting or merging tables, or changing a config shape that running code reads. Change a shape in separate deploys so old and new code never disagree.
---

# Expand and contract migrations

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

These rules apply wherever old code may run, including a rollback that redeploys it. Only a
disposable database, such as a test schema or a local reset, may be renamed, dropped, or
constrained in one step.

During every deploy and every rollback, old and new code run at the same time against the same
data. A change that only works when all code is new breaks in that window. Make each step work
with the version before it and the version after it.

## The sequence

In this order. Steps 1, 2, 5, 6, and 7 are each a deploy of their own; the backfill and the
check run between deploys:

1. Expand: add the new shape, nullable or with a default, and unused. Nothing reads it yet.
2. Write both: code writes the old and the new shape on every write.
3. Backfill existing rows into the new shape in bounded batches (see
   [bounded-iteration](../bounded-iteration/SKILL.md)).
4. Verify with a count or diff query that old and new agree, for example rows where the new
   column is null or differs from the old one. Expect zero.
5. Read the new shape. Keep writing both, so a rollback to the old read still finds current data.
6. Stop writing the old shape.
7. Contract: drop the old shape, in a later, separate change.

Never put an expand and the contract of the same thing in one change. The deploy between them is
the only time anything can be undone.

## A rename follows the sequence

Never rename in place: `ALTER TABLE ... RENAME COLUMN` breaks every running instance that still
uses the old name, the moment it runs. Add the new name, copy, switch readers, drop the old name.
The same holds for a type change (add a column of the new type) and for a table split or merge
(build the new tables, write both, backfill, switch reads).

Example, `users.name` to `users.full_name`: deploy 1 adds a nullable `full_name`; deploy 2 writes
both; run the backfill; deploy 3 reads `full_name`; deploy 4 stops writing `name`; deploy 5 drops
it.

## Rollback and evidence

- Every step before the contract is undone by redeploying the previous version, because the old
  shape is still present and still written. State this for each step in the pull request.
- The contract cannot be undone by a redeploy; the data is gone. It is the step that needs
  evidence: a query or log showing no deployed version reads or writes the old shape.
- Wait for every reader and writer, not just the web service: workers, scheduled jobs, replicas,
  analytics exports, and clients that cannot be redeployed (mobile apps, cached pages). When one
  of them cannot be shown to be gone, do not contract; say so.

## Constraints

Add a constraint in two steps where the database supports it, so it does not lock the table while
it scans:

- Foreign key or check: add it `NOT VALID` (new writes are checked at once), then `VALIDATE` it
  in a later statement.
- NOT NULL: backfill first, confirm no nulls remain, then add it. Never add it in the expand step.

For table design and locking, see [postgres-schema-design](../postgres-schema-design/SKILL.md).

## API, event, and config fields

The same sequence applies to anything with a consumer you do not deploy together with the
producer. Add the new field alongside the old one, change consumers to read either, then stop
sending the old field once no consumer needs it. A consumer that rejects unknown fields must be
changed before the producer starts sending the new one.

For flags that gate the switch, and for keeping deploying apart from enabling, see
[feature-rollout](../feature-rollout/SKILL.md).
