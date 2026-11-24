import { readFileSync } from 'node:fs'
import { pool } from './pool.ts'

const cache = new Map<string, string>()

function load(name: string): string {
  let text = cache.get(name)
  if (!text) {
    text = readFileSync(new URL(`./queries/${name}.sql`, import.meta.url), 'utf8')
    cache.set(name, text)
  }
  return text
}

/** Runs the statement in `queries/<name>.sql` with the given parameters. */
export async function runNamed<Row>(name: string, params: unknown[]): Promise<Row[]> {
  const { rows } = await pool.query({ name, text: load(name), values: params })
  return rows as Row[]
}
