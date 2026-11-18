import { describe, expect, it } from 'vitest'
import {
  isAutomationContext,
  normalizeCursorShellPayload,
  parseHookArgs,
  parseHookPayload,
  resolveHarness,
} from '../index.mts'

describe('parseHookArgs', () => {
  it('parses event, harness, policy, and root in either flag form', () => {
    expect(parseHookArgs(['pre-tool-use', '--harness', 'codex', '--policy', 'p.mjs'])).toEqual({
      event: 'pre-tool-use',
      harness: 'codex',
      policy: 'p.mjs',
      automationEnv: [],
    })
    expect(
      parseHookArgs(['post-tool-use', '--harness=grok', '--policy=p.mjs', '--root', '/r']),
    ).toEqual({
      event: 'post-tool-use',
      harness: 'grok',
      policy: 'p.mjs',
      root: '/r',
      automationEnv: [],
    })
    expect(
      parseHookArgs([
        'pre-tool-use',
        '--harness',
        'claude',
        '--policy',
        'p',
        '--automation-env',
        'A',
        '--automation-env=B',
      ]).automationEnv,
    ).toEqual(['A', 'B'])
  })

  it.each([
    [[], 'unknown or missing hook event: (none)'],
    [['session-start'], 'unknown or missing hook event: session-start'],
    [['pre-tool-use', '--policy', 'p'], '--harness must be one of claude, codex, cursor, grok'],
    [['pre-tool-use', '--harness', 'vim', '--policy', 'p'], '--harness must be one of'],
    [['pre-tool-use', '--harness', 'claude', '--policy='], '--policy <module> must not be empty'],
    [['pre-tool-use', '--harness', 'claude', '--policy'], '--policy needs a value'],
    [['pre-tool-use', '--automation-env'], '--automation-env needs a value'],
    [['pre-tool-use', '--policy', '--root', 'x'], '--policy needs a value'],
    [['pre-tool-use', '--bogus', 'x'], 'unknown argument: --bogus'],
    [['pre-tool-use', 'stray'], 'unknown argument: stray'],
  ])('rejects %j', (args, message) => {
    expect(() => parseHookArgs(args)).toThrow(message)
  })
})

describe('payload and harness detection', () => {
  it('parses stdin defensively', () => {
    expect(parseHookPayload('')).toEqual({})
    expect(parseHookPayload('  \n')).toEqual({})
    expect(parseHookPayload('{nope')).toEqual({})
    expect(parseHookPayload('[1]')).toEqual({})
    expect(parseHookPayload('null')).toEqual({})
    expect(parseHookPayload('{"a":1}')).toEqual({ a: 1 })
    expect(parseHookPayload('{"a":1}', true)).toEqual({ a: 1 })
    expect(() => parseHookPayload('', true)).toThrow('empty')
    expect(() => parseHookPayload('{nope', true)).toThrow('not valid JSON')
    expect(() => parseHookPayload('[1]', true)).toThrow('not a JSON object')
  })

  it('normalizes a Cursor Shell call to the Claude dialect', () => {
    const output = JSON.stringify({ exitCode: 3, output: 'out' })
    expect(normalizeCursorShellPayload({ tool_name: 'Shell', tool_output: output })).toEqual({
      tool_name: 'Bash',
      tool_output: output,
      tool_response: { exit_code: 3, stdout: 'out' },
    })
    expect(
      parseHookPayload(JSON.stringify({ tool_name: 'Shell', tool_output: { exitCode: 0 } }))
        .tool_response,
    ).toEqual({ exit_code: 0, stdout: '' })
  })

  it('prefers Cursors documented stdout field over the output fallback', () => {
    const both = JSON.stringify({ exitCode: 0, stdout: 'documented', output: 'legacy' })
    expect(
      normalizeCursorShellPayload({ tool_name: 'Shell', tool_output: both }).tool_response,
    ).toEqual({ exit_code: 0, stdout: 'documented' })
  })

  it('keeps an existing tool_response and ignores unreadable output', () => {
    const kept = normalizeCursorShellPayload({
      tool_name: 'Shell',
      tool_output: '{"exitCode":1}',
      tool_response: 'mine',
    })
    expect(kept).toMatchObject({ tool_name: 'Bash', tool_response: 'mine' })
    for (const tool_output of ['not json', '{"exitCode":"1"}', 5, undefined, '[]']) {
      expect(normalizeCursorShellPayload({ tool_name: 'Shell', tool_output })).toEqual({
        tool_name: 'Bash',
        tool_output,
      })
    }
    const other = { tool_name: 'Bash' }
    expect(normalizeCursorShellPayload(other)).toBe(other)
  })

  it('lets Grok and Cursor markers override the declared harness', () => {
    expect(resolveHarness('claude', { GROK_SESSION_ID: 's' }, {})).toBe('grok')
    expect(resolveHarness('codex', { GROK_HOOK_EVENT: 'e' }, {})).toBe('grok')
    expect(resolveHarness('claude', { GROK_AGENT: '1' }, {})).toBe('claude')
    expect(resolveHarness('claude', {}, { cursor_version: '1.0' })).toBe('cursor')
    expect(resolveHarness('claude', { CURSOR_VERSION: '1' }, {})).toBe('cursor')
    expect(resolveHarness('claude', { CURSOR_PROJECT_DIR: '/p' }, {})).toBe('cursor')
    expect(resolveHarness('codex', { CURSOR_VERSION: '1' }, {})).toBe('codex')
    expect(resolveHarness('claude', {}, { cursor_version: 3 })).toBe('claude')
    expect(resolveHarness('cursor', {}, {})).toBe('cursor')
  })

  it('reads automation markers strictly', () => {
    expect(isAutomationContext({ GITHUB_ACTIONS: 'true' })).toBe(true)
    expect(isAutomationContext({ CI: 'true' })).toBe(true)
    expect(isAutomationContext({ CI: '1' })).toBe(true)
    expect(isAutomationContext({ CI: 'false' })).toBe(false)
    expect(isAutomationContext({ CLAUDE_CODE_SESSION_ATTENDED: '0' })).toBe(true)
    expect(isAutomationContext({ MY_AGENT_RUN: '1' })).toBe(false)
    expect(isAutomationContext({ MY_AGENT_RUN: '1' }, ['MY_AGENT_RUN'])).toBe(true)
    expect(isAutomationContext({ BUILDKITE: ' TRUE ' })).toBe(true)
    expect(isAutomationContext({ CLAUDE_CODE_SESSION_ATTENDED: '1' })).toBe(false)
    expect(isAutomationContext({})).toBe(false)
  })
})
