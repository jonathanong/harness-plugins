// Options of `gh pr merge` (and the global `--repo`) that take a separate value. A value is never a
// flag, so `gh pr merge 5 --body --help` merges with the body "--help".
const PR_MERGE_VALUE_OPTIONS = new Set([
  '-A',
  '--author-email',
  '-b',
  '--body',
  '-F',
  '--body-file',
  '--match-head-commit',
  '-R',
  '--repo',
  '-t',
  '--subject',
])
const HELP_FLAGS = new Set(['-h', '--help'])

/** The flags `gh pr merge` itself reads, with every option value skipped. */
function prMergeFlags(optionTokens: readonly string[]): string[] {
  const flags: string[] = []
  for (let index = 0; index < optionTokens.length; index += 1) {
    const token = optionTokens[index]!
    if (token === '--') break
    if (PR_MERGE_VALUE_OPTIONS.has(token)) index += 1
    else if (token.startsWith('-')) flags.push(token)
  }
  return flags
}

/**
 * True when a parsed `gh pr merge` does not merge: `--help` prints usage, and `--disable-auto`
 * as the only flag turns auto-merge off. Beside any other flag it still counts as a merge.
 */
export function prMergeDoesNotMerge(optionTokens: readonly string[]): boolean {
  const flags = prMergeFlags(optionTokens)
  if (flags.some((flag) => HELP_FLAGS.has(flag))) return true
  return flags.length === 1 && flags[0] === '--disable-auto'
}

/**
 * True when a parsed `gh stack merge` only prints usage. Its options are not modeled here, so only
 * a command whose every option is a help flag qualifies.
 */
export function stackMergeOnlyHelp(optionTokens: readonly string[]): boolean {
  return optionTokens.length > 0 && optionTokens.every((token) => HELP_FLAGS.has(token))
}
