import { describe, expect, it } from 'vitest'
import { evaluateCommandPolicy, standardGitPatterns } from './index.mts'
import type { CommandPolicy, HookPayload } from './index.mts'

const policy: CommandPolicy = {
  typoPaths: [{ segment: '.claire', reason: 'Typo: .claire should be .claude.' }],
  protectedPaths: {
    dirPrefixes: ['tools/hooks/', '.agent/rules/'],
    exactFiles: ['tools/policy.mts', '.agent/config.toml'],
    reason: 'Protected policy files cannot be edited in automation.',
  },
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

const bash = (command: string): HookPayload => ({ tool_name: 'Bash', tool_input: { command } })
const reasonOf = (payload: HookPayload, automationContext = false, p = policy) =>
  evaluateCommandPolicy(payload, p, { automationContext })?.reason ?? null

describe('evaluateCommandPolicy typo and protected paths', () => {
  it('blocks a typo segment in a command, a path field, and a patch header', () => {
    expect(reasonOf(bash('cat .claire/settings.json'))).toBe(policy.typoPaths![0]!.reason)
    expect(reasonOf({ tool_input: { file_path: '/repo/.claire/x' } })).toContain('Typo')
    expect(reasonOf(bash('*** Begin Patch\n*** Update File: a/.claire/x\n'))).toContain('Typo')
  })

  it('ignores a typo spelled only in a non-path field or patch body', () => {
    expect(reasonOf({ tool_input: { note: '.claire' } })).toBeNull()
    expect(reasonOf(bash('*** Begin Patch\n*** Update File: ok.txt\n+.claire\n'))).toBeNull()
  })

  it('blocks protected paths only in automation', () => {
    const edit = { tool_input: { file_path: 'tools/hooks/a.mts' } }
    expect(reasonOf(edit, true)).toBe(policy.protectedPaths!.reason)
    expect(reasonOf(edit, false)).toBeNull()
    expect(evaluateCommandPolicy(edit, policy)?.reason).toBe(policy.protectedPaths!.reason)
  })

  it.each([
    'echo x > tools/hooks/a.mts',
    'echo x >tools/hooks/a.mts',
    'sed -i s/a/b/ ./tools/./policy.mts',
    'cp a /abs/tools/hooks',
    '*** Begin Patch\n*** Move to: tools/policy.mts\n',
    '*** Begin Patch\n*** Add File: .agent/rules/x\n',
  ])('blocks %j in automation', (command) => {
    expect(reasonOf(bash(command), true)).toBe(policy.protectedPaths!.reason)
  })

  it.each([
    'cat tools/hooks-other/a',
    '*** Begin Patch\n*** Update File: ok.txt\n+tools/hooks/a\n',
  ])('allows %j', (command) => {
    expect(reasonOf(bash(command), true)).toBeNull()
  })

  it('reads nested payload arrays and skips the command field', () => {
    const nested = { edits: [{ target_path: 'tools/policy.mts' }, 1, null] }
    expect(reasonOf({ tool_input: nested }, true)).toBe(policy.protectedPaths!.reason)
    expect(reasonOf({ tool_input: { command: 'echo' }, list: ['x'] }, true)).toBeNull()
    expect(
      reasonOf(
        { tool_input: { filePath: '*** Begin Patch\n*** Delete File: .agent/rules/x' } },
        true,
      ),
    ).toContain('Protected')
    expect(reasonOf({ command: '' }, true)).toBeNull()
  })

  it('reads patch headers inside an apply_patch heredoc', () => {
    const patch =
      "apply_patch <<'EOF'\n*** Begin Patch\n*** Update File: tools/policy.mts\n*** End Patch\nEOF"
    expect(reasonOf(bash(patch), true)).toBe(policy.protectedPaths!.reason)
    const safe = "apply_patch <<'EOF'\n*** Begin Patch\n*** Update File: ok.txt\n*** End Patch\nEOF"
    expect(reasonOf(bash(safe), true)).toBeNull()
    expect(reasonOf(bash('  *** Begin Patch\n*** Add File: tools/policy.mts'), true)).toBe(
      policy.protectedPaths!.reason,
    )
  })

  it('reads camelCase path keys and empty shell words', () => {
    expect(reasonOf({ tool_input: { filePath: 'tools/policy.mts' } }, true)).toBe(
      policy.protectedPaths!.reason,
    )
    expect(reasonOf(bash('cat "" ok'), true)).toBeNull()
    expect(reasonOf({ tool_input: { file_path: '' } }, true)).toBeNull()
  })

  it('reads protected paths inside nested shell commands', () => {
    for (const command of [
      "sh -c 'printf x > tools/hooks/a.mts'",
      'echo "$(touch tools/policy.mts)"',
    ]) {
      expect(reasonOf(bash(command), true)).toBe(policy.protectedPaths!.reason)
    }
  })

  it('needs no rules to allow anything', () => {
    expect(reasonOf(bash('anything'), true, {})).toBeNull()
    expect(reasonOf(bash('gh pr view 1'), false, {})).toBeNull()
  })
})
