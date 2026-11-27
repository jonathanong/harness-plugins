import { readdirSync, readFileSync } from 'node:fs'
import { Pool } from 'pg'

const migrations = new URL('../migrations/', import.meta.url)

// Creates an empty schema and applies every migration in order.
export async function createTestDatabase(): Promise<Pool> {
  const db = new Pool({ connectionString: process.env.TEST_DATABASE_URL })
  await db.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public`)
  for (const name of readdirSync(migrations).sort()) {
    await db.query(readFileSync(new URL(name, migrations), 'utf8'))
  }
  return db
}

export async function insertProfile(
  db: Pool,
  profile: { displayName: string; bio: string | null },
): Promise<void> {
  const { rows } = await db.query(`INSERT INTO users (email) VALUES ($1) RETURNING id`, [
    `${profile.displayName.toLowerCase()}@example.invalid`,
  ])
  await db.query(`INSERT INTO profiles (user_id, display_name, bio) VALUES ($1, $2, $3)`, [
    rows[0].id,
    profile.displayName,
    profile.bio,
  ])
}
