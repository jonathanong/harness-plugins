---
description: A plan for a migration on a large table loads a PostgreSQL skill and carries its lock and backfill constraints into the steps.
tags: [planning, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We run PostgreSQL 17 and the `orders` table has about 400 million rows and takes writes all day. We need a new `region text` column, filled for existing rows from `customers.region`, and an index on `(region, created_at)` for a new report. Can you plan out the migration?

Reply in your message; you don't need to create files or read any.
