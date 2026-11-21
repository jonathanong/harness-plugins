---
description: A job id keyed only by entity plus numeric retention silently drops later enqueues; the id includes the triggering event or is released.
tags: [glide-mq, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We use glide-mq. Every time a customer's profile changes we enqueue `reindex-customer` so the search index catches up. To avoid piling up duplicates I set `jobId: customerId` on the add, and the queue keeps the last 500 completed jobs (`removeOnComplete: 500`). The processor reads the customer row when it starts. In staging, some edits never show up in search. Why, and what should the add look like? Reply in your message; you don't need to create files.
