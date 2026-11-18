import { describe, expect, it } from 'vitest'

import { evaluateCommandPolicy } from './index.mts'

const blocked = (command: string) =>
  evaluateCommandPolicy(
    { tool_name: 'Bash', tool_input: { command } },
    {
      protectedPaths: {
        dirPrefixes: ['secrets/'],
        exactFiles: ['policy.mts'],
        reason: 'protected',
      },
    },
    { automationContext: true },
  )?.reason === 'protected'

describe('protected-path writes through runners and wrappers', () => {
  it.each([
    'sudo -u root rm policy.mts',
    'sudo -E rm policy.mts',
    'timeout --preserve-status 5 rm policy.mts',
    'timeout -s KILL 5 rm policy.mts',
    'timeout -k 1 5 touch secrets/a',
    'nice -n 5 mv a policy.mts',
    'xargs -I {} cp {} secrets/',
    'env A=1 sudo tee policy.mts',
    'time sudo rm -- policy.mts',
    'eval "rm policy.mts"',
    'eval echo hi \\> secrets/a',
    'command rm policy.mts',
  ])('blocks %j', (command) => {
    expect(blocked(command)).toBe(true)
  })

  it.each([
    'sudo cat policy.mts',
    'sudo -u root ls secrets/',
    'timeout 5 cat policy.mts',
    'eval "cat policy.mts"',
  ])('allows the read %j', (command) => {
    expect(blocked(command)).toBe(false)
  })
})
