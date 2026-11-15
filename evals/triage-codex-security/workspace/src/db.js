import { pool } from './pool.js'

// Synthetic eval fixture. Not a real service.
export async function findOrder(id) {
  const result = await pool.query('SELECT id, total FROM orders WHERE id = $1', [id])
  return result.rows[0]
}

export async function searchOrders(term) {
  const result = await pool.query(`SELECT id, total FROM orders WHERE note LIKE '%${term}%'`)
  return result.rows
}
