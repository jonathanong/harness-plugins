import { relative } from 'node:path'

import type { PathLocator } from '../path-location.mts'

/**
 * A locator for tests: `root` is a repository, and each of `worktrees` is another worktree of it
 * (a linked worktree may sit inside the main one, as `.claude/worktrees/<name>` does). Every other
 * path is in no repository.
 */
export function fakeRepository(root: string, worktrees: readonly string[] = []): PathLocator {
  // The innermost worktree wins, so the longest top level is tried first.
  const tops = [...worktrees, root].toSorted((a, b) => b.length - a.length)
  return (path) => {
    const top = tops.find((candidate) => path === candidate || path.startsWith(`${candidate}/`))
    return top === undefined
      ? null
      : { commonDir: `${root}/.git`, pathInWorktree: relative(top, path) }
  }
}
