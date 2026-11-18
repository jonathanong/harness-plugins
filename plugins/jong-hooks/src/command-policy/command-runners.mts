/** Programs that run the command they are given, so the command after them still runs. */
export const COMMAND_RUNNERS: ReadonlySet<string> = new Set([
  'doas',
  'ionice',
  'nice',
  'setsid',
  'stdbuf',
  'sudo',
  'timeout',
  'xargs',
])

/** The index after a runner's options and `timeout`'s duration, where its command begins. */
export function skipRunnerArguments(words: readonly string[], runnerIndex: number): number {
  let index = runnerIndex + 1
  while (index < words.length && /^(?:-.*|\d+[smhd]?)$/.test(words[index]!)) {
    index += 1
  }
  return index
}
