---
description: A recovery job for exports that stopped moving, on a table users also edit, marks the rows it re-enqueues in a column of its own instead of selecting by or touching `updated_at`.
tags: [bounded-iteration, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Some exports get stuck: the worker dies and the export never finishes. Write a job that runs
every 5 minutes and puts stuck exports back on the queue (Node, PostgreSQL 18 with `pg`, BullMQ).
An export that hasn't moved for 15 minutes is stuck. Don't re-enqueue the same export on every
run while it waits its turn.

```sql
CREATE TABLE exports (
  id uuid NOT NULL DEFAULT uuidv7(),
  account_id uuid NOT NULL,
  title text NOT NULL,
  shared_with uuid[] NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_exports PRIMARY KEY (id)
);
```

The export worker is `exportQueue.add('export', { exportId })`. You can change the schema. Reply
in your message with the migration, if any, and the job; you don't need to create files.
