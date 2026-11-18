import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

const BIN = fileURLToPath(new URL('../bin/hook.mts', import.meta.url))
const root = mkdtempSync(join(tmpdir(), 'hook-bin-'))
afterAll(() => rmSync(root, { force: true, recursive: true }))

function hook(command: string, args = ['pre-tool-use', '--harness', 'claude']) {
  const input = JSON.stringify({ tool_name: 'Bash', tool_input: { command } })
  return spawnSync(process.execPath, [BIN, ...args], { cwd: root, input, encoding: 'utf8' })
}

describe('bin/hook.mts under plain node', () => {
  it('gives no opinion without a policy file', () => {
    const result = hook('ls')
    expect([result.status, result.stdout, result.stderr]).toEqual([0, '', ''])
  })

  it('blocks with exit 2 when the repository policy forbids the command', () => {
    mkdirSync(join(root, '.claude'))
    writeFileSync(
      join(root, '.claude', 'jong-hooks.policy.mjs'),
      "export default { command: { commandPatterns: [{ pattern: /\\bforbidden\\b/, reason: 'nope' }] } }",
    )
    expect(hook('echo fine').status).toBe(0)
    const blocked = hook('forbidden thing')
    expect(blocked.status).toBe(2)
    expect(blocked.stderr).toBe('nope\n')
  })

  it('exits 2 on bad arguments for a blocking event', () => {
    expect(hook('ls', ['pre-tool-use']).status).toBe(2)
  })
})
