---
description: Cache invalidation uses one UNLINK call for all keys, not DEL per key.
tags: [typescript-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We use ioredis. When an organization is deleted I need to clear its cached entries: I have an array of 500 key names. Write `clearOrgCache(keys: string[])`. Reply in your message; you don't need to create files.
