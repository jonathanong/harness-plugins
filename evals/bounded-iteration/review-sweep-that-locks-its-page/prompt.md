---
description: A review of a session-purge sweep that locks a page plus one extra row and deletes by id asks for one statement that deletes a page with the expiry re-checked, counts what it deleted, and asks what each deletion sets off.
tags: [bounded-iteration, skill-fired, review, sweep]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Can you review this before I merge? PostgreSQL 17, Node with `pg`. The job runs every five
minutes.

> **Purge expired sessions in batches**
>
> Locks the batch so a token refresh can't extend a session while we delete it, and reads one
> extra row so we know whether to schedule another batch.

```ts
// src/jobs/purge-sessions.ts
const BATCH = 1000

export async function purgeExpiredSessions(db: Pool, now: Date): Promise<{ hasMore: boolean }> {
  return withTransaction(db, async (tx) => {
    const { rows } = await tx.query<{ id: string }>(
      `SELECT id FROM sessions
       WHERE expires_at < $1
       ORDER BY id
       LIMIT $2
       FOR UPDATE`,
      [now, BATCH + 1],
    )
    const page = rows.slice(0, BATCH).map((row) => row.id)
    await tx.query('DELETE FROM sessions WHERE id = ANY($1::uuid[])', [page])
    return { hasMore: rows.length > BATCH }
  })
}
```

Schema, already on main:

```sql
CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users (id),
  expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_expires_at ON sessions (expires_at, id);
CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE
);
CREATE TRIGGER sessions_count AFTER DELETE ON sessions
  FOR EACH ROW EXECUTE FUNCTION decrement_user_session_count();
-- decrement_user_session_count: UPDATE users SET session_count = session_count - 1 WHERE id = OLD.user_id
```

A refresh runs `UPDATE sessions SET expires_at = now() + interval '30 days' WHERE id = $1`.

Reply in your message; you don't need to create files.
