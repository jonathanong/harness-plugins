import { HOOK_HARNESSES, type HookHarness } from './types.mts'

const HOOK_USAGE =
  'usage: jong-hooks pre-tool-use|post-tool-use --harness claude|codex|cursor|grok [--policy <module>] [--root <dir>] [--automation-env NAME]...'

export type HookArgs = {
  event: 'pre-tool-use' | 'post-tool-use'
  harness: HookHarness
  /** Policy module, relative to the root. Omitted: JONG_HOOKS_POLICY, else the default file. */
  policy?: string
  root?: string
  /** Environment variable names that mark an unattended run when set (see isAutomationContext). */
  automationEnv: string[]
}

const VALUE_FLAGS = new Set(['--harness', '--policy', '--root', '--automation-env'])

type Flags = { harness?: string; policy?: string; root?: string; automationEnv: string[] }

/** Parses `hook` arguments; throws a usage error naming the first problem. */
export function parseHookArgs(args: readonly string[]): HookArgs {
  const [event, ...rest] = args
  if (event !== 'pre-tool-use' && event !== 'post-tool-use') {
    throw new Error(`${HOOK_USAGE}\nunknown or missing hook event: ${event ?? '(none)'}`)
  }
  const flags = parseFlags(rest)
  const harness = flags.harness
  if (!HOOK_HARNESSES.includes(harness as HookHarness)) {
    throw new Error(`${HOOK_USAGE}\n--harness must be one of ${HOOK_HARNESSES.join(', ')}`)
  }
  if (flags.policy === '') {
    throw new Error(`${HOOK_USAGE}\n--policy <module> must not be empty`)
  }
  return {
    event,
    harness: harness as HookHarness,
    automationEnv: flags.automationEnv,
    ...(flags.policy === undefined ? {} : { policy: flags.policy }),
    ...(flags.root === undefined ? {} : { root: flags.root }),
  }
}

function parseFlags(args: readonly string[]): Flags {
  const flags: Flags = { automationEnv: [] }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!
    const [name, inline] = arg.startsWith('--') ? splitFlag(arg) : [arg, undefined]
    if (!VALUE_FLAGS.has(name)) {
      throw new Error(`${HOOK_USAGE}\nunknown argument: ${arg}`)
    }
    const value = inline ?? args[(index += 1)]
    // A flag-looking token is the next flag, not this flag's value (`--policy --root x`).
    if (value === undefined || (inline === undefined && value.startsWith('--'))) {
      throw new Error(`${HOOK_USAGE}\n${name} needs a value`)
    }
    if (name === '--automation-env') flags.automationEnv.push(value)
    else flags[name.slice(2) as 'harness' | 'policy' | 'root'] = value
  }
  return flags
}

function splitFlag(arg: string): [string, string | undefined] {
  const equals = arg.indexOf('=')
  return equals === -1 ? [arg, undefined] : [arg.slice(0, equals), arg.slice(equals + 1)]
}
