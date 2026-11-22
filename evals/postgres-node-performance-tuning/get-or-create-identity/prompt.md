---
description: A hot get-or-create on an identity-keyed lookup table reads first and inserts only on a miss.
tags: [postgres-node-performance-tuning, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We have a `tags` table: `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL UNIQUE`. Write a TypeScript function `getOrCreateTagId(db, name)` using node-postgres that returns the tag's id, creating the tag if needed. It runs thousands of times a second and almost every call is for a name that already exists. Reply with the code in your message; you don't need to create files.
