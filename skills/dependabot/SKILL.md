---
name: dependabot
description: Configure Dependabot coverage, grouping, cooldowns, and secrets, and start a Dependabot update check on demand. Use when writing or reviewing dependabot.yml or a workflow that runs on Dependabot pull requests, or when asked to trigger, re-run, or force a Dependabot run.
---

# Dependabot policy

Read every applicable `AGENTS.md`, then the repository's dependency, CI, release,
and branch-protection docs. Repository-local policy owns the accepted cooldown, package roots,
first-party publishers, runner policy, required checks, and secret
source, and overrides these defaults.

## Cover the dependency graph

- Inventory tracked manifests, lockfiles, Dockerfiles, workflow actions, infrastructure roots, and
  any companion dependency bot. Add one Dependabot update entry per supported ecosystem and
  manifest root. Do not create a second owner for a dependency already assigned elsewhere.
- Schedule version checks daily.
- Every update entry, in every ecosystem, sets a cooldown of at least seven days. That includes
  `github-actions` and `docker`, whose bumps run in CI before anyone reviews them. Set
  `cooldown.default-days: 7`, and set any `semver-major-days`, `semver-minor-days`, or
  `semver-patch-days` to at least 7. Never lower a longer value already there. Most compromised
  releases are found and pulled within days, so the delay keeps them out. Cooldown applies to
  version updates, not security updates; that gap is the known residual risk.
- Set `open-pull-requests-limit: 5` on every update entry. The limit is per entry and covers
  version updates only. Use a lower value only when a serialized repair or manual validation path
  requires it.
- Keep security updates enabled and immediate. Do not add an age gate that delays vulnerability
  fixes.

## Group package families

Group packages that share one compatibility family or release train. Do not group by version type.
Use manifests, peer dependencies, lockfiles, and upstream release practice to decide what moves
together.

```yaml
cooldown:
  default-days: 7
  exclude: ['@acme/*', 'acme-cli']
groups:
  first-party:
    patterns: ['@acme/*', 'acme-cli']
  oxc:
    patterns: ['oxlint', 'oxfmt', 'oxlint-tsgolint']
  vitest:
    patterns: ['vitest', '@vitest/*', '@vitejs/*']
  react:
    patterns: ['react', 'react-dom']
  react-security:
    applies-to: 'security-updates'
    patterns: ['react', 'react-dom']
  react-email:
    patterns: ['react-email', '@react-email/*']
```

- Name each group for the package, toolchain, framework, or verified release family. Prefer a narrow
  namespace or prefix wildcard such as `@vitest/*` when that wildcard is one family. Put more
  specific families before broader ones.
- Do not add generic groups such as `other-minor-and-patch`, `minor-and-patch`,
  `security-minor-and-patch`, or `security-updates`. Do not use `patterns: ['*']` to force every
  update into a group. Narrow family wildcards are expected. Leave unrelated packages ungrouped.
- Omit `update-types` so a family receives major, minor, and patch updates. Leaving majors out of
  the group splits the release train.
- Groups default to `applies-to: version-updates`. When the same family is also safe to upgrade
  together for security fixes, add a separate group such as `react-security` with the same patterns
  and `applies-to: security-updates`. Do not combine unrelated vulnerability fixes into one group.
- Keep verified first-party packages in a `first-party` group. For a namespace the owner wholly
  controls, use its scoped wildcard, such as `@acme/*`. List unscoped packages by exact name.
- Keep first-party patterns in `cooldown.exclude` so those updates have zero-day eligibility, while
  third-party packages keep the release delay.

## Exempt verified first-party releases

- Use `cooldown.exclude` only for first-party packages whose owning repository and default-branch
  release workflow have been verified.
- That workflow must publish the package with OIDC, `id-token: write`, and no long-lived registry
  token.
- Use a namespace wildcard only when the owner controls the whole namespace and intends future
  packages to inherit the exemption. Otherwise use exact package names.
- Keep the repository-owned registry, documentation, cooldown exclusions, and `first-party` group in
  sync.

## Checks on Dependabot pull requests

- Do not check out or execute pull-request code in a `pull_request_target` workflow. Pin external
  actions per local policy.
- A `pull_request` workflow on a Dependabot pull request runs the bumped code and the bumped actions
  before review. Give it a write-capable Dependabot secret, such as a token for auto-merge, only
  when every update entry has the seven-day cooldown above, and first-party exclusions are
  verified. Without that cooldown, split it in two: credential-free checks on `pull_request`, then
  a default-branch `workflow_run` or `pull_request_target` job that holds the token, reads only
  pull-request metadata, and never checks out the pull request.
- A Dependabot-triggered workflow cannot assume ordinary Actions secrets or trusted OIDC access.
  Copy only the narrow credentials mandatory tests need into Dependabot secret scope.
- For cloud, deployment, production, or other privileged checks, keep credential-free validation
  running and mark the trusted portion skipped or not applicable for Dependabot. A required fan-in
  job must distinguish that intentional state from an unexpected missing credential.

## Validate and roll out

- Parse the YAML. Run the repository's workflow checker and policy tests.
- Inspect the diff for uncovered manifests, overlapping groups, broad exemptions, secret exposure,
  and pull-request code crossing a privileged boundary.
- Verify the repository setting for dependency security updates.
- After the configuration reaches the default branch, read Dependabot logs for every configured
  root. Check a representative patch, minor, major, and security update, and a check that runs
  without its secret.

## Request a fresh update check

Dependabot runs on its schedule. To make it run now, for example after a configuration change
reaches the default branch or when a repository has no open update pull requests, use the web UI.
GitHub exposes no REST or GraphQL endpoint and no `gh` command that starts a version-update run.

1. Open `https://github.com/<owner>/<repository>/network/updates` in an authenticated browser. The
   same page is under Insights, Dependency graph, Dependabot.
2. The page lists one row per update entry in `dependabot.yml`. Choose "Check for updates" for
   each entry that should run.
3. Open "Recent update jobs" on a row and read the log once the run has finished. Do not reload the
   page in a loop to watch it.

- Use a browser tool only when one is available with the user's own signed-in session. Otherwise
  give the user the URL and the entries to check, and say that the check was not requested.
- Do not push a no-op edit to `dependabot.yml` to force a run.
- To rebuild one existing pull request, comment `@dependabot recreate` or `@dependabot rebase` on
  it. That does not check for new versions. `recreate` discards commits other people pushed to the
  pull request, so save those first.
- When rebasing a dependency pull request by hand, a lockfile conflict is not resolved by taking
  one side. The `git-commit-checklist` skill owns that procedure.
