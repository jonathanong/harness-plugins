import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { runHook } from '../index.mts'
import { io } from './policy-modules.test-support.mts'

// Payload shapes from Codex CLI 0.169. The SessionStart payload below was captured from a real
// `codex exec` run with an inline hook (paths and ids replaced). The PreToolUse/PostToolUse shapes
// follow the Codex hooks documentation; they could not be captured live because the account that
// ran the capture was out of Codex usage. `apply_patch` carries the patch text in `tool_input.command`.
const sessionStart = {
  session_id: '00000000-0000-7000-8000-000000000000',
  transcript_path: null,
  cwd: '/work/repo/sub',
  hook_event_name: 'SessionStart',
  model: 'gpt-6.1-sol',
  permission_mode: 'default',
  source: 'startup',
}

const toolCall = (cwd: string, tool_name: string, command: string, event = 'PreToolUse') => ({
  ...sessionStart,
  cwd,
  hook_event_name: event,
  turn_id: '00000000-0000-7000-8000-000000000001',
  tool_name,
  tool_use_id: 'call_1',
  tool_input: { command },
})

const POLICY = `export default { command: {
  commandPatterns: [{ pattern: /\\bforbidden-cmd\\b/, reason: 'blocked by test' }],
  protectedPaths: { exactFiles: ['policy.config.json'], reason: 'Policy files are edited by a human.' },
} }`

const dirs: string[] = []
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

// A throwaway repository with the policy file, and a subdirectory to run the session in.
function project(): string {
  const top = realpathSync(mkdtempSync(join(tmpdir(), 'codex-hook-')))
  dirs.push(top)
  mkdirSync(join(top, '.git'))
  mkdirSync(join(top, '.claude'))
  mkdirSync(join(top, 'sub'))
  writeFileSync(join(top, '.claude', 'jong-hooks.policy.mjs'), POLICY)
  return top
}

async function run(top: string, payload: unknown, env: NodeJS.ProcessEnv = {}, event = 'pre') {
  const args = [`${event}-tool-use`, '--harness', 'codex']
  const result = io('/', JSON.stringify(payload), env)
  const code = await runHook(args, result.harness)
  return { code, out: result.out.join(''), err: result.err.join('') }
}

describe('Codex hook payloads', () => {
  it('blocks a Bash call in a subdirectory with exit 2 and the reason on stderr', async () => {
    const top = project()
    const blocked = await run(top, toolCall(join(top, 'sub'), 'Bash', 'forbidden-cmd --now'))
    expect(blocked.code).toBe(2)
    expect(blocked.err).toBe('blocked by test\n')
    expect(blocked.out).toBe('')
    expect((await run(top, toolCall(join(top, 'sub'), 'Bash', 'echo ok'))).code).toBe(0)
  })

  it('blocks an apply_patch call that edits a protected file in automation only', async () => {
    const top = project()
    const patch =
      '*** Begin Patch\n*** Update File: policy.config.json\n@@\n-a\n+b\n*** End Patch\n'
    const payload = toolCall(join(top, 'sub'), 'apply_patch', patch)
    const blocked = await run(top, payload, { CI: 'true' })
    expect(blocked.code).toBe(2)
    expect(blocked.err).toContain('Policy files are edited by a human.')
    // Without a CI marker Codex counts as attended: no signal separates `codex exec` from a TUI.
    expect((await run(top, payload)).code).toBe(0)
  })

  it('treats a PostToolUse payload as advisory and exits 0', async () => {
    const top = project()
    const payload = toolCall(join(top, 'sub'), 'Bash', 'forbidden-cmd', 'PostToolUse')
    expect((await run(top, payload, {}, 'post')).code).toBe(0)
  })

  it('has no opinion about a repository without a policy file', async () => {
    const top = project()
    rmSync(join(top, '.claude'), { recursive: true })
    const result = await run(top, toolCall(join(top, 'sub'), 'Bash', 'forbidden-cmd'))
    expect([result.code, result.out, result.err]).toEqual([0, '', ''])
  })

  it('does not block a SessionStart payload, which carries no tool call', async () => {
    const top = project()
    const result = await run(top, { ...sessionStart, cwd: join(top, 'sub') })
    expect(result.code).toBe(0)
  })
})
