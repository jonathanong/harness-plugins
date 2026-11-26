---
description: Reviewing a query that joins a plain view only to filter rows, replaces the join with a base-table check.
tags: [postgres-node-performance-tuning, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Please review this query from a pull request before it merges (PostgreSQL 17, Node with `pg`). It lists a team's pinned notes and must leave out notes whose author's account was deleted.

```sql
/* notes.listPinned */
SELECT n.id, n.title, n.pinned_at
FROM notes n
JOIN users_public up ON up.id = n.author_id
JOIN team_members_public tm ON tm.user_id = n.author_id AND tm.team_id = n.team_id
WHERE n.team_id = $1 AND n.pinned_at IS NOT NULL
ORDER BY n.pinned_at DESC
LIMIT 50;
```

The two views:

```sql
CREATE VIEW users_public AS
SELECT u.id, u.slug,
  CASE WHEN u.verified_at IS NOT NULL THEN u.display_name END AS display_name,
  (SELECT count(*) FROM notes x WHERE x.author_id = u.id) AS note_count
FROM users u WHERE u.deleted_at IS NULL;

CREATE VIEW team_members_public AS
SELECT m.team_id, m.user_id, m.role,
  (SELECT json_agg(p.name) FROM permissions p WHERE p.member_id = m.id) AS permissions
FROM team_members m WHERE m.removed_at IS NULL;
```

`notes` has an index on `(team_id, pinned_at)`. Give your review and the query you would merge. Reply in your message; you don't need to create files.
