# jong-hooks

Claude Code and Codex hooks that judge a tool call against a rule table your repository supplies.
The plugin holds the mechanism: it parses shell commands, finds the git and `gh` invocations, and
decides. It holds no policy of its own. A repository with no policy file is unaffected.

```bash
claude plugin marketplace add jonathanong/harness-plugins
claude plugin install jong-hooks@harness-plugins
```

### Codex

```bash
codex plugin marketplace add jonathanong/harness-plugins --ref main
codex plugin add jong-hooks@harness-plugins
```

The Codex manifest (`.codex-plugin/plugin.json`) names `hooks/codex-hooks.json` explicitly, so
Codex never reads the Claude file `hooks/hooks.json`. Codex runs plugin hooks only after you trust
them: open `/hooks` in the TUI and trust the two `jong-hooks` entries (a change to the plugin
re-prompts). For an unattended run you vetted yourself, `codex exec --dangerously-bypass-hook-trust`
skips the prompt for that invocation.

Codex `PreToolUse` covers `Bash` (shell and `exec_command`) and `apply_patch`; `PostToolUse` runs
after `apply_patch`.
A block is exit 2 with the reason on stderr; Codex refuses the call and shows the reason.

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
  count, and neither does `--help` or a `gh pr merge` whose only flag is `--disable-auto`. Interactively the hook has no opinion on merges; use Claude Code permission rules (for example `"ask": ["Bash(gh pr merge:*)"]`) or Codex's own approvals.
- **Typo paths.** A mistyped path segment, such as a misspelled dot-directory, is refused.
- **GitHub stacks.** Optional `stack` rules keep `gh stack` to a non-interactive allowlist and
  require PRs to root on a configured base branch.

Automation means `CLAUDE_CODE_SESSION_ATTENDED=0` (`claude -p`) or a CI marker such as `CI` or
`GITHUB_ACTIONS`. Interactive sessions skip the merge block. Codex sets no
variable and sends no payload field that tells `codex exec` from the TUI, so a Codex session counts
as automation only under a CI marker (or `--automation-env NAME` on the hook command).

The policy file is looked up under the root: `--root`, else `CLAUDE_PROJECT_DIR`, else the git
toplevel of the payload's `cwd`, else the hook process's directory. Codex sets no project-dir
variable, so a Codex session started in a subdirectory still finds the repository's policy. Codex
ignores an inherited `CLAUDE_PROJECT_DIR`, which names a parent Claude session's project.

### What was verified against Codex CLI 0.169

- The plugin installs from this marketplace, and Codex lists exactly the two hooks in
  `codex-hooks.json` (not `hooks.json`), with `${PLUGIN_ROOT}` expanded, as untrusted until you
  trust them. Checked through `codex app-server` `hooks/list` with an isolated `CODEX_HOME`.
- The installed hook command, run with a Codex-shaped payload from an unrelated directory, finds
  the policy from the payload `cwd` and exits 2 with the reason on stderr.
- The `SessionStart` payload shape and the hook environment were captured from a real
  `codex exec` run (see `src/command-policy/hook/codex-payloads.test.mts`).
- Not verified: a live model-driven Bash or `apply_patch` block. The capture account hit its Codex
  usage limit. The `PreToolUse` payload shapes in the tests follow the Codex hooks documentation.

## Configure it

Add `.claude/jong-hooks.policy.mjs` to the repository, or point `JONG_HOOKS_POLICY` at another
module (relative to the project directory). Its default export is a policy object, or a function of
the hook context that returns one.

```js
export default {
  command: {
    standardGitPatterns: true,
    commandPatterns: [{ pattern: /\bdev-server\s+start\b/, reason: 'Use the managed runner.' }],
    typoPaths: [{ segment: '.claire', reason: 'Did you mean .claude?' }],
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
