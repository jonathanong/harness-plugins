---
description: A migration for a new membership table names every constraint, its primary key included, states ON DELETE on each foreign key, and indexes each referencing column.
tags: [postgres-schema-design, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the migration for team membership (PostgreSQL 18). A user can belong to many teams and a
team has many users, at most once each. Each membership has a role, which is owner, admin, or
member, and may have been invited by another user. We already have `teams` and `users`, both
keyed by a UUIDv7 `id`. The app lists a team's members and lists a user's teams. Reply with the
SQL in your message; you don't need to create files.
