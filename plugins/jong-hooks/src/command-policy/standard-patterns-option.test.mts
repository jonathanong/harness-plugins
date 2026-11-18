import { describe, expect, it } from 'vitest'

import { evaluateCommandPolicy } from './index.mts'
import type { CommandPolicy } from './index.mts'

const reason = (policy: CommandPolicy, command: string) =>
  evaluateCommandPolicy({ tool_name: 'Bash', tool_input: { command } }, policy)?.reason ?? null

describe('the standardGitPatterns policy option', () => {
  it('applies the preset with default or overridden reasons, ahead of gitPatterns', () => {
    expect(reason({ standardGitPatterns: true }, 'git push -f')).toContain('Force pushes')
    expect(reason({ standardGitPatterns: {} }, 'git commit --amend')).toContain('amend')
    expect(reason({ standardGitPatterns: { forcePush: 'custom' } }, 'git push -f')).toBe('custom')
    const both: CommandPolicy = {
      standardGitPatterns: true,
      gitPatterns: [{ pattern: /\bgit\s+status\b/, reason: 'no status' }],
    }
    expect(reason(both, 'git status')).toBe('no status')
    expect(reason(both, 'git push --force-if-includes')).toBeNull()
  })

  it('applies nothing when the option is absent or false', () => {
    expect(reason({}, 'git push -f')).toBeNull()
    expect(reason({ standardGitPatterns: false }, 'git push -f')).toBeNull()
  })
})
