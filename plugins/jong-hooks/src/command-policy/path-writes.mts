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
export function writtenTokens(script: string): string[] {
  const written: string[] = []
  for (const segment of segments(tokenizeShellWords(script, { splitRedirections: true }))) {
    const { argv, targets } = splitRedirections(segment)
    written.push(...targets, ...commandWrites(argv))
  }
  return written
}

function segments(tokens: string[]): string[][] {
  const result: string[][] = [[]]
  for (const token of tokens) {
    if (isShellCommandSeparator(token)) result.push([])
    else result.at(-1)!.push(token)
  }
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
  if (IN_PLACE_EDITORS.has(name)) return editsInPlace(args) ? operands(args) : []
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
