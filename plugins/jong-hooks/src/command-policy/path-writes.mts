import {
  isShellCommandSeparator,
  redirectionOperatorOf,
  tokenizeShellWords,
} from '../shell-parse/index.mts'
import { basename, resolveCommand } from './command-runners.mts'

const REDIRECTION_WORD = /^(?:\d+|\{\w+\})?(?:&>>?|<<<|<<-?|[<>][&|>]?)$/
const OUTPUT_REDIRECTIONS = new Set(['>', '>>', '>|', '&>', '&>>', '>&', '<>'])
// Every operand is a path the command creates, changes, moves, or deletes.
const WRITES_ALL_OPERANDS = new Set(
  'chgrp chmod chown mkdir mv rm rmdir shred tee touch truncate unlink ed emacs ex micro nano nvim pico vi vim'.split(
    ' ',
  ),
)
// Only the last operand (or the `-t` directory) is written.
const WRITES_LAST_OPERAND = new Set(['cp', 'install', 'ln', 'rsync'])
const IN_PLACE_EDITORS = new Set(['gsed', 'perl', 'sed'])
const GIT_WRITING_SUBCOMMANDS = new Set(['apply', 'checkout', 'clean', 'mv', 'restore', 'rm'])
const GIT_VALUE_OPTIONS = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace'])
const TARGET_DIRECTORY_OPTIONS = ['-t', '--target-directory']
const OUTPUT_FILE_OPTIONS = new Map([
  ['curl', ['-o', '--output']],
  ['wget', ['-O', '--output-document']],
])

/**
 * The words of one script that name a path the script writes: redirection targets and the
 * operands of commands known to write. Reads (`cat`, `git diff`, `ls`) name no written path.
 * Interpreters that write from inside their own code (`python -c`) are not analyzed.
 */
function writtenTokens(script: string): string[] {
  return writtenWords(script).written.map(({ path }) => path)
}

/** A written path and the index, in `tokens`, of the command that writes it. */
export type WrittenWord = { path: string; commandIndex: number }

/** `writtenTokens` with the script's tokens and where each writing command starts. */
export function writtenWords(script: string): { tokens: string[]; written: WrittenWord[] } {
  const tokens = tokenizeShellWords(script, { splitRedirections: true })
  const written: WrittenWord[] = []
  for (const { start, words } of segments(tokens)) {
    const { argv, targets } = splitRedirections(words)
    for (const path of [...targets, ...commandWrites(argv)]) {
      written.push({ path, commandIndex: start })
    }
  }
  return { tokens, written }
}

function segments(tokens: string[]): Array<{ start: number; words: string[] }> {
  const result = [{ start: 0, words: [] as string[] }]
  tokens.forEach((token, index) => {
    if (isShellCommandSeparator(token)) result.push({ start: index + 1, words: [] })
    else result.at(-1)!.words.push(token)
  })
  return result
}

function splitRedirections(words: string[]): { argv: string[]; targets: string[] } {
  const argv: string[] = []
  const targets: string[] = []
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index]!
    if (!REDIRECTION_WORD.test(word)) {
      argv.push(word)
      continue
    }
    const target = words[index + 1]
    if (target !== undefined && OUTPUT_REDIRECTIONS.has(redirectionOperatorOf(word))) {
      targets.push(target)
    }
    index += 1
  }
  return { argv, targets }
}

function commandWrites(argv: string[]): string[] {
  const words = resolveCommand(argv)
  if (words === null) return []
  const name = basename(words[0]!)
  // `eval` runs its words as a script.
  if (name === 'eval') return writtenTokens(words.slice(1).join(' '))
  return classify(name, words.slice(1))
}

function classify(name: string, args: string[]): string[] {
  if (WRITES_ALL_OPERANDS.has(name)) return operands(args)
  if (WRITES_LAST_OPERAND.has(name)) {
    return [...optionValues(args, TARGET_DIRECTORY_OPTIONS), ...operands(args).slice(-1)]
  }
  if (IN_PLACE_EDITORS.has(name)) return editsInPlace(args) ? inPlaceFiles(name, args) : []
  if (name === 'dd') return args.filter((arg) => arg.startsWith('of=')).map((arg) => arg.slice(3))
  if (name === 'git') return gitWrites(args)
  return optionValues(args, OUTPUT_FILE_OPTIONS.get(name) ?? [])
}

