---
description: A request to make a cap exact gets a best-effort count, not a lock, counter, or claim table.
tags: [postgres-locking, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

A team can have at most 10 members. Today `acceptInvite(teamId, userId)` counts `team_members` and inserts when the count is under 10, so two invites accepted at the same moment can leave a team with 11. Make the cap exact. PostgreSQL 17, Node with `pg`. Write the SQL and the TypeScript for `acceptInvite`. Reply in your message; you don't need to create files.
