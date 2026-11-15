---
description: A review of a diff that locks a parent row to serialize child inserts asks for the lock to be deleted.
tags: [postgres-schema-design, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff. It adds comment creation to our API (PostgreSQL 17, Node with `pg`).

```diff
+export async function createComment(client: PoolClient, postId: string, authorId: string, body: string) {
+  await client.query('BEGIN')
+  // serialize writers on the post so comment_count stays right
+  await client.query('SELECT id FROM posts WHERE id = $1 FOR UPDATE', [postId])
+  const { rows } = await client.query(
+    'INSERT INTO post_comments (id, post_id, author_id, body) VALUES (uuidv7(), $1, $2, $3) RETURNING *',
+    [postId, authorId, body],
+  )
+  await client.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1', [postId])
+  await client.query('COMMIT')
+  return rows[0]
+}
```

```diff
+CREATE TABLE post_comments (
+  id uuid PRIMARY KEY,
+  post_id uuid NOT NULL REFERENCES posts (id),
+  author_id uuid NOT NULL REFERENCES users (id),
+  body text NOT NULL
+);
```

Reply in your message; you don't need to create files.
