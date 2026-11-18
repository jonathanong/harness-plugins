// Commands that past versions blocked although they break no rule, found by replaying real agent
// shell history through the engine. Each case pairs with the nearby command that must still block.
import { describe, expect, it } from 'vitest'

import { evaluateCommandPolicy } from './index.mts'
import type { HookPayload } from './index.mts'

const bash = (command: string): HookPayload => ({ tool_name: 'Bash', tool_input: { command } })

describe('merge authority reads what gh will do', () => {
  const blocked = (command: string) =>
    evaluateCommandPolicy(bash(command), {}, { automationContext: true }) !== null

  it.each([
    'gh pr merge --help',
    'gh pr merge -h',
    'gh pr merge 5 --help 2>&1 | head -30',
    'gh pr merge 5 --repo o/r --disable-auto',
    'gh stack merge --help',
    'gh stack merge -h | sed -n 1,20p',
  ])('allows %j', (command) => {
    expect(blocked(command)).toBe(false)
  })

  it.each([
    'gh pr merge 5 --squash',
    // A value is not a flag: these merge with the body or subject "--help".
    'gh pr merge 5 --body --help',
    'gh pr merge 5 -t -h',
    'gh pr merge 5 --match-head-commit --disable-auto',
    'gh pr merge 5 --squash -- --help',
    // gh is not shown to ignore other flags beside --disable-auto, so those still count.
    'gh -R o/r pr merge 5 --disable-auto --squash',
    'gh pr merge 5 --disable-auto --auto',
    'gh pr merge 5 --disable-auto -sd',
    'gh pr merge 5 --disable-auto --squash=true',
    'gh stack merge 5 --help',
    'gh stack merge 5 --yes',
  ])('blocks %j', (command) => {
    expect(blocked(command)).toBe(true)
  })
})
