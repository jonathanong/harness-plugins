import { describe, expect, it } from 'vitest'

import { evaluateCommandPolicy } from './index.mts'

const blocked = (command: string) =>
  evaluateCommandPolicy(
    { tool_name: 'Bash', tool_input: { command } },
    {},
    { automationContext: true },
  ) !== null

describe('merge authority and the PR bodies agents write', () => {
  it.each([
    "gh pr create --title t --body 'Run `gh pr merge 1` when green'",
    'gh pr create --title t --body "$(cat <<\'EOF\'\nThen run gh pr merge 1.\nEOF\n)"',
    'gh pr create --title t --body "$(cat <<\'EOF\'\nThen run `gh pr merge 1`.\nEOF\n)"',
    "gh pr comment 1 --body-file - <<'EOF'\nPlease `gh pr merge 1` after review.\nEOF",
    "cat <<'EOF' | gh pr create --body-file -\nrun gh pr merge 1\nEOF",
    'git commit -m "docs: explain gh pr merge" && gh pr view 1',
  ])('does not block %j', (command) => {
    expect(blocked(command)).toBe(false)
  })

  it.each([
    'gh pr create --title t --body "run `gh pr merge 1`"',
    'gh pr create --title t --body "$(gh pr merge 1)"',
    "gh pr create --body-file b.md && cat <<'EOF'\nx\nEOF\ngh pr merge 1",
  ])('still blocks a merge that really runs: %j', (command) => {
    expect(blocked(command)).toBe(true)
  })

  it('points at --body-file when it blocks', () => {
    const decision = evaluateCommandPolicy(
      { tool_name: 'Bash', tool_input: { command: 'gh pr merge 1' } },
      {},
      { automationContext: true },
    )
    expect(decision?.reason).toContain('put it in a --body-file')
  })
})

describe('merge authority and path writes read through wrappers and runners', () => {
  it.each([
    'env A=1 sudo gh pr merge 1',
    'time timeout 60 gh pr merge 1',
    'sudo -u root gh pr merge 1',
    'timeout -s KILL 5 gh pr merge 1',
    'nice -n 5 gh pr merge 1',
    'xargs -I {} gh pr merge {}',
    'sudo -- gh pr merge 1',
    'command gh pr merge 1',
    'eval "gh pr merge 1"',
    'FOO=1 eval gh pr merge 1',
  ])('blocks the merge in %j', (command) => {
    expect(blocked(command)).toBe(true)
  })

  it('treats a runner with no command, or an unreadable prefix, as no merge', () => {
    for (const command of [
      'sudo',
      'sudo -u root',
      'env -S x gh pr merge 1',
      'echo gh pr merge 1',
    ]) {
      expect(blocked(command)).toBe(false)
    }
  })
})
