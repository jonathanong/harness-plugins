import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach } from 'vitest'

import type { HookContext, HookIo } from '../index.mts'

const dirs: string[] = []

/** Removes the policy directories each test made. Call it once at the top of a test file. */
export function useTempPolicyDirs(): void {
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
    Reflect.deleteProperty(globalThis, '__hookSeen')
  })
}

export const context = (overrides: Partial<HookContext> = {}): HookContext => ({
  harness: 'claude',
  payload: {},
  env: {},
  root: '/repo',
  ...overrides,
})
export const bash = (command: string) => ({ tool_name: 'Bash', tool_input: { command } })

export function module(source: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'hook-policy-'))
  dirs.push(dir)
  writeFileSync(join(dir, 'policy.mjs'), source)
  return dir
}

export function io(root: string, stdin: string, env: NodeJS.ProcessEnv = {}) {
  const out: string[] = []
  const err: string[] = []
  const harness: HookIo = {
    readStdin: async () => stdin,
    stdout: { write: (text) => out.push(text) },
    stderr: { write: (text) => err.push(text) },
    env,
    cwd: root,
  }
  return { harness, out, err }
}

export const forcePolicy = `export default {
  command: { gitPatterns: [{ pattern: /push --force/, reason: 'no force' }] },
  reminder: () => 'hello',
}`
