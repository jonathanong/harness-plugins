import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { defaultGitProbe } from './index.mts'

let repo = ''
let missing = ''

function git(...args: string[]): string {
  const identity = ['-c', 'user.name=Test', '-c', 'user.email=test@example.test']
  return execFileSync('git', [...identity, ...args], { cwd: repo, encoding: 'utf8' }).trim()
}

beforeAll(() => {
  repo = mkdtempSync(join(tmpdir(), 'git-probe-'))
  missing = join(repo, 'no-such-directory')
  git('init', '-q', '-b', 'trunk')
  git('commit', '-q', '--allow-empty', '-m', 'first')
  git('branch', 'older')
  git('commit', '-q', '--allow-empty', '-m', 'second')
  git('config', 'probe.key', 'value')
})

afterAll(() => rmSync(repo, { force: true, recursive: true }))

describe('defaultGitProbe', () => {
  it('reads the branch, a config value, and a ref', () => {
    expect(defaultGitProbe.currentBranch(repo)).toBe('trunk')
    expect(defaultGitProbe.configValue(repo, 'probe.key')).toBe('value')
    expect(defaultGitProbe.resolveRef(repo, 'refs/heads/older')).toMatch(/^[0-9a-f]{40,64}$/)
  })

  it('answers undefined for a missing key, a missing ref, or a failing git', () => {
    expect(defaultGitProbe.configValue(repo, 'probe.absent')).toBeUndefined()
    expect(defaultGitProbe.resolveRef(repo, 'refs/heads/nope')).toBeUndefined()
    expect(defaultGitProbe.currentBranch(missing)).toBeUndefined()
  })

  it('tells an ancestor from a non-ancestor and fails open on an unknown ref', () => {
    expect(defaultGitProbe.isAncestor(repo, 'older', 'trunk')).toBe(true)
    expect(defaultGitProbe.isAncestor(repo, 'trunk', 'older')).toBe(false)
    expect(defaultGitProbe.isAncestor(repo, 'nope', 'trunk')).toBeUndefined()
  })
})
