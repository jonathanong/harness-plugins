---
description: A description for a flagged performance change shows measured before and after numbers, states what the flag does not cover, and leaves out routine passing checks.
tags: [pr-description, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the pull request description for this change. Notes from my work:

- `GET /orders` (the list) was slow for accounts with many orders. I added a per-account cache of the list query, 60 s TTL, invalidated when an order is created or updated.
- Behind the flag `orders_list_cache`, default off.
- `GET /orders/:id` is untouched. The export job calls the same repository function, so it reads from the cache too when the flag is on.
- Also added the index `orders (account_id, created_at DESC)` in a migration.
- Measured on staging with the 500 largest accounts, 20 requests each: p50 310 ms to 45 ms, p95 840 ms to 210 ms. Cold cache p95 is 790 ms.
- Ran unit tests, integration tests, lint, and typecheck; all green. First tried caching in the HTTP layer and dropped it because invalidation was wrong.

Reply in your message; you don't need to create files.
