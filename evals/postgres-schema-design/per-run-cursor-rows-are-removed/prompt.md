---
description: A table that stores one position per run of a job gets a retention policy, deleting a run's row when the run completes or dropping old rows by partition
tags: [postgres-schema-design, skill-fired, schema]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our ledger export marks each `ledger_entries` row exported and has to save how far it got in
the same transaction, so the position can't live in the job's payload. Operators start exports
by hand for an account, several a day, and exports for different accounts run at the same
time, so each export run needs its own saved position.

Write the migration for the table that holds the position, and the SQL the job runs to read
and save it. PostgreSQL 18; ids are UUIDv7. Reply with the SQL. Don't edit any files.