function operands(args: string[]): string[] {
  const dashDash = args.indexOf('--')
  if (dashDash === -1) return args.filter((arg) => !arg.startsWith('-'))
  return [
    ...args.slice(0, dashDash).filter((arg) => !arg.startsWith('-')),
    ...args.slice(dashDash + 1),
  ]
}

function optionValues(args: string[], names: string[]): string[] {
  return args.flatMap((arg, index) => {
    const next = args[index + 1]
    if (names.includes(arg)) return next === undefined ? [] : [next]
    const long = names.find((name) => name.startsWith('--') && arg.startsWith(`${name}=`))
    return long === undefined ? [] : [arg.slice(long.length + 1)]
  })
}

// Short options, per editor, whose value is the program (`-e`) or a program file that is read
// (`-f`), and those whose value is anything else. The value is the rest of the word, or the next
// word when the option ends it. `-i` takes only an attached backup suffix.
const SHORT_OPTIONS = {
  perl: { program: 'eE', value: 'iIMmCdDx0' },
  sed: { program: 'ef', value: 'il' },
} as const
const LONG_PROGRAM_OPTIONS = /^--(?:expression|file)(=|$)/
// BSD sed takes the backup suffix as its own word: `sed -i '' ...`, `sed -i .bak ...`.
const BSD_SUFFIX = /^(?:|\.[\w.-]*)$/

type ShortOption = { program: boolean; consumesNext: boolean }

// Reads one short-option cluster such as `-ne`, `-pi.bak`, or `-i`.
function readShortCluster(name: 'perl' | 'sed', cluster: string, next: string | undefined) {
  const options = SHORT_OPTIONS[name]
  const result: ShortOption = { program: false, consumesNext: false }
  for (let index = 1; index < cluster.length; index += 1) {
    const letter = cluster[index]!
    const isProgram = options.program.includes(letter)
    if (!isProgram && !options.value.includes(letter)) continue
    const attached = index < cluster.length - 1
    if (letter === 'i') {
      result.consumesNext = !attached && name === 'sed' && BSD_SUFFIX.test(next ?? '/')
      return result
    }
    result.program = isProgram
    result.consumesNext = !attached
    return result
  }
  return result
}

/**
 * The files an in-place `sed` or `perl` edits. The program is not a file: it is the value of `-e`
 * (or `-f`, a program file that is read), or, when no such option is given, the first operand.
 */
function inPlaceFiles(name: string, args: string[]): string[] {
  const editor = name === 'perl' ? 'perl' : 'sed'
  const files: string[] = []
  let programGiven = false
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!
    if (arg === '--') {
      files.push(...args.slice(index + 1))
      break
    }
    if (!arg.startsWith('-') || arg === '-') {
      files.push(arg)
      continue
    }
    const long = LONG_PROGRAM_OPTIONS.exec(arg)
    if (long !== null) {
      programGiven = true
      if (long[1] === '') index += 1
    } else if (arg === '--line-length') index += 1
    else if (!arg.startsWith('--')) {
      const option = readShortCluster(editor, arg, args[index + 1])
      programGiven ||= option.program
      if (option.consumesNext) index += 1
    }
  }
  return programGiven ? files : files.slice(1)
}

function editsInPlace(args: string[]): boolean {
  return args.some((arg) => arg.startsWith('--in-place') || /^-[A-Za-z]*i/.test(arg))
}

function gitWrites(args: string[]): string[] {
  let index = 0
  while (index < args.length && args[index]!.startsWith('-')) {
    index += GIT_VALUE_OPTIONS.has(args[index]!) ? 2 : 1
  }
  return GIT_WRITING_SUBCOMMANDS.has(args[index] ?? '') ? operands(args.slice(index + 1)) : []
}
