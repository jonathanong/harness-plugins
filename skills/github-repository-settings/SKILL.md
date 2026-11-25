---
name: github-repository-settings
description: Use when hardening a public repository, limiting pull requests to collaborators, deciding when fork pull requests may run Actions, or auditing or cleaning up labels, milestones, and projects. Restricts who can open pull requests and run CI, with the REST calls to read, set, and roll back each setting, and audits issue taxonomy for sprawl and drift.
---

# GitHub repository settings

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

These settings decide who can put a change in front of the repository's CI. Apply them to every
public repository. Read each setting before changing it, and read it back after.

## Limit pull request creation to collaborators

GitHub's "Pull requests: Collaborators only" setting lets only users with write, maintain, or admin
access open a pull request. Everyone else can still fork and open issues.

```bash
gh api repos/<owner>/<repo> --jq .pull_request_creation_policy   # default: all
gh api -X PATCH repos/<owner>/<repo> -f pull_request_creation_policy=collaborators_only
gh api -X PATCH repos/<owner>/<repo> -f pull_request_creation_policy=all   # roll back
```

- Dependabot still opens pull requests under this setting; that was observed on two repositories in
  November 2026. GitHub does not document it for Dependabot or for GitHub Apps, so after enabling
  it, confirm the next bot pull request still opens, and roll back if it does not.
- Do not set `has_pull_requests=false` for this. It turns pull requests off for everyone, bots
  included.
- Do not rely on interaction limits instead. They expire after at most six months.

## Require approval for outside contributors' workflow runs

By default, only a first-time contributor's fork pull request waits for a maintainer to approve
its workflow runs. Require approval for every outside contributor, so a contributor with one
merged typo fix cannot run arbitrary code in CI later.

```bash
gh api repos/<owner>/<repo>/actions/permissions/fork-pr-contributor-approval --jq .approval_policy
gh api -X PUT repos/<owner>/<repo>/actions/permissions/fork-pr-contributor-approval \
  -f approval_policy=all_external_contributors
```

The default is `first_time_contributors`. Approve a run only after reading the workflow files and
scripts the pull request changes.

## Audit issue taxonomy

Read [issue taxonomy audit](references/issue-taxonomy-audit.md) when asked to review or clean up
labels, milestones, or projects. It is read-only unless the request authorizes a change. It
checks near-duplicate and one-off labels, drift from the declared label source, and milestone and
project overlap.

## What these settings do not do

- They do not stop forks of a public repository. `allow_forking` only applies to private
  repositories.
- They cannot scope pull request creation more narrowly than write access, for example to one bot
  or one team.
- They do not cover branches inside the repository. A Dependabot pull request comes from an
  in-repository branch, not a fork; guard its workflows as the `dependabot` skill describes.

## Keep them in code when the provider can

As of `integrations/github` 6.13.0, the OpenTofu and Terraform provider has no attribute or
resource for either setting, so set them with the REST calls above and record that in the
repository's infrastructure docs. When the provider adds them, move them into infrastructure as
code and delete the manual step.
