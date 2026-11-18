// A written path counts only inside the protected repository, so a wrong guess about the directory
// a command writes in would turn a block into an allow. Each command here moves the directory, or
// names it, in a way the `cd` tracker does not follow, so it must fall back to matching by name.
import { describe, expect, it } from 'vitest'

import { evaluateCommandPolicy } from './index.mts'
import type { CommandPolicy } from './index.mts'
import { fakeRepository } from './testing/fake-repository.mts'

const policy: CommandPolicy = {
  protectedPaths: { dirPrefixes: [], exactFiles: ['AGENTS.md'], reason: 'P' },
}
const blocked = (command: string, cwd = '/repo') =>
  evaluateCommandPolicy({ tool_name: 'Bash', tool_input: { command } }, policy, {
    automationContext: true,
    cwd,
    root: '/repo',
    locatePath: fakeRepository('/repo'),
  }) !== null

describe('directories the cd tracker does not follow', () => {
  it.each([
    'cd /tmp/probe && pushd /repo && rm AGENTS.md',
    'cd /tmp/probe && popd && rm AGENTS.md',
    'cd /tmp/probe && env -C /repo rm AGENTS.md',
    'f(){ cd /repo; }; cd /tmp/probe; f; rm AGENTS.md',
    'function f { cd /repo; }; cd /tmp/probe; f; rm AGENTS.md',
    'cd /tmp/probe && source ./x.sh && rm AGENTS.md',
    'cd /tmp/probe && . ./x.sh && rm AGENTS.md',
    'cd /tmp/probe && eval "cd /repo" && rm AGENTS.md',
    'cd /tmp/probe && CDPATH=/ cd repo && rm AGENTS.md',
    'cd /tmp/probe && ln -s /repo r && rm r/AGENTS.md',
    'cd /tmp/probe && OLDPWD=/repo cd - && rm AGENTS.md',
  ])('blocks %j', (command) => {
    expect(blocked(command)).toBe(true)
  })
})

describe('commands that resolve their operands somewhere else', () => {
  it.each([
    ['git -C /repo rm AGENTS.md', '/tmp/probe'],
    ['git -C .. rm AGENTS.md', '/repo/packages'],
    ['git --work-tree=/repo rm AGENTS.md', '/tmp/probe'],
    ['git --git-dir=/repo/.git --work-tree /repo checkout -- AGENTS.md', '/tmp/probe'],
    ['GIT_WORK_TREE=/repo git rm AGENTS.md', '/tmp/probe'],
    ['make -C /repo x > AGENTS.md', '/tmp/probe'],
    ['cp -t /repo AGENTS.md', '/tmp/probe'],
    ['cp --target-directory=/repo AGENTS.md', '/tmp/probe'],
  ])('blocks %j from %s', (command, cwd) => {
    expect(blocked(command, cwd)).toBe(true)
  })

  it('still allows a plain write outside the repository', () => {
    expect(blocked('cd /tmp/probe && rm AGENTS.md')).toBe(false)
    expect(blocked('rm AGENTS.md', '/tmp/probe')).toBe(false)
  })
})
