import type { Pool } from 'pg'
import type { Notifications } from '../notifications.ts'

// Runs every 5 minutes. `since` comes from the job's data; the returned value is saved there.
export async function reindexProfiles(
  db: Pool,
  notifications: Notifications,
  since: Date,
): Promise<Date> {
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
