import { describe, expect, it } from 'vitest'
import { evaluateCommandPolicy, standardGitPatterns } from './index.mts'
import type { CommandPolicy, HookPayload } from './index.mts'

const policy: CommandPolicy = {
  typoPaths: [{ segment: '.claire', reason: 'Typo: .claire should be .claude.' }],
  protectedPaths: {
    dirPrefixes: ['tools/hooks/', '.agent/rules/'],
    exactFiles: ['tools/policy.mts', '.agent/config.toml'],
    reason: 'Protected policy files cannot be edited in automation.',
  },
  commandPatterns: [
    { pattern: /\bHOOKS=0\b/, reason: 'HOOKS=0 disables hooks.' },
    {
      pattern: /(?:^|[;&|(\n]+)\s*(?:\S+=\S+\s+)*devserver\s+start\b/,
      reason: 'Use the managed dev runner.',
    },
  ],
  gitPatterns: standardGitPatterns({ pullRebase: 'Use ./rebase-script.' }),
  rebaseContinueReason: 'Use GIT_EDITOR=true git rebase --continue.',
  mergeGuidance: 'See docs/merge.md.',
}

const bash = (command: string): HookPayload => ({ tool_name: 'Bash', tool_input: { command } })
const reasonOf = (payload: HookPayload, automationContext = false, p = policy) =>
  evaluateCommandPolicy(payload, p, { automationContext })?.reason ?? null

describe('evaluateCommandPolicy command rules', () => {
  it('applies command patterns to nested scripts', () => {
    expect(reasonOf(bash('HOOKS=0 make'))).toBe('HOOKS=0 disables hooks.')
    expect(reasonOf(bash('bash -c "devserver start"'))).toBe('Use the managed dev runner.')
    expect(reasonOf(bash('rg devserver start'))).toBeNull()
  })

  it.each([
    ['git push --force origin main', 'Force pushes are banned by repository policy.'],
    ['git push -f', 'Force pushes'],
    ['git push origin +main', 'Force pushes'],
    ['git commit --amend', 'amend'],
    ['git pull --rebase', 'Use ./rebase-script.'],
    ['git rebase -X ours main', 'strategy options'],
    ['git rebase -s ours main', 'strategy options'],
    ['git merge --strategy=ours topic', 'strategy options'],
    ['git push --mirror origin', 'Force pushes'],
    ['git checkout --theirs file', '--ours/--theirs'],
    ['git restore --ours file', '--ours/--theirs'],
    ['git commit --no-verify', '--no-verify'],
    ['git commit -an', 'git commit -n'],
    ['git -c core.hooksPath=/dev/null commit', 'core.hooksPath'],
    ['git -c Core.HooksPath=/dev/null commit', 'core.hooksPath'],
    ['env -S git -c core.hooksPath=/dev/null commit', 'core.hooksPath'],
    ['git -c "core.hooksPath=/dev/null" status', 'core.hooksPath'],
    ["git -c 'core.hooksPath=/dev/null' status", 'core.hooksPath'],
    ['git -c "CORE.hookspath=/dev/null" status', 'core.hooksPath'],
    ["git -c 'Core.HooksPath=/dev/null' status", 'core.hooksPath'],
    ['git -c user.name=x -c "core.hooksPath=/dev/null" commit', 'core.hooksPath'],
    ['git --config-env=core.hooksPath=HOOKS commit', 'core.hooksPath'],
    ['git --config-env "core.hookspath=HOOKS" commit', 'core.hooksPath'],
    ['bash -c \'git -c "core.hooksPath=/dev/null" status\'', 'core.hooksPath'],
    ['echo "$(git -c \'core.hooksPath=/dev/null\' status)"', 'core.hooksPath'],
    ['git push origin $(git branch --show-current | head -1) --force', 'Force pushes'],
    ['echo `git branch | head` && git push --force', 'Force pushes'],
    ['bash -c "git commit --amend"', 'amend'],
  ])('blocks %j', (command, reason) => {
    expect(reasonOf(bash(command))).toContain(reason)
  })

  it.each([
    'git push --force-with-lease',
    'git push --force-with-lease=main',
    'git push --force-if-includes',
    'git push --force-with-lease --force-if-includes',
    'git push --force-if-includes --force-with-lease=main origin main',
    'git commit -F msg | tail -n 20',
    'git log -n 5',
    'git commit -m "mentions core.hooksPath=x"',
    "git commit -m 'git -c core.hooksPath=/dev/null'",
    'git -c user.name=x -c "color.ui=false" status',
    'git config core.hooksPath .githooks',
    'echo "-c core.hooksPath=x"',
  ])('allows %j', (command) => {
    expect(reasonOf(bash(command))).toBeNull()
  })

  it('enforces caller-supplied and escaped config keys', () => {
    const custom: CommandPolicy = { gitPatterns: [{ configKey: 'core.editor', reason: 'editor' }] }
    expect(reasonOf(bash('git -c core.editor=true status'), false, custom)).toBe('editor')
    expect(reasonOf(bash('git -c "Core.Editor=true" status'), false, custom)).toBe('editor')
    expect(reasonOf(bash('git -c user.name=x status'), false, custom)).toBeNull()
    expect(reasonOf(bash('git -c co\\re.hooksPath=/dev/null status'))).toContain('core.hooksPath')
  })

  it('rejects an interactive rebase continue only when configured', () => {
    expect(reasonOf(bash('git rebase --continue'))).toContain('GIT_EDITOR=true')
    expect(reasonOf(bash('GIT_EDITOR=true git rebase --continue'))).toBeNull()
    expect(reasonOf(bash('git rebase --continue'), false, {})).toBeNull()
  })

  it('keeps global and sticky patterns pure across evaluations', () => {
    const stateful: CommandPolicy = { gitPatterns: [{ pattern: /danger/g, reason: 'danger' }] }
    expect(reasonOf(bash('git danger'), false, stateful)).toBe('danger')
    expect(reasonOf(bash('git danger'), false, stateful)).toBe('danger')
  })

  it('treats an unterminated substitution as plain text and defaults the pull-rebase reason', () => {
    expect(reasonOf(bash('echo $(oops; git push --force'))).toContain('Force pushes')
    expect(reasonOf(bash('echo `oops; git commit --amend'))).toContain('amend')
    const defaults = standardGitPatterns().find(
      (rule) => 'pattern' in rule && rule.pattern.test('git pull -r'),
    )
    expect(defaults?.reason).toBe('git pull --rebase and git pull -r are banned.')
  })

  it('skips git rules for commands that never mention git', () => {
    expect(reasonOf(bash('echo hi'))).toBeNull()
  })
})

describe('evaluateCommandPolicy merge authority', () => {
  it.each([
    'gh pr merge 12',
    'gh stack merge 12',
    'gh api repos/o/r/pulls/1/merge -X PUT',
    'bash -c "gh pr merge 1"',
  ])('blocks %j in automation with the guidance', (command) => {
    const decision = evaluateCommandPolicy(bash(command), policy, { automationContext: true })
    expect(decision?.disposition).toBe('block')
    expect(decision?.reason).toContain('See docs/merge.md.')
  })

  it('sees gh through shell-composed names', () => {
    expect(reasonOf(bash('g"h" pr merge 1'), true)).toContain('Merge authority')
    expect(reasonOf(bash('git merge topic'), true)).toBeNull()
  })

  it('omits guidance when none is configured', () => {
    const decision = evaluateCommandPolicy(bash('gh pr merge 1'), {}, { automationContext: true })
    expect(decision?.reason.endsWith('a human performs the merge.')).toBe(true)
  })

  it('confirms one plain interactive merge', () => {
    const decision = evaluateCommandPolicy(bash('gh pr merge 12 --squash'), policy, {
      automationContext: false,
    })
    expect(decision).toEqual({
      disposition: 'confirm',
      reason: expect.stringContaining('Merging is a human decision'),
    })
    expect(
      evaluateCommandPolicy(bash('FOO=1 gh pr merge 1'), {}, { automationContext: false }),
    ).toMatchObject({
      disposition: 'confirm',
    })
    expect(
      evaluateCommandPolicy(bash('env A=1 gh-stack merge 7'), {}, { automationContext: false })
        ?.reason,
    ).toBe('Merging is a human decision - confirm you want this exact merge before it proceeds.')
  })

  it('confirms a merge through a path-qualified gh', () => {
    expect(
      evaluateCommandPolicy(bash('/usr/local/bin/gh pr merge 3'), {}, { automationContext: false }),
    ).toMatchObject({ disposition: 'confirm' })
  })

  it.each([
    'gh pr merge 1 && echo done',
    'gh pr merge 1 > out',
    'gh stack merge --squash',
    'gh pr view 1',
    'ls',
    'env gh pr merge $N',
    'gh stack merge',
  ])('does not confirm %j', (command) => {
    expect(
      evaluateCommandPolicy(bash(command), {}, { automationContext: false })?.disposition,
    ).not.toBe('confirm')
  })

  it('lets any block beat the merge confirm', () => {
    expect(reasonOf(bash('git commit --amend && gh pr merge 1'))).toContain('amend')
  })
})
