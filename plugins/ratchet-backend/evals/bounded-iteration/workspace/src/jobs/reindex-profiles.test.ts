import assert from 'node:assert/strict'
import { test } from 'node:test'
import { reindexProfiles } from './reindex-profiles.ts'
import { createTestDatabase, insertProfile } from '../../test/database.ts'

test('reindexProfiles writes search_text for edited profiles', async () => {
  const db = await createTestDatabase()
  const sent: string[] = []
  const notifications = { enqueue: async (kind: string) => void sent.push(kind) }
  await insertProfile(db, { displayName: 'Ada', bio: 'Engines' })
  await insertProfile(db, { displayName: 'Lin', bio: null })
  await insertProfile(db, { displayName: 'Sam', bio: 'Maps' })

  await reindexProfiles(db, notifications, new Date(0))

  const { rows } = await db.query(`SELECT search_text FROM profiles ORDER BY display_name`)
  assert.deepEqual(
    rows.map((row) => row.search_text),
    ['ada engines', 'lin ', 'sam maps'],
  )
  assert.equal(sent.length, 3)
})
