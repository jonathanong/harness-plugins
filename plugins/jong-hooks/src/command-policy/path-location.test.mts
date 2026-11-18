import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import { probeEnv } from './git-process.mts'
import { createPathLocator, defaultPathLocator } from './path-location.mts'

const base = realpathSync(mkdtempSync(join(tmpdir(), 'jong-hooks-locate-')))
const repo = join(base, 'repo')
const linked = join(base, 'linked')
const outside = join(base, 'outside')
// Run by a git hook, the inherited GIT_DIR or GIT_INDEX_FILE would aim these at the real repository.
const env = probeEnv()
const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, env, stdio: 'ignore' })

mkdirSync(join(repo, 'src'), { recursive: true })
mkdirSync(outside)
writeFileSync(join(repo, 'src', 'a.txt'), 'a')
execFileSync('git', ['init', '-q', repo], { env })
const identity = [
  '-c',
  'user.name=t',
  '-c',
  'user.email=t@example.test',
  '-c',
  'commit.gpgsign=false',
]
git(...identity, 'commit', '-q', '--allow-empty', '--no-verify', '-m', 'x')
git('worktree', 'add', '-q', linked)

afterAll(() => rmSync(base, { recursive: true, force: true }))

describe('defaultPathLocator', () => {
  const commonDir = join(repo, '.git')

  it('places a file, a directory, and a path that does not exist yet', () => {
    expect(defaultPathLocator(join(repo, 'src', 'a.txt'))).toEqual({
      commonDir,
      pathInWorktree: 'src/a.txt',
    })
    expect(defaultPathLocator(join(repo, 'src'))).toEqual({ commonDir, pathInWorktree: 'src' })
    expect(defaultPathLocator(join(repo, 'new', 'dir', 'b.yml'))).toEqual({
      commonDir,
      pathInWorktree: 'new/dir/b.yml',
    })
  })

  it('gives a linked worktree the same repository and its own top level', () => {
    expect(defaultPathLocator(join(linked, 'AGENTS.md'))).toEqual({
      commonDir,
      pathInWorktree: 'AGENTS.md',
    })
  })

  it('returns null outside any repository', () => {
    expect(defaultPathLocator(join(outside, 'AGENTS.md'))).toBeNull()
  })

  it('returns undefined when git cannot run', () => {
    expect(createPathLocator('jong-hooks-no-such-git')(join(repo, 'a'))).toBeUndefined()
  })
})
