---
description: Adding a second field of a joined author reads the author once from the base table, not with another lookup or a new view column.
tags: [postgres-node-performance-tuning, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our notes feed (PostgreSQL 17, Node with `pg`) returns pages of up to 101 notes with each author's display name:

```sql
/* notes.listFeed */
SELECT n.id, n.body, n.created_at, up.display_name AS author_display_name
FROM notes n
LEFT JOIN users_public up ON up.id = n.author_id
WHERE n.feed_id = $1 AND n.created_at < $2
ORDER BY n.created_at DESC
LIMIT 101;
```

The feed now also needs each author's `username`. These are the views involved:

```sql
-- for embedding a user in API responses
CREATE VIEW users_embedded AS
SELECT u.id, u.username, u.avatar_url,
  (SELECT count(*) FROM follows f WHERE f.followee_id = u.id) AS follower_count,
  (SELECT json_agg(b.name) FROM badges b WHERE b.user_id = u.id) AS badges
FROM users u WHERE u.deleted_at IS NULL;

-- for public profile lookups by id or slug
CREATE VIEW users_public AS
SELECT u.id, u.slug,
  CASE WHEN u.verified_at IS NOT NULL THEN u.display_name END AS display_name,
  (SELECT count(*) FROM notes x WHERE x.author_id = u.id) AS note_count
FROM users u WHERE u.deleted_at IS NULL;
```

`users` has `id` (primary key), `username`, `slug`, `display_name`, `verified_at`, `deleted_at`, and `avatar_url`. `username` is only exposed through `users_embedded`. Update the query to return it. Reply in your message; you don't need to create files.
