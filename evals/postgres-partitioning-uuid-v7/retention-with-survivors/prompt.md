---
description: Retention for a run table whose old rows are still referenced keeps a bounded delete sweep and records why on the table.
tags: [postgres-partitioning-uuid-v7, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We need 30-day retention on `report_runs` (PostgreSQL 18, about 400 million rows, `id uuid PRIMARY KEY DEFAULT uuidv7()`). Each report row points at two runs:

```sql
ALTER TABLE reports
  ADD COLUMN latest_run_id uuid REFERENCES report_runs (id) ON DELETE RESTRICT,
  ADD COLUMN draft_run_id uuid REFERENCES report_runs (id) ON DELETE RESTRICT;
```

A report that nobody has rerun in a year still points at its year-old latest run, and that run must stay. My teammate wants to convert `report_runs` to range partitions by month and drop partitions older than 30 days. Is that the right design? Give me the retention approach and the DDL. Reply in your message; you don't need to create files.
