---
description: A migration for a new membership table comments the table and every one of its columns.
tags: [postgres-schema-design, skill-fired, outcome, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the migration for team membership (PostgreSQL 18). A user can belong to many teams and a
team has many users, at most once each. Each membership has a role, which is owner, admin, or
member, and may have been invited by another user. We already have `teams` and `users`, both
keyed by a UUIDv7 `id`. The app lists a team's members and lists a user's teams. Reply with the
SQL in your message; you don't need to create files.
