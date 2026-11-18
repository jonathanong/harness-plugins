import { COMMAND_RUNNERS } from './command-runners.mts'
import { commandsToInspectForGitHubPolicy } from './github-command-context.mts'
import { parseGhOrGhStackInvocation } from './github-invocation.mts'
import { commandPrefixAt, commandSegmentStart } from './github-command-position.mts'
import { hasNumericPrSelector } from './github-option-flags.mts'
import { isGhCommandSeparator } from './github-options.mts'
import { stackInvocation } from './github-stack-workflow.mts'
import { plainShellAssignment, tokenizeShellWords } from '../shell-parse/index.mts'
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
    reason: `Merge authority is never delegated to an agent in automation. This command runs a merge (\`gh pr merge\`, \`gh stack merge\`, or a \`gh api\` merge endpoint or mutation), so it is blocked in automation; a human performs the merge.${suffix(guidance)}`,
  }
}

function runsGhMerge(command: string): boolean {
  return commandsToInspectForGitHubPolicy(command).some((inspected) => {
    // Tokens, not raw text: a shell-composed name like `g"h"` still runs gh.
    const tokens = tokenizeShellWords(inspected, { splitRedirections: true })
    return tokens.some((token, index) => runsGhAt(tokens, index) && isMerge(tokens, index))
  })
}

function runsGhAt(tokens: string[], index: number): boolean {
  const name = tokens[index]!.split('/').at(-1)
  if (name !== 'gh' && name !== 'gh-stack') return false
  if (commandPrefixAt(tokens, index) !== null) return true
  const first = tokens
    .slice(commandSegmentStart(tokens, index), index)
    .find((t) => !isAssignment(t))
  return first !== undefined && COMMAND_RUNNERS.has(first.split('/').at(-1)!)
}

function isAssignment(token: string): boolean {
  return plainShellAssignment(token) !== null
}

function isMerge(tokens: string[], index: number): boolean {
  const invocation = parseGhOrGhStackInvocation(tokens, index)
  if (invocation === null) return false
  const stack = stackInvocation(invocation)
  if (stack !== null) return stack.action === 'merge'
  if (invocation.area === 'pr') return invocation.action === 'merge'
  return invocation.area === 'api' && apiWordsMerge(tokens, index + 1)
}

function apiWordsMerge(tokens: string[], start: number): boolean {
  for (
    let index = start;
    index < tokens.length && !isGhCommandSeparator(tokens[index]!);
    index += 1
  ) {
    const token = tokens[index]!
    const path = token.split(/[?#]/, 1)[0]!
    if (MERGE_MUTATION.test(token)) return true
    if (!token.startsWith('-') && !/[\s=]/.test(path) && MERGE_ENDPOINT_PATH.test(path)) return true
  }
  return false
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
