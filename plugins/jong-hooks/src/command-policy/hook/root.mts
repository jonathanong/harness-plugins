import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { hookCwd } from '../payload.mts'
import type { HookPayload } from '../types.mts'
import type { HookHarness } from './types.mts'

/** The nearest ancestor of `start` (itself included) that holds a `.git` entry, or undefined. */
export function findGitToplevel(start: string): string | undefined {
  let dir = resolve(start)
  for (;;) {
    // `.git` is a file in linked worktrees and submodules, so test for existence, not a directory.
    if (existsSync(join(dir, '.git'))) return dir
    const parent = dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

/**
 * Where the policy file is looked up: `--root`, else Claude's project-dir variable
 * (`CLAUDE_PROJECT_DIR`), else the git toplevel of the payload's `cwd` (Codex sets no project-dir
 * variable and may run in a subdirectory), else the hook process's working directory. Codex
 * ignores `CLAUDE_PROJECT_DIR`: a Codex session started from a Claude session inherits it, and it
 * names the Claude session's project, not this one.
 */
export function resolveRoot(
  flagRoot: string | undefined,
  env: NodeJS.ProcessEnv,
  payload: HookPayload,
  processCwd: string,
  harness: HookHarness,
): string {
  const explicit = flagRoot ?? (harness === 'codex' ? undefined : env.CLAUDE_PROJECT_DIR)
  if (explicit !== undefined) return resolve(processCwd, explicit)
  const sessionCwd = resolve(processCwd, hookCwd(payload, processCwd))
  return findGitToplevel(sessionCwd) ?? resolve(processCwd)
}
