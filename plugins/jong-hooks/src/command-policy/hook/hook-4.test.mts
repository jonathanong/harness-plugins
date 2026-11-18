import { describe, expect, it } from 'vitest'
import { defineHookPolicy, runHook } from '../index.mts'
import { bash, forcePolicy, io, module, useTempPolicyDirs } from './hook-support.test-support.mts'

useTempPolicyDirs()

describe('loadHookPolicy and runHook', () => {
  it('writes the confirm allow only for an attended Claude session and runs onPayload first', async () => {
    const root = module(`export default {
      command: {}, onPayload: ctx => { globalThis.__hookSeen = ctx.harness },
    }`)
    const attended = { CLAUDE_CODE_SESSION_ATTENDED: '1' }
    const run = io(root, JSON.stringify(bash('gh pr merge 4')), attended)
    const args = ['pre-tool-use', '--harness', 'claude', '--policy', 'policy.mjs']
    expect(await runHook(args, run.harness)).toBe(0)
    expect(JSON.parse(run.out[0]!).hookSpecificOutput.permissionDecision).toBe('allow')
    expect((globalThis as { __hookSeen?: string }).__hookSeen).toBe('claude')
    const ci = io(root, JSON.stringify(bash('gh pr merge 4')), { ...attended, CI: 'true' })
    expect(await runHook(args, ci.harness)).toBe(2)
  })

  it('fails pre-tool-use closed and post-tool-use open when the policy cannot load', async () => {
    const root = module('throw new Error("bad policy")')
    const pre = io(root, '{}')
    expect(
      await runHook(['pre-tool-use', '--harness', 'claude', '--policy', 'policy.mjs'], pre.harness),
    ).toBe(2)
    expect(pre.err.join('')).toContain('jong-hooks pre-tool-use: bad policy')
    const post = io(root, '{}')
    expect(
      await runHook(
        ['post-tool-use', '--harness', 'claude', '--policy', 'policy.mjs'],
        post.harness,
      ),
    ).toBe(0)
    expect(post.err.join('')).toContain('jong-hooks post-tool-use: bad policy')
    const missing = io(root, '{}')
    expect(
      await runHook(
        ['pre-tool-use', '--harness', 'claude', '--policy', 'nope.mjs'],
        missing.harness,
      ),
    ).toBe(2)
  })

  it('reports a non-Error failure and bad arguments', async () => {
    const root = module('throw "plain"')
    const run = io(root, '{}')
    await runHook(['post-tool-use', '--harness', 'claude', '--policy', 'policy.mjs'], run.harness)
    expect(run.err.join('')).toContain('plain')
    const bad = io(root, '{}')
    expect(await runHook(['pre-tool-use'], bad.harness)).toBe(2)
    expect(bad.err.join('')).toContain('usage: jong-hooks')
    const postTypo = io(root, '{}')
    expect(await runHook(['post-tool-use', '--harnes', 'claude'], postTypo.harness)).toBe(0)
    expect(postTypo.err.join('')).toContain('unknown argument')
  })

  it('emits post-tool-use context from the policy', async () => {
    const root = module(forcePolicy)
    const run = io(root, JSON.stringify({ tool_input: { file_path: 'a.md' } }))
    expect(
      await runHook(
        ['post-tool-use', '--harness', 'cursor', '--policy', 'policy.mjs'],
        run.harness,
      ),
    ).toBe(0)
    expect(JSON.parse(run.out[0]!).hookSpecificOutput.additionalContext).toBe('hello')
  })

  it('reports a failing onPayload without suppressing the policy', async () => {
    const root = module(`export default {
      command: { commandPatterns: [{ pattern: /deploy/, reason: 'no deploy' }] },
      onPayload: () => { throw new Error('persist failed') },
    }`)
    const pre = io(root, JSON.stringify(bash('deploy now')))
    const args = ['pre-tool-use', '--harness', 'claude', '--policy', 'policy.mjs']
    expect(await runHook(args, pre.harness)).toBe(2)
    expect(pre.err.join('')).toContain('onPayload failed: persist failed')
    expect(pre.err.join('')).toContain('no deploy')
    const plain = module('export default { onPayload: async () => { throw "bare" } }')
    const post = io(plain, '{}')
    expect(
      await runHook(
        ['post-tool-use', '--harness', 'claude', '--policy', 'policy.mjs'],
        post.harness,
      ),
    ).toBe(0)
    expect(post.err.join('')).toContain('onPayload failed: bare')
  })

  it('treats an unreadable stdin as a policy failure', async () => {
    const root = module('export default {}')
    const run = io(root, '')
    run.harness.readStdin = async () => {
      throw new Error('stdin closed')
    }
    const args = ['--harness', 'claude', '--policy', 'policy.mjs']
    expect(await runHook(['pre-tool-use', ...args], run.harness)).toBe(2)
    expect(await runHook(['post-tool-use', ...args], run.harness)).toBe(0)
    expect(run.err.join('')).toContain('stdin closed')
  })

  it('treats --automation-env names as unattended markers', async () => {
    const root = module(`export default {
      command: { protectedPaths: { dirPrefixes: ['locked/'], exactFiles: [], reason: 'locked' } },
    }`)
    const edit = JSON.stringify({ tool_input: { file_path: 'locked/a' } })
    const base = ['pre-tool-use', '--harness', 'codex', '--policy', 'policy.mjs']
    const plain = io(root, edit, { MY_RUN: '1' })
    expect(await runHook(base, plain.harness)).toBe(0)
    const marked = io(root, edit, { MY_RUN: '1' })
    expect(await runHook([...base, '--automation-env', 'MY_RUN'], marked.harness)).toBe(2)
    const off = io(root, edit, { MY_RUN: '0' })
    expect(await runHook([...base, '--automation-env', 'MY_RUN'], off.harness)).toBe(0)
  })

  it('fails pre-tool-use closed on a malformed payload but not post-tool-use', async () => {
    const root = module('export default { command: {} }')
    const args = ['--harness', 'claude', '--policy', 'policy.mjs']
    const pre = io(root, '{"tool_input":')
    expect(await runHook(['pre-tool-use', ...args], pre.harness)).toBe(2)
    expect(pre.err.join('')).toContain('not valid JSON')
    const post = io(root, '{"tool_input":')
    expect(await runHook(['post-tool-use', ...args], post.harness)).toBe(0)
    expect(post.err).toEqual([])
  })

  it('stays silent in post-tool-use when there is nothing to say', async () => {
    const root = module('export default {}')
    const run = io(root, '{}')
    expect(
      await runHook(
        ['post-tool-use', '--harness', 'claude', '--policy', 'policy.mjs'],
        run.harness,
      ),
    ).toBe(0)
    expect([run.out, run.err]).toEqual([[], []])
  })

  it('types policy modules through defineHookPolicy', () => {
    const policy = defineHookPolicy({ checkers: [] })
    expect(policy).toEqual({ checkers: [] })
  })
})
