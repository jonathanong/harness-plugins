import { describe, expect, it } from 'vitest'
import { configuredPullRequestBase, findHandRolledStackBaseBlock } from './index.mts'
import type { GitProbe } from './index.mts'

function probe(overrides: Partial<GitProbe> = {}): GitProbe {
  return {
    currentBranch: () => 'feature',
    configValue: () => undefined,
    isAncestor: () => true,
    resolveRef: () => undefined,
    ...overrides,
  }
}

describe('hand-rolled stack bases', () => {
  const resolved = { baseBranch: 'main', remote: 'origin', guidance: '', draftFollowUp: '' }

  it('blocks a PR aimed at an unmerged branch', () => {
    const git = probe()
    const block = findHandRolledStackBaseBlock('create', ['--base', 'feature'], '/w', {
      ...resolved,
      git,
      guidance: 'Use stacks.',
    })
    expect(block?.reason).toContain('PRs must target main')
    expect(block?.reason).toMatch(/Use stacks\.$/)
    expect(
      findHandRolledStackBaseBlock('edit', ['-B', 'main'], '/w', { ...resolved, git }),
    ).toBeNull()
    expect(findHandRolledStackBaseBlock('edit', [], '/w', { ...resolved, git })).toBeNull()
  })

  it('falls back to the branch-configured base for create only', () => {
    const git = probe({
      configValue: (_cwd, key) => (key === 'branch.feature.gh-merge-base' ? 'dev' : undefined),
    })
    expect(findHandRolledStackBaseBlock('create', [], '/w', { ...resolved, git })).not.toBeNull()
    expect(findHandRolledStackBaseBlock('new', [], '/w', { ...resolved, git })).not.toBeNull()
    expect(findHandRolledStackBaseBlock('edit', [], '/w', { ...resolved, git })).toBeNull()
    expect(findHandRolledStackBaseBlock('create', [], undefined, { ...resolved, git })).toBeNull()
    expect(configuredPullRequestBase('/w', git)).toBe('dev')
    expect(
      configuredPullRequestBase('/w', probe({ currentBranch: () => undefined })),
    ).toBeUndefined()
  })
})
