import { tokenizeShellWords } from '../shell-parse/index.mts'
import { commandsToInspectForGitHubPolicy } from './github-command-context.mts'
import { isRecord } from './payload.mts'
import { writtenTokens } from './path-writes.mts'
import type { HookPayload } from './types.mts'

const PATCH_BEGIN = '*** Begin Patch'
const PATCH_HEADER_PREFIX = /^(?:\*\*\* (?:Add|Delete|Update) File:|\*\*\* Move to:)\s+/
const KEY_PATH_LIKE_RE = /(?:^|_)(?:cwd|file|filename|path|workdir|workspace)(?:_|$)/i
const WORKING_DIRECTORY_KEY_RE = /(?:^|_)(?:cwd|workdir|workspace)(?:_|$)/i
// Tools that read, search, or run shell text: their path-like payload fields are never written.
const NON_WRITING_TOOLS = new Set(['bash', 'exec_command', 'glob', 'grep', 'ls', 'read', 'shell'])

export type ReferenceOptions = {
  splitRedirections?: boolean
  /** Count only paths the call writes; a read, a listing, or a working directory is no reference. */
  writesOnly?: boolean
}

function keyLooksPathLike(key: string, writesOnly: boolean): boolean {
  const snake = key.replaceAll(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
  return KEY_PATH_LIKE_RE.test(snake) && !(writesOnly && WORKING_DIRECTORY_KEY_RE.test(snake))
}

/** Header lines name the files an apply_patch touches; body text that mentions a path does not. */
function patchHeaderPaths(patch: string): string[] {
  return patch
    .split('\n')
    .filter((line) => PATCH_HEADER_PREFIX.test(line))
    .map((line) => line.replace(PATCH_HEADER_PREFIX, ''))
}

/**
 * The files an apply_patch leaves behind: added files and move destinations, plus updated files
 * that are not moved. Deleted files and the pre-move side of a move are gone afterwards.
 */
export function patchResultPaths(patch: string): string[] {
  const lines = patch.split('\n').filter((line) => PATCH_HEADER_PREFIX.test(line))
  return lines.flatMap((line, index) => {
    const path = line.replace(PATCH_HEADER_PREFIX, '')
    if (line.startsWith('*** Delete File:')) return []
    const moved = lines[index + 1]?.startsWith('*** Move to:') === true
    return line.startsWith('*** Update File:') && moved ? [] : [path]
  })
}

/**
 * Whether a path-shaped reference in the payload or the command satisfies `matches`: the payload's
 * path-like string fields, an apply_patch's header lines, and the command's shell words. The
 * command's own `command` field is read as shell text, never as a field value. With `writesOnly`,
 * the shell words are only the paths a command writes, and a read tool's fields are skipped.
 */
export function referencesPath(
  payload: HookPayload,
  command: string,
  matches: (token: string) => boolean,
  options: ReferenceOptions = {},
): boolean {
  const writesOnly = options.writesOnly === true
  const toolName = String(payload.tool_name ?? payload.toolName ?? '').toLowerCase()
  const readsPayload = !(writesOnly && NON_WRITING_TOOLS.has(toolName))
  return (
    (readsPayload && valueReferences(payload, matches, writesOnly)) ||
    commandReferences(command, matches, options)
  )
}

function commandReferences(
  command: string,
  matches: (token: string) => boolean,
  options: ReferenceOptions,
): boolean {
  if (command.trimStart().startsWith(PATCH_BEGIN)) {
    return patchHeaderPaths(command).some(matches)
  }
  // `apply_patch <<'EOF'` carries its patch in a data heredoc that shell scanning blanks out.
  if (
    command.includes(PATCH_BEGIN) &&
    tokenizeShellWords(command, { splitRedirections: true }).includes('apply_patch') &&
    patchHeaderPaths(command).some(matches)
  ) {
    return true
  }
  // Without splitRedirections a no-space redirect like `>dir/file` stays fused to its operator.
  // Nested scripts (`sh -c`, substitutions, heredoc shell bodies) are read like the outer command.
  return commandsToInspectForGitHubPolicy(command).some((script) =>
    (options.writesOnly === true
      ? writtenTokens(script)
      : tokenizeShellWords(script, options)
    ).some(matches),
  )
}

function valueReferences(
  value: unknown,
  matches: (token: string) => boolean,
  writesOnly: boolean,
  key?: string,
): boolean {
  if (typeof value === 'string') {
    if (value.startsWith(PATCH_BEGIN)) {
      return patchHeaderPaths(value).some(matches)
    }
    return key !== undefined && keyLooksPathLike(key, writesOnly) && matches(value)
  }
  if (Array.isArray(value)) {
    return value.some((nested) => valueReferences(nested, matches, writesOnly, key))
  }
  if (!isRecord(value)) {
    return false
  }
  return Object.entries(value).some(
    ([nestedKey, nested]) =>
      nestedKey !== 'command' && valueReferences(nested, matches, writesOnly, nestedKey),
  )
}
