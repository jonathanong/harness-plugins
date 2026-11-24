---
description: A review of a reindex sweep in a repository where a trigger in an old migration bumps the timestamp the sweep selects by; the review finds it, and asks for an idempotent effect and a second-run test.
tags: [bounded-iteration, skill-fired, review]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
---

Review `src/jobs/reindex-profiles.ts` and its test before I merge them. The job runs every 5
minutes and keeps the search text of recently edited profiles current.

Reply in your message; don't edit any files.
