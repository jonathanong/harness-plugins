import { readCommandPrefix, withoutRedirections } from '../shell-parse/index.mts'

/** Options of each runner that take the next word as their value. */
const RUNNER_VALUE_OPTIONS: ReadonlyMap<string, readonly string[]> = new Map([
  ['doas', ['-C', '-u']],
  ['ionice', ['-c', '-n', '-p', '-P', '-u']],
  ['nice', ['-n']],
  ['setsid', []],
  ['stdbuf', ['-e', '-i', '-o']],
  ['sudo', ['-C', '-D', '-g', '-h', '-p', '-R', '-r', '-T', '-t', '-U', '-u']],
  ['timeout', ['-k', '-s']],
  ['xargs', ['-a', '-d', '-E', '-I', '-L', '-n', '-P', '-s']],
])

/** Programs that run the command they are given, so the command after them still runs. */
export const COMMAND_RUNNERS: ReadonlySet<string> = new Set(RUNNER_VALUE_OPTIONS.keys())

/**
 * The index where a runner's own words end and its command begins: past its options (and their
 * values), a `--`, and for `timeout` the duration.
 */
function skipRunnerArguments(words: readonly string[], runnerIndex: number): number {
  const runner = basename(words[runnerIndex]!)
  const valued = RUNNER_VALUE_OPTIONS.get(runner)!
  let durationPending = runner === 'timeout'
  let index = runnerIndex + 1
  while (index < words.length) {
    const word = words[index]!
    if (word === '--') return index + 1
    if (word.startsWith('-')) {
      index += valued.includes(word) ? 2 : 1
    } else if (durationPending && /^\d/.test(word)) {
      durationPending = false
      index += 1
    } else {
      break
    }
  }
  return index
}

/**
 * The words of one simple command from the command word onward, read through the wrappers the
 * shell parser knows (`env`, `command`, `nohup`, assignments) and the runners above, in any
 * order. Null when the command word cannot be found.
 */
export function resolveCommand(segment: readonly string[]): string[] | null {
  let words = withoutRedirections(segment) ?? [...segment]
  for (;;) {
    const read = readCommandPrefix(words)
    if (read === null || read.commandIndex >= words.length) return null
    words = words.slice(read.commandIndex)
    if (!COMMAND_RUNNERS.has(basename(words[0]!))) return words
    words = words.slice(skipRunnerArguments(words, 0))
  }
}

export function basename(word: string): string {
  return word.slice(word.lastIndexOf('/') + 1)
}
