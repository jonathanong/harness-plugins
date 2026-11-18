import { execFileSync } from 'node:child_process'
import { existsSync, realpathSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

import { probeEnv } from './git-process.mts'

/** Where a path sits: its repository (by common git directory) and its path in that worktree. */
export type PathLocation = { commonDir: string; pathInWorktree: string }

/**
 * Finds the git worktree a path is in. Returns null when git says the path is in no repository,
 * and undefined when git cannot answer (a timeout, no git binary), so a caller can fail closed.
 */
export type PathLocator = (absolutePath: string) => PathLocation | null | undefined

const NOT_A_REPOSITORY = 128

// The path need not exist yet (`mkdir -p a/b`), so git runs in its nearest existing ancestor.
function nearestExisting(path: string): string {
  let current = path
  while (!existsSync(current)) current = dirname(current)
  return current
}

/** A locator that asks `git` (the binary named, for tests). */
export function createPathLocator(gitBinary = 'git'): PathLocator {
  return (absolutePath) => {
    const existing = nearestExisting(absolutePath)
    const directory = statSync(existing).isDirectory() ? existing : dirname(existing)
    let stdout: string
    try {
      stdout = execFileSync(
        gitBinary,
        ['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-common-dir'],
        {
          cwd: directory,
          encoding: 'utf8',
          env: probeEnv(),
          stdio: ['ignore', 'pipe', 'ignore'],
          timeout: 5_000,
        },
      )
    } catch (error) {
      return (error as { status?: number | null }).status === NOT_A_REPOSITORY ? null : undefined
    }
    const [topLevel, commonDir] = stdout.trim().split('\n')
    const real = join(realpathSync(existing), relative(existing, absolutePath))
    return { commonDir: commonDir!, pathInWorktree: relative(topLevel!, real) }
  }
}

export const defaultPathLocator: PathLocator = createPathLocator()
