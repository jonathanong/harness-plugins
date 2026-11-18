import { basename, resolveCommand } from './command-runners.mts'
import { commandsToInspectForGitHubPolicy } from './github-command-context.mts'
import { parseGhOrGhStackInvocation } from './github-invocation.mts'
import { hasNumericPrSelector } from './github-option-flags.mts'
import { stackInvocation } from './github-stack-workflow.mts'
import {
  isShellCommandSeparator,
  plainShellAssignment,
  tokenizeShellWords,
} from '../shell-parse/index.mts'
import type { BlockDecision } from './types.mts'

// Paths of the REST merge endpoints (`pulls/<n>/merge`, `merges`), without a query string.
const MERGE_ENDPOINT_PATH = /(?:^|\/)(?:pulls\/[^/]+\/merge|merges?)$/
// GraphQL mutation names that merge, wherever a `gh api` argument carries them.
const MERGE_MUTATION = /mergePullRequest|enablePullRequestAutoMerge/

function suffix(guidance: string): string {
  return guidance === '' ? '' : ` ${guidance}`
}

/**
 * Automation never receives merge authority. The check reads each parsed command: a `gh` or
 * `gh-stack` run that is `pr merge`, `stack merge`, or a `gh api` call to a merge endpoint or
 * mutation blocks. Words in other commands' arguments (a PR body that says "gh pr merge", a
 * `git merge`) are text, not a merge. Interactively this returns null.
 */
export function findAutomationMergeBlock(
  command: string,
  automationContext: boolean,
  guidance = '',
): BlockDecision | null {
  if (!automationContext || !runsGhMerge(command)) return null
  return {
    disposition: 'block',
    reason: `Merge authority is never delegated to an agent in automation. This command runs a merge (\`gh pr merge\`, \`gh stack merge\`, or a \`gh api\` merge endpoint or mutation), so it is blocked in automation; a human performs the merge. If the text is only prose, put it in a --body-file.${suffix(guidance)}`,
  }
}

function runsGhMerge(command: string): boolean {
  return commandsToInspectForGitHubPolicy(command).some((inspected) => {
    // Tokens, not raw text: a shell-composed name like `g"h"` still runs gh.
    const tokens = tokenizeShellWords(inspected, { splitRedirections: true })
    return commandSegments(tokens).some(isMergeCommand)
  })
}

function commandSegments(tokens: string[]): string[][] {
  const segments: string[][] = [[]]
  for (const token of tokens) {
    if (isShellCommandSeparator(token)) segments.push([])
    else segments.at(-1)!.push(token)
  }
  return segments
}

// One simple command, read through wrappers and runners to the program it runs.
function isMergeCommand(segment: string[]): boolean {
  const words = resolveCommand(segment)
  if (words === null) return false
  const name = basename(words[0]!)
  // `eval` runs its words as a script.
  if (name === 'eval') return runsGhMerge(words.slice(1).join(' '))
  if (name !== 'gh' && name !== 'gh-stack') return false
  const invocation = parseGhOrGhStackInvocation(words, 0)
  if (invocation === null) return false
  const stack = stackInvocation(invocation)
  if (stack !== null) return stack.action === 'merge'
  if (invocation.area === 'pr') return invocation.action === 'merge'
  return invocation.area === 'api' && apiWordsMerge(words)
}

function apiWordsMerge(words: string[]): boolean {
  return words.slice(1).some((word) => {
    const path = word.split(/[?#]/, 1)[0]!
    if (MERGE_MUTATION.test(word)) return true
    return !word.startsWith('-') && !/[\s=]/.test(path) && MERGE_ENDPOINT_PATH.test(path)
  })
}

/**
 * The 'confirm' disposition for an interactive merge, which a caller may render as a silent allow
 * in an attended session. Call it last, so any block anywhere in the command wins; only a command
 * that is one plain merge qualifies.
 */
export function findInteractiveMergeConfirm(
  command: string,
  automationContext: boolean,
  guidance = '',
): BlockDecision | null {
  if (automationContext || !isLoneMergeCommand(command)) {
    return null
  }
  return {
    disposition: 'confirm',
    reason: `Merging is a human decision - confirm you want this exact merge before it proceeds.${suffix(guidance)}`,
  }
}

// Anything that can join, redirect, substitute, expand, glob, escape, or comment shell text.
const SHELL_METACHARACTERS = /[;&|<>()`$\\\n\r{}*?[\]#!]/

/**
 * True only for a command that is exactly one `gh pr merge`, or one `gh stack merge` with a
 * numeric selector, optionally after plain `NAME=value` assignments or `env NAME=value`. The
 * raw-text check rejects every compound, wrapped, or expanded form before tokenizing, so a lone
 * merge can never carry a second command along with the allow.
 */
export function isLoneMergeCommand(command: string): boolean {
  if (SHELL_METACHARACTERS.test(command)) {
    return false
  }
  const tokens = tokenizeShellWords(command)
  let index = skipAssignments(tokens, 0)
  if (tokens[index] === 'env') {
    index = skipAssignments(tokens, index + 1)
  }
  const executable = tokens[index]?.split('/').at(-1)
  if (executable !== 'gh' && executable !== 'gh-stack') {
    return false
  }
  const invocation = parseGhOrGhStackInvocation(tokens, index)
  if (invocation?.action !== 'merge') {
    return false
  }
  return (
    invocation.area === 'pr' ||
    (invocation.area === 'stack' && hasNumericPrSelector(invocation.optionTokens))
  )
}

function skipAssignments(tokens: string[], start: number): number {
  let index = start
  while (index < tokens.length && plainShellAssignment(tokens[index]!) !== null) {
    index += 1
  }
  return index
}
