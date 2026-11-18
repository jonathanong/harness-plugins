import { homedir } from 'node:os'
import { isAbsolute, posix, resolve } from 'node:path'

import { defaultPathLocator, type PathLocation, type PathLocator } from './path-location.mts'
import { referencesPath } from './path-references.mts'
import type { HookPayload, PathTypoRule, ProtectedPaths } from './types.mts'

/** True when `token` is the segment, or has it as a leading, trailing, or interior path segment. */
function tokenReferencesSegment(token: string, segment: string): boolean {
  return (
    token === segment ||
    token.startsWith(`${segment}/`) ||
    token.endsWith(`/${segment}`) ||
    token.includes(`/${segment}/`)
  )
}

/** The first typo rule the payload or command references, or undefined. */
export function findPathTypo(
  payload: HookPayload,
  command: string,
  rules: readonly PathTypoRule[],
): PathTypoRule | undefined {
  return rules.find((rule) =>
    referencesPath(payload, command, (token) => tokenReferencesSegment(token, rule.segment)),
  )
}

/**
 * Whether `rawToken` names a protected file or directory. Dot segments collapse
 * (`dir/./hooks/x` -> `dir/hooks/x`) so redundant path noise cannot hide a literal match. The match
 * is deliberately not resolved against the command's cwd, so a `cd` plus a relative path is the
 * indirection this check does not catch.
 */
export function protectedPathMatch(rawToken: string, protectedPaths: ProtectedPaths): boolean {
  const token = rawToken === '' ? rawToken : posix.normalize(rawToken)
  if (protectedPaths.exactFiles.some((file) => token === file || token.endsWith(`/${file}`))) {
    return true
  }
  return protectedPaths.dirPrefixes.some((prefix) => {
    const bareDir = prefix.slice(0, -1)
    return (
      token === bareDir ||
      token.startsWith(prefix) ||
      token.endsWith(`/${bareDir}`) ||
      token.includes(`/${prefix}`)
    )
  })
}

/** Where the call runs, for resolving written paths to the repository they land in. */
export type ProtectedPathContext = {
  /** Directory the call runs in. */
  cwd?: string | undefined
  /** The repository the policy protects is the one this directory is in. Defaults to `cwd`. */
  root?: string | undefined
  locatePath?: PathLocator | undefined
}

/**
 * Whether the call writes a protected path. A written path that matches by name is then resolved
 * (through the command's `cd`s) to the git worktree it lands in: it counts only when that worktree
 * belongs to the protected repository, and only when its path inside the worktree matches exactly.
 * A path that cannot be resolved (an unknown directory, a variable, git cannot answer) counts on
 * its name alone, so uncertainty blocks.
 */
export function referencesProtectedPath(
  payload: HookPayload,
  command: string,
  protectedPaths: ProtectedPaths,
  context: ProtectedPathContext = {},
): boolean {
  const locate = context.locatePath ?? defaultPathLocator
  const repositoryRoot = context.root ?? context.cwd
  let protectedRepository: PathLocation | null | undefined
  let located = false
  const repository = () => {
    if (!located && repositoryRoot !== undefined) protectedRepository = locate(repositoryRoot)
    located = true
    return protectedRepository
  }
  const matches = (token: string, cwd: string | undefined): boolean => {
    if (!protectedPathMatch(token, protectedPaths)) return false
    const path = absolutePath(token, cwd)
    if (path === undefined || /(?:^|\/)\.git(?:\/|$)/.test(path)) return true
    const target = locate(path)
    const home = repository()
    if (target === undefined || home === undefined || home === null) return true
    if (target === null || target.commonDir !== home.commonDir) return false
    return protectedPathInWorktree(target.pathInWorktree, protectedPaths)
  }
  return referencesPath(payload, command, matches, {
    splitRedirections: true,
    writesOnly: true,
    cwd: context.cwd,
  })
}

// Shell expansion the hook cannot evaluate, other than a leading `~/`.
const UNRESOLVED = /[$`*?[{]|^~(?!\/)/

function absolutePath(token: string, cwd: string | undefined): string | undefined {
  if (UNRESOLVED.test(token)) return undefined
  if (token.startsWith('~/')) return resolve(homedir(), token.slice(2))
  if (isAbsolute(token)) return resolve(token)
  return cwd === undefined ? undefined : resolve(cwd, token)
}

/** Exact match of a path relative to its worktree's top level. */
function protectedPathInWorktree(path: string, protectedPaths: ProtectedPaths): boolean {
  return (
    protectedPaths.exactFiles.includes(path) ||
    protectedPaths.dirPrefixes.some(
      (prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix),
    )
  )
}
