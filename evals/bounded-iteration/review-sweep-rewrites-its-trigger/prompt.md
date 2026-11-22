---
description: A review of a reindex sweep that bumps the timestamp it selects by, and sends a notification each pass, asks for a write that leaves the trigger alone, an idempotent effect, and a second-run test.
tags: [bounded-iteration, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this before I merge it (Node, PostgreSQL 18 with `pg`). It runs every 5 minutes and keeps
the search text of recently edited profiles current. The position is saved in job data. Every
table in our schema has the standard trigger from our first migration:

```sql
CREATE TRIGGER profiles_touch BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at(); -- sets NEW.updated_at = now()
```

The new job:

```ts
export async function reindexProfiles(db: Pool, since: Date): Promise<Date> {
  const { rows } = await db.query(
    `SELECT id, user_id, display_name, bio, updated_at
       FROM profiles
      WHERE updated_at > $1
      ORDER BY updated_at, id
      LIMIT 500`,
    [since],
  )
  for (const row of rows) {
    await db.query(
      `UPDATE profiles
          SET search_text = lower($2 || ' ' || coalesce($3, ''))
        WHERE id = $1`,
      [row.id, row.display_name, row.bio],
    )
    await notifications.enqueue('profile-indexed', { userId: row.user_id })
  }
  return rows.length ? rows[rows.length - 1].updated_at : since
}
```

The test inserts three profiles, runs `reindexProfiles` once, and checks `search_text` on each.

Reply in your message; you don't need to create files.
