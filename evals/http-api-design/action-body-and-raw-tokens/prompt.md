---
description: An endpoint design uses resource paths, the public identifier, and hashed tokens instead of an action body, the primary key, and raw storage.
tags: [http-api-design, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm adding to our Express API. Plan:

- `POST /api/orders/actions` with body `{ "orderId": 9182, "action": "archive" | "refund" | "resend_receipt" }`. `orderId` is the bigint primary key; orders also have a `public_id` like `ord_7Hq2x` that we show in the dashboard.
- Personal API tokens: a new table `api_tokens (id, user_id, token text, created_at)`, and auth does `SELECT user_id FROM api_tokens WHERE token = $1`.

Write the route definitions and the table. Reply in your message; you don't need to create files.
