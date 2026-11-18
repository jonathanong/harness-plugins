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
    evaluateCommandPolicy(bash(command), {}, { automationContext: true })?.disposition === 'block'

  it.each([
    'gh pr create --title t --body "run gh pr merge when green"',
    'gh pr create --body-file body.md --title "gh pr merge docs"',
    'git merge --ff-only && gh pr view 1',
    'git merge topic; gh pr view 1',
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

describe('protected paths block writes, not reads', () => {
  const policy: CommandPolicy = {
    protectedPaths: {
      dirPrefixes: ['secrets/'],
      exactFiles: ['policy.mts'],
      reason: 'protected',
    },
  }
  const blocked = (payload: HookPayload) =>
    evaluateCommandPolicy(payload, policy, { automationContext: true })?.reason === 'protected'

  it.each([
    'cat policy.mts',
    'git diff -- policy.mts',
    'git diff secrets/a',
    'git log -p secrets/a',
    'git show HEAD:policy.mts',
    'ls secrets/',
    'head -n 3 secrets/a | wc -l',
    'grep -r token secrets',
    'rg token secrets/',
    'cp policy.mts backup.mts',
    'cp secrets/a /tmp/a',
    'sed -n 1,5p policy.mts',
    'sed s/a/b/ policy.mts > /tmp/out',
    'echo hi > /tmp/x 2>&1',
    'diff policy.mts other.mts',
    'echo "cat > policy.mts"',
    'git checkout main',
    'git',
    'git status',
    'git -C',
    'cp -t',
    'sudo',
    'sudo -u root',
    'echo >',
    'curl -o /tmp/x https://example.test/secrets/a',
    'sudo cat secrets/a',
    'FOO=1 cat policy.mts',
  ])('allows the read %j', (command) => {
    expect(blocked(bash(command))).toBe(false)
  })

  it.each([
    'echo x > policy.mts',
    'echo x >> secrets/a',
    'echo x >| policy.mts',
    'echo x &> secrets/log',
    'cat a 2> policy.mts',
    'echo x | tee secrets/a',
    'echo x | tee -a policy.mts',
    'sed -i s/a/b/ policy.mts',
    "sed -i.bak 's/a/b/' secrets/a",
    'perl -pi -e s/a/b/ policy.mts',
    'sed --in-place s/a/b/ policy.mts',
    'cp a policy.mts',
    'cp -t secrets a b',
    'cp --target-directory=secrets a',
    'mv policy.mts old',
    'mv new policy.mts',
    'rm policy.mts',
    'rm -rf secrets',
    'rm -- policy.mts',
    'rm -f -- policy.mts',
    'touch secrets/x',
    'mkdir secrets/x',
    'chmod +x policy.mts',
    'install -m 0644 a secrets/a',
    'dd if=/dev/zero of=policy.mts',
    'vim policy.mts',
    'git checkout -- policy.mts',
    'git -C . restore secrets/a',
    'git -c a=b --no-pager checkout -- secrets/a',
    'git rm policy.mts',
    'curl -o secrets/a https://example.test',
    'curl --output=policy.mts https://example.test',
    'wget -O policy.mts https://example.test',
    'sudo rm policy.mts',
    'timeout 5 touch secrets/a',
    'env FOO=1 rm policy.mts',
    'cd /repo && rm secrets/a',
    "sh -c 'echo x > secrets/a'",
    'echo "$(touch policy.mts)"',
    "apply_patch <<'EOF'\n*** Begin Patch\n*** Update File: policy.mts\n*** End Patch\nEOF",
  ])('blocks the write %j', (command) => {
    expect(blocked(bash(command))).toBe(true)
  })

  it('blocks Write and Edit tool calls but not Read, Grep, Glob, or LS', () => {
    for (const tool_name of ['Write', 'Edit', 'MultiEdit', 'NotebookEdit']) {
      expect(blocked({ tool_name, tool_input: { file_path: 'secrets/a' } })).toBe(true)
    }
    for (const tool_name of ['Read', 'Grep', 'Glob', 'LS']) {
      expect(
        blocked({ tool_name, tool_input: { file_path: 'secrets/a', path: 'policy.mts' } }),
      ).toBe(false)
    }
  })

  it('does not treat a working directory as a written path', () => {
    expect(blocked({ tool_name: 'Bash', cwd: 'secrets/a', tool_input: { command: 'ls' } })).toBe(
      false,
    )
    expect(blocked({ tool_name: 'Write', cwd: 'secrets/a', tool_input: { file_path: 'ok' } })).toBe(
      false,
    )
    expect(
      blocked({ tool_name: 'Write', tool_input: { file_path: 'ok', workdir: 'secrets' } }),
    ).toBe(false)
  })
})
