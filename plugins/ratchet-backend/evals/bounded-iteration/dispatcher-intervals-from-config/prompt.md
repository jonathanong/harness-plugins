---
description: Designing a feed-refresh dispatcher whose refresh and retry intervals come from configuration stores the last success and failure times and computes due-ness in the query, not a stored next-attempt time.
tags: [bounded-iteration, skill-fired, sweep]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We need a dispatcher for refetching RSS feeds. PostgreSQL 17, Node 24 with `pg`, BullMQ. A
scheduler calls `dispatchFeeds()` every minute; it should enqueue at most 500 `fetchFeed` jobs per
call. There are about 400,000 rows in `feeds (id uuid primary key, url text not null, ...)`.

A healthy feed is refetched every `REFRESH_MINUTES` and a feed whose last fetch failed is retried
every `RETRY_MINUTES`; both are read from our config service. The fetch worker calls back when a fetch succeeds or fails.

Write the migration, `dispatchFeeds()`, and the two callbacks the worker uses. Reply in your
message; you don't need to create files.
