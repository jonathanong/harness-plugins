// Commands that past versions blocked although they break no rule, found by replaying real agent
// shell history through the engine. Each case pairs with the nearby command that must still block.
import { describe, expect, it } from 'vitest'

import { evaluateCommandPolicy, standardGitPatterns } from './index.mts'
import type { CommandPolicy, HookPayload } from './index.mts'
import type { PathLocator } from './path-location.mts'
import { fakeRepository } from './testing/fake-repository.mts'

const bash = (command: string): HookPayload => ({ tool_name: 'Bash', tool_input: { command } })

describe('merge authority reads what gh will do', () => {
  const blocked = (command: string) =>
    evaluateCommandPolicy(bash(command), {}, { automationContext: true }) !== null

  it.each([
    'gh pr merge --help',
    'gh pr merge -h',
    'gh pr merge 5 --help 2>&1 | head -30',
    'gh pr merge 5 --repo o/r --disable-auto',
    'gh -R o/r pr merge 5 --disable-auto --squash',
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
    'gh stack merge 5 --help',
    'gh stack merge 5 --yes',
  ])('blocks %j', (command) => {
    expect(blocked(command)).toBe(true)
  })
})

describe('in-place editors write their files, not their program', () => {
  const policy: CommandPolicy = {
    protectedPaths: { dirPrefixes: ['tools/hooks/'], exactFiles: ['policy.mts'], reason: 'P' },
  }
  const blocked = (command: string) =>
    evaluateCommandPolicy(bash(command), policy, {
      automationContext: true,
      cwd: '/repo',
      locatePath: fakeRepository('/repo'),
    }) !== null

  it.each([
    "sed -i '' 's|a|tools/hooks/x|' notes.txt",
    "sed -i -e 's/x/policy.mts/' notes.txt",
    "sed -i.bak -e 's/a/b/' -e 's/policy.mts/x/' notes.txt",
    "sed -Ei '' 's#x#policy.mts#' notes.txt",
    "sed -ne 's/policy.mts/x/p' -i notes.txt",
    'sed -i -f tools/hooks/fix.sed notes.txt',
    "sed --in-place --expression 's/policy.mts/x/' notes.txt",
    "sed -i --expression='s/policy.mts/x/' notes.txt",
    "sed -l 80 -i 's/policy.mts/x/' notes.txt",
    "gsed --line-length 80 -i 's/policy.mts/x/' notes.txt",
    "perl -pi -e 's/tools\\/hooks//' notes.txt",
    "perl -0777 -pi -e 's/policy.mts/x/' notes.txt",
    "perl -i.bak -pe 's/policy.mts/x/' notes.txt",
  ])('allows %j', (command) => {
    expect(blocked(command)).toBe(false)
  })

  it.each([
    "sed -i '' 's/a/b/' policy.mts",
    "sed -i -e 's/a/b/' tools/hooks/a.mts",
    "sed -i -- 's/a/b/' policy.mts",
    "sed -i 's/a/b/' notes.txt policy.mts",
    "sed 's/a/b/' policy.mts -n -i",
    'sed --expression=s/a/b/ -i policy.mts',
    "perl -pi -e 's/a/b/' policy.mts",
    // `-pie` reads `e` as the backup suffix, so the program is the first operand.
    "perl -pie 's/a/b/' policy.mts",
  ])('blocks %j', (command) => {
    expect(blocked(command)).toBe(true)
  })
})

describe('protected paths belong to one repository', () => {
  const policy: CommandPolicy = {
    protectedPaths: {
      dirPrefixes: ['.claude/hooks/', '.github/workflows/', '.git/hooks/'],
      exactFiles: ['AGENTS.md'],
      reason: 'P',
    },
  }
  const twoRepositories: PathLocator = (path) => {
    if (path === '/other' || path.startsWith('/other/')) {
      return { commonDir: '/other/.git', pathInWorktree: path.slice('/other/'.length) }
    }
    return fakeRepository('/repo', ['/repo/.claude/worktrees/w', '/tmp/wt'])(path)
  }
  const blocked = (
    payload: HookPayload,
    locatePath: PathLocator = twoRepositories,
    root = '/repo',
  ) =>
    evaluateCommandPolicy(payload, policy, {
      automationContext: true,
      cwd: '/repo',
      root,
      locatePath,
    }) !== null

  it.each([
    // Outside any repository: notes, memory files, scratch directories.
    "cat >> ~/.claude/hooks/notes.md <<'EOF'\nx\nEOF",
    'echo x >> /home/u/.claude/hooks/MEMORY.md',
    'mkdir -p /tmp/probe/.github/workflows',
    'cd /tmp/probe && mkdir -p .github/workflows && echo on: push > .github/workflows/ci.yml',
    // Another repository.
    'echo x > /other/.github/workflows/ci.yml',
    'cd /other && rm AGENTS.md',
    // The same name below the top level is not the protected file.
    'echo x > backend/AGENTS.md',
    'rm -rf packages/a/.github/workflows',
    'cd backend && echo x > AGENTS.md',
  ])('allows %j', (command) => {
    expect(blocked(bash(command))).toBe(false)
  })

  it('allows a Write outside the repository', () => {
    expect(blocked({ tool_name: 'Write', tool_input: { file_path: '/home/u/AGENTS.md' } })).toBe(
      false,
    )
  })

  it.each([
    'echo x > AGENTS.md',
    'echo x > /repo/AGENTS.md',
    'cd backend && rm ../AGENTS.md',
    'cd /tmp && cd /repo && rm AGENTS.md',
    // Any worktree of the protected repository, wherever it is checked out.
    'echo x > /repo/.claude/worktrees/w/.github/workflows/ci.yml',
    'cd /tmp/wt && rm AGENTS.md',
    // Unknown directories and expansions keep the name-only match.
    'cd "$DIR" && rm AGENTS.md',
    'rm $HOME/repo/AGENTS.md',
    'rm ~other/AGENTS.md',
    "sh -c 'cd /tmp/probe && rm AGENTS.md'",
    'cd /tmp/probe || rm AGENTS.md',
    // git's own directory is resolved by name.
    'echo x > /repo/.git/hooks/pre-commit',
  ])('blocks %j', (command) => {
    expect(blocked(bash(command))).toBe(true)
  })

  it('blocks a Write inside the repository, and a patch header', () => {
    expect(blocked({ tool_name: 'Write', tool_input: { file_path: '/repo/AGENTS.md' } })).toBe(true)
    expect(blocked(bash('*** Begin Patch\n*** Update File: AGENTS.md\n'))).toBe(true)
  })

  it('fails closed when git cannot answer', () => {
    expect(blocked(bash('echo x > /tmp/probe/AGENTS.md'), () => undefined)).toBe(true)
    const rootUnknown: PathLocator = (path) => (path === '/repo' ? undefined : null)
    expect(blocked(bash('echo x > /tmp/probe/AGENTS.md'), rootUnknown)).toBe(true)
    expect(blocked(bash('echo x > /tmp/probe/AGENTS.md'), () => null)).toBe(true)
  })

  it('resolves against the root, not the directory the call runs in', () => {
    expect(blocked(bash('echo x > /other/AGENTS.md'), twoRepositories, '/other')).toBe(true)
    expect(blocked(bash('echo x > /repo/AGENTS.md'), twoRepositories, '/other')).toBe(false)
  })
})

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
