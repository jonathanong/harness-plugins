import { existsSync } from 'node:fs'

import { isShellCommandSeparator } from '../shell-parse/index.mts'
import { commandCwd } from './github-command-cwd.mts'

// Commands that move the shell, alias a path, or run code the `cd` tracker does not follow.
const UNFOLLOWED = new Set([
  '.',
  'alias',
  'eval',
  'exec',
  'function',
  'ln',
  'mount',
  'popd',
  'pushd',
  'source',
])
// Words that may come before the command word itself.
const LEADERS = new Set(['!', 'builtin', 'command', 'do', 'elif', 'else', 'then', 'time'])
const ASSIGNMENT = /^[A-Za-z_]\w*=/
// Variables that point git, or `cd`, somewhere the tracker does not see.
const RELOCATING_VARIABLE = /^(?:GIT_(?:DIR|WORK_TREE)|CDPATH)(?:=|$)/
// Per command, the options that make it resolve its operands in another directory.
const TARGET_DIRECTORY = /^(?:-[A-Za-z]*t|--target-directory(?:=|$))/
const MAKE_DIRECTORY = /^(?:-C|--directory(?:=|$))/
const DIRECTORY_OPTIONS = new Map<string, RegExp>([
  ['git', /^(?:-C|--(?:git-dir|work-tree)(?:=|$))/],
  ['env', /^(?:-C|--chdir(?:=|$))/],
  ['make', MAKE_DIRECTORY],
  ['gmake', MAKE_DIRECTORY],
  ['cp', TARGET_DIRECTORY],
  ['mv', TARGET_DIRECTORY],
  ['install', TARGET_DIRECTORY],
])

type Segment = { start: number; words: string[]; joiner: string | undefined }

function segmentsOf(tokens: string[]): Segment[] {
  const segments: Segment[] = [{ start: 0, words: [], joiner: undefined }]
  tokens.forEach((token, index) => {
    if (!isShellCommandSeparator(token)) segments.at(-1)!.words.push(token)
    else {
      segments.at(-1)!.joiner = token
      segments.push({ start: index + 1, words: [], joiner: undefined })
    }
  })
  return segments
}

function commandWord(words: string[]): string | undefined {
  return words.find((word) => !ASSIGNMENT.test(word) && !LEADERS.has(word))
}

// `cd X; next` runs `next` in the old directory when X does not exist, so the tracker's answer is
// only trusted for an unconditional `cd` whose directory exists now.
function unconditionalCdMayFail(
  tokens: string[],
  segments: Segment[],
  commandIndex: number,
  cwd: string,
): boolean {
  return segments.some(({ start, words, joiner }, position) => {
    const next = segments[position + 1]
    if (commandWord(words) !== 'cd' || next === undefined || next.start > commandIndex) return false
    if (joiner !== ';' && joiner !== '\n') return false
    const directory = commandCwd(tokens, next.start, cwd)
    return start < commandIndex && directory !== undefined && !existsSync(directory)
  })
}

/**
 * The directory the paths of the writing command at `commandIndex` are relative to, or undefined
 * when the script could move it in a way the `cd` tracker does not follow. An undefined directory
 * makes the caller fall back to matching by name, so a wrong guess never turns into an allow.
 */
export function writeCwd(tokens: string[], commandIndex: number, cwd: string): string | undefined {
  const segments = segmentsOf(tokens)
  const definesFunction = tokens.some((token, index) => token === '(' && tokens[index + 1] === ')')
  if (
    definesFunction ||
    tokens.some((token) => RELOCATING_VARIABLE.test(token)) ||
    segments.some(({ words }) => UNFOLLOWED.has(commandWord(words) ?? ''))
  ) {
    return undefined
  }
  // `commandIndex` is where a segment starts, as `writtenWords` reports it.
  const writer = segments.find(({ start }) => start === commandIndex)!.words
  const relocates = writer.some((word) => {
    const option = DIRECTORY_OPTIONS.get(word)
    return option !== undefined && writer.some((other) => option.test(other))
  })
  if (relocates || unconditionalCdMayFail(tokens, segments, commandIndex, cwd)) return undefined
  return commandCwd(tokens, commandIndex, cwd)
}
