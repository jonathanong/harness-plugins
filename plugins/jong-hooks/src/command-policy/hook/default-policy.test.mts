import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { parseHookArgs } from './args.mts'
import { DEFAULT_POLICY, runHook, type HookIo } from './run.mts'

const dirs: string[] = []
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { force: true, recursive: true })
})

const POLICY = `export default { command: { gitPatterns: [{ pattern: /push --force/, reason: 'no force' }] } }`
const FORCE = JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git push --force' } })

function repo(policyFile?: string): string {
  const root = mkdtempSync(join(tmpdir(), 'hook-default-'))
  dirs.push(root)
  if (policyFile !== undefined) {
    mkdirSync(join(root, policyFile, '..'), { recursive: true })
    writeFileSync(join(root, policyFile), POLICY)
  }
  return root
}

function run(root: string, env: NodeJS.ProcessEnv = {}) {
  const out: string[] = []
  const err: string[] = []
  const io: HookIo = {
    readStdin: async () => FORCE,
    stdout: { write: (text) => out.push(text) },
    stderr: { write: (text) => err.push(text) },
    env,
    cwd: root,
  }
  return { io, out, err }
}

const ARGS = ['pre-tool-use', '--harness', 'claude']

describe('the default policy module', () => {
  it('parses without --policy', () => {
    expect(parseHookArgs(ARGS)).toEqual({
      event: 'pre-tool-use',
      harness: 'claude',
      automationEnv: [],
    })
  })

  it('gives no opinion when the repository has no policy file', async () => {
    const { io, out, err } = run(repo())
    expect(await runHook(ARGS, io)).toBe(0)
    expect([out, err]).toEqual([[], []])
  })

  it('applies the default policy file when it exists', async () => {
    const { io, err } = run(repo(DEFAULT_POLICY))
    expect(await runHook(ARGS, io)).toBe(2)
    expect(err).toEqual(['no force\n'])
  })

  it('roots on CLAUDE_PROJECT_DIR when the hook runs from a subdirectory', async () => {
    const root = repo(DEFAULT_POLICY)
    mkdirSync(join(root, 'sub'))
    const rooted = run(join(root, 'sub'), { CLAUDE_PROJECT_DIR: root })
    expect(await runHook(ARGS, rooted.io)).toBe(2)
    const unrooted = run(join(root, 'sub'))
    expect(await runHook(ARGS, unrooted.io)).toBe(0)
  })

  it('takes the module from JONG_HOOKS_POLICY, and fails closed when it is missing', async () => {
    const root = repo('custom.mjs')
    const set = run(root, { JONG_HOOKS_POLICY: 'custom.mjs' })
    expect(await runHook(ARGS, set.io)).toBe(2)
    const missing = run(repo(), { JONG_HOOKS_POLICY: 'absent.mjs' })
    expect(await runHook(ARGS, missing.io)).toBe(2)
  })
})
