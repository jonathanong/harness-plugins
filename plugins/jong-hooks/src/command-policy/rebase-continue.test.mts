// `git rebase --continue` opens an editor unless one is overridden. These overrides were blocked
// by past versions, found by replaying real agent shell history through the engine.
import { describe, expect, it } from 'vitest'

import { evaluateCommandPolicy, standardGitPatterns } from './index.mts'
import type { CommandPolicy, HookPayload } from './index.mts'

const bash = (command: string): HookPayload => ({ tool_name: 'Bash', tool_input: { command } })

describe('a non-interactive rebase --continue passes', () => {
  const policy: CommandPolicy = { gitPatterns: standardGitPatterns(), rebaseContinueReason: 'RC' }
  const reason = (command: string) =>
    evaluateCommandPolicy(bash(command), policy, { automationContext: true })?.reason ?? null

  it.each([
    'git -c core.editor=true rebase --continue',
    "git -c 'core.editor=true' rebase --continue",
    'git -c core.editor="true" -C /x rebase --continue',
    '{ GIT_EDITOR=true git rebase --continue; }',
    'for i in 1 2; do GIT_EDITOR=true git rebase --continue; done',
    'if true; then GIT_EDITOR=true git rebase --continue; fi',
    '! GIT_EDITOR=true git rebase --continue',
    'git add a\nGIT_EDITOR=true git rebase --continue',
  ])('allows %j', (command) => {
    expect(reason(command)).toBeNull()
  })

  it.each([
    'git rebase --continue',
    'git -c core.editor=vim rebase --continue',
    'git -c core.editor=true.sh rebase --continue',
    'git add a\ngit rebase --continue',
    '( git rebase --continue )',
  ])('blocks %j', (command) => {
    expect(reason(command)).toBe('RC')
  })
})
