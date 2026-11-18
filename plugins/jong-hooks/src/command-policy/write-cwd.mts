import { nextShellCommandSeparatorIndex } from '../shell-parse/index.mts'
import { commandCwd } from './github-command-cwd.mts'

// Commands that move the shell, alias a path, or run code `commandCwd` does not follow.
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
// Options and variables that make a command resolve its operands somewhere else.
const DIRECTORY_OPTION =
  /^(?:-[Ct]|--(?:chdir|directory|git-dir|target-directory|work-tree)(?:=|$)|GIT_(?:DIR|WORK_TREE)=)/

/**
 * The directory the paths of the writing command at `commandIndex` are relative to, or undefined
 * when the script could move it in a way the `cd` tracker does not follow. An undefined directory
 * makes the caller fall back to matching by name, so a wrong guess never turns into an allow.
 */
export function writeCwd(tokens: string[], commandIndex: number, cwd: string): string | undefined {
  const definesFunction = tokens.some((token, index) => token === '(' && tokens[index + 1] === ')')
  if (
    definesFunction ||
    tokens.some((token) => UNFOLLOWED.has(token) || token.includes('CDPATH'))
  ) {
    return undefined
  }
  const end = nextShellCommandSeparatorIndex(tokens, commandIndex)
  if (tokens.slice(commandIndex, end).some((token) => DIRECTORY_OPTION.test(token)))
    return undefined
  return commandCwd(tokens, commandIndex, cwd)
}
