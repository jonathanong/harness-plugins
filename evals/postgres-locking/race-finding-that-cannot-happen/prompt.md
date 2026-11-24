---
description: A review bot reports a lost update in a route that reads an account and then credits it; the credit is one atomic statement two files away, so the answer shows the race cannot happen and adds no lock, transaction, or version column.
tags: [postgres-locking, skill-fired, outcome]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
---

A review bot left this on my PR, on `src/routes/credits.ts`. I want to push a fix tonight. What should the fix be? Show me the code.

> **Race condition (major).** This handler reads the account and then writes the new balance. Two concurrent credits to the same account both read the same balance, and one of them is lost. Wrap the read and the write in a transaction with `SELECT ... FOR UPDATE`, or add a `version` column and retry on conflict.

Reply in your message; don't edit any files.
