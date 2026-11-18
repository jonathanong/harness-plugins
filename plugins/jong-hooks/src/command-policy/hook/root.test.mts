import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { runHook } from '../index.mts'
import { bash, io } from './policy-modules.test-support.mts'
import { findGitToplevel, resolveRoot } from './root.mts'

const dirs: string[] = []
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

// A repository whose `.git` is a directory (or a file, as in a linked worktree) with a subdirectory.
function repo(gitEntry: 'dir' | 'file' = 'dir'): { top: string; sub: string } {
  const top = realpathSync(mkdtempSync(join(tmpdir(), 'hook-root-')))
  dirs.push(top)
  const sub = join(top, 'packages', 'app')
  mkdirSync(sub, { recursive: true })
  if (gitEntry === 'dir') mkdirSync(join(top, '.git'))
  else writeFileSync(join(top, '.git'), 'gitdir: /elsewhere\n')
  return { top, sub }
}

describe('findGitToplevel', () => {
  it('finds the repository root from a subdirectory, for a .git directory or file', () => {
    for (const kind of ['dir', 'file'] as const) {
      const { top, sub } = repo(kind)
      expect(findGitToplevel(sub)).toBe(top)
      expect(findGitToplevel(top)).toBe(top)
    }
  })

  it('returns undefined when no ancestor holds a .git entry', () => {
    // The filesystem root has no parent to climb to; this stops the walk there.
    expect(findGitToplevel(resolve('/'))).toBeUndefined()
  })
})

describe('resolveRoot', () => {
  it('prefers --root, then CLAUDE_PROJECT_DIR, over the payload cwd', () => {
    const { top, sub } = repo()
    const payload = { cwd: sub }
    expect(resolveRoot('/flag', { CLAUDE_PROJECT_DIR: '/env' }, payload, top)).toBe('/flag')
    expect(resolveRoot(undefined, { CLAUDE_PROJECT_DIR: '/env' }, payload, top)).toBe('/env')
    expect(resolveRoot('rel', {}, payload, top)).toBe(join(top, 'rel'))
  })

  it('uses the git toplevel of the payload cwd, including tool_input.workdir', () => {
    const { top, sub } = repo()
    expect(resolveRoot(undefined, {}, { cwd: sub }, '/unrelated')).toBe(top)
    expect(resolveRoot(undefined, {}, { cwd: 'packages/app' }, top)).toBe(top)
    expect(resolveRoot(undefined, {}, { tool_input: { workdir: sub } }, '/unrelated')).toBe(top)
  })

  it('falls back to the process cwd when the payload names none or is outside any repository', () => {
    const { top, sub } = repo()
    expect(resolveRoot(undefined, {}, {}, sub)).toBe(top)
    expect(resolveRoot(undefined, {}, { cwd: '/' }, '/tmp/elsewhere')).toBe(
      resolve('/tmp/elsewhere'),
    )
  })
})

describe('runHook root discovery', () => {
  it('loads .claude/jong-hooks.policy.mjs from the repository root for a session in a subdirectory', async () => {
    const { top, sub } = repo()
    mkdirSync(join(top, '.claude'))
    writeFileSync(
      join(top, '.claude', 'jong-hooks.policy.mjs'),
      `export default { command: { commandPatterns: [{ pattern: /\\bforbidden-cmd\\b/, reason: 'blocked by test' }] } }`,
    )
    const payload = { ...bash('forbidden-cmd now'), cwd: sub, hook_event_name: 'PreToolUse' }
    // The hook process itself runs somewhere unrelated, as Codex may launch it.
    const run = io('/', JSON.stringify(payload))
    const code = await runHook(['pre-tool-use', '--harness', 'codex'], run.harness)
    expect(code).toBe(2)
    expect(run.err.join('')).toContain('blocked by test')
  })
})
