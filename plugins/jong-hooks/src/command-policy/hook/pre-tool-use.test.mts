import { describe, expect, it } from 'vitest'
import { preToolUseOutput } from '../index.mts'

const bash = (command: string) => ({ tool_name: 'Bash', tool_input: { command } })

describe('preToolUseOutput', () => {
  const policy = {
    gitPatterns: [{ pattern: /\bgit\s+push\s+--force\b/, reason: 'no force' }],
    mergeGuidance: 'See merge.md.',
  }

  it('is silent when the policy has no opinion', () => {
    expect(preToolUseOutput(bash('ls'), policy)).toEqual({ exitCode: 0, stderr: '', stdout: '' })
  })

  it('exits 2 with the reason on stderr and a deny JSON on stdout', () => {
    expect(
      preToolUseOutput(bash('git push --force'), policy, { automationContext: false }),
    ).toEqual({
      exitCode: 2,
      stderr: 'no force\n',
      stdout: JSON.stringify({ decision: 'deny', reason: 'no force' }),
    })
  })

  it('blocks a merge in automation and defaults to automation', () => {
    expect(preToolUseOutput(bash('gh pr merge 1'), policy).exitCode).toBe(2)
    expect(
      preToolUseOutput(bash('gh pr merge 1'), policy, { automationContext: true }).stderr,
    ).toContain('See merge.md.')
  })

  it('allows an interactive merge silently only for an attended Claude session', () => {
    const merge = bash('gh pr merge 1')
    const interactive = { automationContext: false }
    const allowed = preToolUseOutput(merge, policy, {
      ...interactive,
      harness: 'claude',
      attended: true,
    })
    expect(allowed.exitCode).toBe(0)
    expect(JSON.parse(allowed.stdout).hookSpecificOutput).toMatchObject({
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
      permissionDecisionReason: expect.stringContaining('See merge.md.'),
    })
    const plain = preToolUseOutput(merge, {}, { ...interactive, harness: 'claude', attended: true })
    expect(JSON.parse(plain.stdout).hookSpecificOutput.permissionDecisionReason).toMatch(
      /this session\.$/,
    )
    for (const options of [
      { harness: 'claude' as const, attended: false },
      { harness: 'codex' as const, attended: true },
      { attended: true },
      {},
    ]) {
      expect(preToolUseOutput(merge, policy, { ...interactive, ...options })).toEqual({
        exitCode: 0,
        stderr: '',
        stdout: '',
      })
    }
  })

  it('answers Cursor with an empty JSON object when it has no opinion', () => {
    expect(preToolUseOutput(bash('ls'), policy, { harness: 'cursor' }).stdout).toBe('{}')
    expect(
      preToolUseOutput(bash('gh pr merge 1'), policy, {
        harness: 'cursor',
        attended: true,
        automationContext: false,
      }),
    ).toEqual({ exitCode: 0, stderr: '', stdout: '{}' })
  })

  it('passes an explicit cwd through', () => {
    const stack = { stack: { git: { isAncestor: () => false } as never } }
    expect(
      preToolUseOutput(bash('gh stack init t'), stack, { automationContext: false, cwd: '/x' })
        .exitCode,
    ).toBe(2)
  })
})
