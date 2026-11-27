---
description: An incident write-up from notes opens with a summary, addresses support and engineering separately, flags the claims nobody checked, and ends with the queries it rests on.
tags: [technical-writing, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I need a write-up of yesterday's checkout failures for our support lead and the payments engineers. My notes:

- Card payments failed for some customers from 14:05 to 14:52 UTC on 2026-11-18.
- `SELECT count(*) FROM payment_attempts WHERE status = 'failed' AND created_at >= '2026-11-18 14:00' AND created_at < '2026-11-18 15:00'` returned 3,412. The same hour the day before returned 41.
- `SELECT count(DISTINCT customer_id)` with the same filter returned 2,980.
- payments-api v2.31 deployed at 14:03 and was rolled back at 14:50. It changed the idempotency key from the order id to the cart id.
- Support says most complaints came from the iOS app. I haven't looked at platform in the data.
- The processor dashboard showed duplicate charge attempts. I haven't checked whether anyone was actually charged twice.
- v2.32 restores the order id key and adds a test for it.
- Still open: whether to refund anyone charged twice.

Write it in Markdown. Reply in your message; you don't need to create files.
