import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadHookPolicy, runHook } from '../index.mts'
import {
  bash,
  context,
  forcePolicy,
  io,
  module,
  useTempPolicyDirs,
} from './hook-support.test-support.mts'

useTempPolicyDirs()

describe('loadHookPolicy and runHook', () => {
  it('loads an object, a function, a named export, and rejects anything else', async () => {
    const root = module(forcePolicy)
    expect(await loadHookPolicy('policy.mjs', context({ root }))).toHaveProperty('command')
    const fnRoot = module('export default (ctx) => ({ reminder: () => ctx.harness })')
    const fn = await loadHookPolicy('policy.mjs', context({ root: fnRoot }))
    expect(await fn.reminder?.(context())).toBe('claude')
    const named = module('export const policy = { checkers: [] }')
    expect(await loadHookPolicy(join(named, 'policy.mjs'), context())).toEqual({ checkers: [] })
    for (const [field, value] of [
      ['command', '[]'],
      ['checkers', '{}'],
      ['reminder', '"x"'],
      ['onPayload', '1'],
    ]) {
      const invalid = module(`export default { ${field}: ${value} }`)
      await expect(loadHookPolicy('policy.mjs', context({ root: invalid }))).rejects.toThrow(
        `invalid \`${field}\``,
      )
    }
    for (const body of ['export default 5', 'export default [1]', 'export const x = 1']) {
      const bad = module(body)
      await expect(loadHookPolicy('policy.mjs', context({ root: bad }))).rejects.toThrow(
        'must default-export a policy object',
      )
    }
  })

  it('selects the named policy of a CommonJS module', async () => {
    const root = module('')
    writeFileSync(join(root, 'policy.cjs'), "exports.policy = { reminder: () => 'from cjs' }")
    const policy = await loadHookPolicy('policy.cjs', context({ root }))
    expect(await policy.reminder?.(context())).toBe('from cjs')
    const plain = module('')
    writeFileSync(join(plain, 'policy.cjs'), "module.exports = { reminder: () => 'whole' }")
    expect(
      await (await loadHookPolicy('policy.cjs', context({ root: plain }))).reminder?.(context()),
    ).toBe('whole')
  })

  it('has no opinion, merge authority included, without a command table', async () => {
    const root = module('export default { reminder: () => "x" }')
    const run = io(root, JSON.stringify(bash('gh pr merge 1')), { CI: 'true' })
    const args = ['pre-tool-use', '--harness', 'claude', '--policy', 'policy.mjs']
    expect(await runHook(args, run.harness)).toBe(0)
    expect([run.out, run.err]).toEqual([[], []])
  })

  it('uses the configured root as the command cwd when the payload names none', async () => {
    const root = module(`export default {
      command: { stack: { git: { isAncestor: (cwd) => cwd === process.env.EXPECT_ROOT ? false : true } } },
    }`)
    process.env.EXPECT_ROOT = root
    try {
      const run = io(root, JSON.stringify(bash('gh stack init t')))
      const args = ['pre-tool-use', '--harness', 'codex', '--policy', 'policy.mjs']
      expect(await runHook(args, run.harness)).toBe(2)
    } finally {
      delete process.env.EXPECT_ROOT
    }
  })

  it('blocks through pre-tool-use with exit 2', async () => {
    const root = module(forcePolicy)
    const run = io(root, JSON.stringify(bash('git push --force')))
    const code = await runHook(
      ['pre-tool-use', '--harness', 'claude', '--policy', 'policy.mjs'],
      run.harness,
    )
    expect(code).toBe(2)
    expect(run.err).toEqual(['no force\n'])
    expect(JSON.parse(run.out[0]!)).toEqual({ decision: 'deny', reason: 'no force' })
  })

  it('allows silently and resolves --root against the working directory', async () => {
    const root = module(forcePolicy)
    const run = io(tmpdir(), JSON.stringify(bash('ls')))
    const code = await runHook(
      ['pre-tool-use', '--harness', 'codex', '--policy', 'policy.mjs', '--root', root],
      run.harness,
    )
    expect(code).toBe(0)
    expect([run.out, run.err]).toEqual([[], []])
  })
})
