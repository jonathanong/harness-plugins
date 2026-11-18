import { describe, expect, it } from 'vitest'

import { evaluateCommandPolicy, standardGitPatterns } from './index.mts'
import type { CommandPolicy, HookPayload } from './index.mts'

const bash = (command: string): HookPayload => ({ tool_name: 'Bash', tool_input: { command } })

describe('git push --force-if-includes', () => {
  const policy: CommandPolicy = { gitPatterns: standardGitPatterns() }
  const reason = (command: string) => evaluateCommandPolicy(bash(command), policy)?.reason ?? null

  it.each([
    'git push --force-if-includes',
    'git push --force-with-lease --force-if-includes',
    'git push --force-if-includes --force-with-lease=main origin main',
    'git push origin main --force-with-lease --force-if-includes',
  ])('allows %j', (command) => {
    expect(reason(command)).toBeNull()
  })

  it.each([
    'git push --force',
    'git push -f',
    'git push --force --force-if-includes',
    'git push --force-if-includes -f',
    'git push --force-if-includes --force origin main',
  ])('still blocks %j', (command) => {
    expect(reason(command)).toContain('Force pushes')
  })
})

describe('merge authority matches a parsed gh invocation', () => {
  const blocked = (command: string) =>
    evaluateCommandPolicy(bash(command), {}, { automationContext: true }) !== null

  it.each([
    'gh pr create --title t --body "run gh pr merge when green"',
    'gh pr create --body-file body.md --title "gh pr merge docs"',
    'git merge --ff-only && gh pr view 1',
    'git merge topic; gh pr view 1',
    // A runner with no command after it runs nothing.
    'gh pr merge --help; sudo -u root',
    'gh pr merge --help; sudo --',
    'gh pr merge --help; FOO=1',
    // `command -v` only looks the program up.
    'command -v gh && gh pr merge --help',
    // A trailing redirection with no target is read as the words written.
    'gh pr view 1 >',
    'echo "gh pr merge 1"',
    "gh issue comment 1 --body 'please gh pr merge'",
    'gh',
    'gh --version',
    'gh pr view 1 --json mergeable',
    'gh api repos/o/r/pulls/1 -f body="see /merge"',
    'gh api repos/o/r/pulls/1/files',
    'gh pr checks 1 && git merge main',
  ])('does not block %j', (command) => {
    expect(blocked(command)).toBe(false)
  })

  it.each([
    'gh pr merge 1',
    'gh pr create --title t && gh pr merge 1',
    'git merge main && gh pr merge 1 --squash',
    'gh -R o/r pr merge 1',
    'env FOO=1 gh pr merge 1',
    'sudo gh pr merge 1',
    'sudo -- gh pr merge 1',
    'sudo -E -u root gh pr merge 1',
    'timeout 30 gh pr merge 1',
    'echo 1 | xargs gh pr merge',
    'bash -c "gh pr merge 1"',
    'echo "$(gh pr merge 1)"',
    'gh stack merge 12',
    'gh extension exec stack merge 12',
    'gh api -X PUT repos/o/r/pulls/1/merge',
    'gh api repos/o/r/merges -f base=main',
    "gh api graphql -f query='mutation { mergePullRequest(input: {}) { clientMutationId } }'",
    "gh api graphql -f query='mutation { enablePullRequestAutoMerge(input: {}) { clientMutationId } }'",
  ])('blocks %j', (command) => {
    expect(blocked(command)).toBe(true)
  })
})
