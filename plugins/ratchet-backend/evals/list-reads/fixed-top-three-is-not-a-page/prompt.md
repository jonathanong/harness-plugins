---
description: Guard - the three latest sign-ins for an account banner are one query with a fixed limit, not a paginated read.
tags: [list-reads, guard, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

On the account security page we show a small banner with the user's three most recent sign-ins (time, city, device). It's always three, there's no "see more". We use node-postgres; the table is `sign_ins (id uuid, user_id uuid, created_at timestamptz, city text, device text)` with an index on `(user_id, created_at DESC)`. Write `recentSignIns(db, userId)` and say what it returns.

Reply in your message; you don't need to create files.
