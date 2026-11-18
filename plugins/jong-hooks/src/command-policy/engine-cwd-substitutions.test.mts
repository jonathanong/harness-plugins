import { describe, expect, it } from 'vitest'
import { evaluateCommandPolicy, standardGitPatterns } from './index.mts'
import type { CommandPolicy, HookPayload } from './index.mts'

const policy: CommandPolicy = {
  typoPaths: [{ segment: '.claire', reason: 'Typo: .claire should be .claude.' }],
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

describe('evaluateCommandPolicy cwd', () => {
  it('passes an explicit cwd to the stack rules', () => {
    const seen: string[] = []
    const stackPolicy: CommandPolicy = {
      stack: {
        git: {
          currentBranch: () => undefined,
          configValue: () => undefined,
          isAncestor: (cwd) => (seen.push(cwd), true),
          resolveRef: () => undefined,
        },
      },
    }
    evaluateCommandPolicy(bash('gh stack init t'), stackPolicy, { cwd: '/explicit' })
    evaluateCommandPolicy({ ...bash('gh stack init t'), cwd: '/from-payload' }, stackPolicy)
    expect(seen).toEqual(['/explicit', '/from-payload'])
  })
})

describe('evaluateCommandPolicy quoted command substitutions', () => {
  it('blocks a git command run by a substitution inside double quotes', () => {
    expect(reasonOf(bash('echo "$(git push --force)"'))).toContain('Force pushes')
    expect(reasonOf(bash('echo "`git push --force`"'))).toContain('Force pushes')
  })

  it('keeps quoted mentions and single-quoted substitutions allowed', () => {
    expect(reasonOf(bash('git commit -m "mention --force"'))).toBeNull()
    expect(reasonOf(bash("git commit -m '$(git push --force)'"))).toBeNull()
  })
})
