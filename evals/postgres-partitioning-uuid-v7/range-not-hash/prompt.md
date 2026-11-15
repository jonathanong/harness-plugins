---
description: A time-ordered table with retention is partitioned by RANGE on the UUIDv7 id, not by HASH.
tags: [postgres-partitioning-uuid-v7, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our `audit_events` table (PostgreSQL 17) has 2 billion rows and a `uuidv7()` primary key `id`. We keep 90 days and today a nightly `DELETE` removes older rows, which takes hours. My plan is `PARTITION BY HASH (id)` into 16 partitions so the deletes are smaller. Readers query by `account_id` for the last 7 days. Write the DDL and describe the retention job and how readers should query. Reply in your message; you don't need to create files.
