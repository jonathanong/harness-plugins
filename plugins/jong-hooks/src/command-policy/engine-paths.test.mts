import { describe, expect, it } from 'vitest'
import { evaluateCommandPolicy, standardGitPatterns } from './index.mts'
import type { CommandPolicy, HookPayload } from './index.mts'

const policy: CommandPolicy = {
  typoPaths: [{ segment: '.claire', reason: 'Typo: .claire should be .claude.' }],
  commandPatterns: [
    { pattern: /\bHOOKS=0\b/, reason: 'HOOKS=0 disables hooks.' },
    {
      pattern: /(?:^|[;&|(\n]+)\s*(?:\S+=\S+\s+)*devserver\s+start\b/,
      reason: 'Use the managed dev runner.',
    },
  ],
  gitPatterns: standardGitPatterns({ pullRebase: 'Use ./rebase-script.' }),
  rebaseContinueReason: 'Use GIT_EDITOR=true git rebase --continue.',
  mergeGuidance: 'See docs/merge.md.',
}

const TYPO = 'Typo: .claire should be .claude.'
const bash = (command: string): HookPayload => ({ tool_name: 'Bash', tool_input: { command } })
const reasonOf = (payload: HookPayload, automationContext = false, p = policy) =>
  evaluateCommandPolicy(payload, p, { automationContext, cwd: '/repo' })?.reason ?? null

describe('evaluateCommandPolicy typo paths', () => {
  it('blocks a typo segment in a command, a path field, and a patch header', () => {
    expect(reasonOf(bash('cat .claire/settings.json'))).toBe(policy.typoPaths![0]!.reason)
    expect(reasonOf({ tool_input: { file_path: '/repo/.claire/x' } })).toContain('Typo')
    expect(reasonOf(bash('*** Begin Patch\n*** Update File: a/.claire/x\n'))).toContain('Typo')
  })

  it('ignores a typo spelled only in a non-path field or patch body', () => {
    expect(reasonOf({ tool_input: { note: '.claire' } })).toBeNull()
    expect(reasonOf(bash('*** Begin Patch\n*** Update File: ok.txt\n+.claire\n'))).toBeNull()
  })

  it.each([
    'echo x > .claire/a',
    'cp a /repo/.claire',
    'cat a/.claire',
    '*** Begin Patch\n*** Move to: .claire/x\n',
    '*** Begin Patch\n*** Add File: x/.claire/y\n',
  ])('blocks the typo in %j, attended or not', (command) => {
    expect(reasonOf(bash(command), true)).toBe(TYPO)
    expect(reasonOf(bash(command), false)).toBe(TYPO)
  })

  it.each([
    'cat .claire-other/a',
    'echo .claired',
    '*** Begin Patch\n*** Update File: ok\n+.claire/a\n',
  ])('allows %j', (command) => {
    expect(reasonOf(bash(command))).toBeNull()
  })

  it('reads nested payload arrays and skips the command field', () => {
    expect(reasonOf({ tool_input: { edits: [{ target_path: '.claire/x' }, 1, null] } })).toBe(TYPO)
    expect(reasonOf({ tool_input: { command: 'echo' }, list: ['x'] })).toBeNull()
    expect(
      reasonOf({ tool_input: { filePath: '*** Begin Patch\n*** Delete File: .claire/x' } }),
    ).toBe(TYPO)
    expect(reasonOf({ command: '' })).toBeNull()
  })

  it('reads patch headers inside an apply_patch heredoc', () => {
    const patch =
      "apply_patch <<'EOF'\n*** Begin Patch\n*** Update File: .claire/x\n*** End Patch\nEOF"
    expect(reasonOf(bash(patch))).toBe(TYPO)
    const safe = "apply_patch <<'EOF'\n*** Begin Patch\n*** Update File: ok.txt\n*** End Patch\nEOF"
    expect(reasonOf(bash(safe))).toBeNull()
    expect(reasonOf(bash('  *** Begin Patch\n*** Add File: .claire/x'))).toBe(TYPO)
  })

  it('reads camelCase path keys and empty shell words', () => {
    expect(reasonOf({ tool_input: { filePath: '.claire/x' } })).toBe(TYPO)
    expect(reasonOf(bash('cat "" ok'))).toBeNull()
    expect(reasonOf({ tool_input: { file_path: '' } })).toBeNull()
  })

  it('reads typos inside nested shell commands', () => {
    for (const command of ["sh -c 'printf x > .claire/a'", 'echo "$(touch .claire/x)"']) {
      expect(reasonOf(bash(command))).toBe(TYPO)
    }
  })

  it('needs no rules to allow anything', () => {
    expect(reasonOf(bash('anything'), true, {})).toBeNull()
    expect(reasonOf(bash('gh pr view 1'), false, {})).toBeNull()
  })
})
