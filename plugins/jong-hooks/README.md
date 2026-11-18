# jong-hooks

Claude Code hooks that judge a tool call against a rule table your repository supplies. The plugin
holds the mechanism: it parses shell commands, finds the git and `gh` invocations, and decides.
It holds no policy of its own. A repository with no policy file is unaffected.

```bash
claude plugin marketplace add jonathanong/harness-plugins
claude plugin install jong-hooks@harness-plugins
```

Node 24 or later runs the `.mts` source directly by stripping types, so there is no build.

## What it does

`PreToolUse` runs on `Bash`, `Write`, `Edit`, `MultiEdit`, and `NotebookEdit`. A block exits 2 and
the reason goes to the model. `PostToolUse` runs on file edits and returns advisory context.

- **Command patterns and git patterns.** Regex rules over each simple command, including the
  scripts inside `sh -c`, heredocs, and `$(...)`. Quoted text is blanked first, so a commit message
  that mentions `--force` passes. `standardGitPatterns` is a ready-made set: plain force pushes
  (`--force-with-lease` and `--force-if-includes` pass), amends, `pull --rebase`, ours/theirs
  strategies, and every way to skip git hooks.
- **Merge authority.** In automation, a parsed `gh pr merge`, `gh stack merge`, or `gh api` merge
  endpoint or mutation is blocked. Text that only mentions a merge, such as a PR body, does not
  count. In an attended Claude session, one plain `gh pr merge` is allowed without a second prompt.
- **Protected paths.** In automation, writes to listed files and directories are blocked:
  redirections, `tee`, `sed -i`, `cp` and `mv` targets, `rm`, editors, and the Write and Edit
  tools. Reads (`cat`, `git diff`, `ls`) pass. A script that writes from inside an interpreter
  (`python -c`) is not analyzed.
- **Typo paths.** A mistyped path segment, such as a misspelled dot-directory, is refused.
- **GitHub stacks.** Optional `stack` rules keep `gh stack` to a non-interactive allowlist and
  require PRs to root on a configured base branch.

Automation means `CLAUDE_CODE_SESSION_ATTENDED=0` (`claude -p`) or a CI marker such as `CI` or
`GITHUB_ACTIONS`. Interactive sessions skip the merge and protected-path blocks.

## Configure it

Add `.claude/jong-hooks.policy.mjs` to the repository, or point `JONG_HOOKS_POLICY` at another
module (relative to the project directory). Its default export is a policy object, or a function of
the hook context that returns one.

```js
export default {
  command: {
    standardGitPatterns: true,
    commandPatterns: [{ pattern: /\bdev-server\s+start\b/, reason: 'Use the managed runner.' }],
    protectedPaths: {
      dirPrefixes: ['.github/workflows/'],
      exactFiles: ['policy.config.json'],
      reason: 'Policy files are edited by a human.',
    },
    mergeGuidance: 'See docs/merge-policy.md.',
  },
}
```

The `command` table is the `CommandPolicy` type in
[`src/command-policy/types.mts`](src/command-policy/types.mts). The module may also export
`checkers` (file checks after an edit), `reminder` (context after a tool call), and `onPayload`.
If the module throws or cannot load, the pre-tool-use hook fails closed with exit 2.

## Develop

```bash
pnpm install
pnpm run test:coverage   # 100% coverage is required
```
