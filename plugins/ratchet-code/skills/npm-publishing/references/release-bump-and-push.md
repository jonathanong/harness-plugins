# Release flow: bump, push, publish from that commit

Read this when writing or reviewing a workflow that releases a package: one that picks the next
version, records it in the repository, and publishes. For the requirements of the publishing step
itself and its `E404` and `ENEEDAUTH` failures, read [release-workflow.md](release-workflow.md).

## The flow

1. A person starts the workflow with `workflow_dispatch` and picks the bump: patch, minor, or
   major.
2. A job checks out the default branch, runs the checks, bumps the version, commits, tags, and
   pushes the commit and the tag together. It outputs the commit's SHA.
3. Every later job checks out that SHA, builds from it, and publishes.

The published version, the tag, and the commit on the default branch then name the same source,
and the provenance the registry records points at a commit that is on the default branch.

## Rules

- **The workflow writes the version.** Nobody edits `version` in a pull request. A hand bump can
  merge with no release behind it, and the next release then skips or repeats a version.
- **Release from the default branch.** `workflow_dispatch` can be started on any branch, so check
  out the default branch by name in the first job instead of the branch the run was started on.
- **Run the checks before the push.** The push and the publish cannot be taken back. A failing
  test should stop the release while nothing has changed.
- **Bump every file that holds the version in the same commit**: the lockfile, workspace
  packages that depend on each other, a plugin manifest. Use the package manager's command with
  its own commit and tag turned off (`npm version <bump> --no-git-tag-version`), then commit once.
- **Push the commit and the tag in one atomic push**: `git push --atomic origin HEAD:main v1.2.3`.
  Either both land or neither does, so there is never a tag for a commit that is not on the
  branch. When the push is rejected because the branch moved, fail the run and start a new one. Do
  not force the push.
- **Pass the SHA, not the branch or the tag name.** Take `git rev-parse HEAD` after the commit and
  hand it to later jobs as a job output. A later `checkout` of the branch can pick up a commit
  merged a minute after the bump, which was never tested and carries the wrong contents under the
  new version.
- **Build after the bump, from that commit.** A build made before the bump can carry the old
  version in its output.
- **Use OIDC to publish.** npm, crates.io, and PyPI each take a short-lived credential from the
  workflow's identity. Store no registry token when the registry offers this. For a registry that
  has none, keep the token in a secret of a deployment environment that only the publishing job
  uses.
- **Start from no permissions.** Set `permissions: {}` for the workflow and grant each job what it
  uses: `contents: write` for the job that pushes, `id-token: write` and `contents: read` for a
  job that publishes. Check out with `persist-credentials: false` in every job that does not
  push.
- **One release at a time, never cancelled.** Give the workflow one `concurrency` group with
  `cancel-in-progress: false`. A cancelled release can stop between the push and the publish.
- **Publish the package people install last.** When a release has several packages, publish the
  ones the main package depends on first, check they can be installed, and publish the main
  package after. Its `latest` tag must not point at a version whose dependencies are missing.
- **Create the GitHub release after the publish**, from the tag, so a release page never
  describes a version that is not on the registry.

## The token that pushes: `RELEASE_TOKEN`

The first job pushes a commit straight to the default branch. The default `GITHUB_TOKEN` can do
that only on a branch with no protection, and its pushes start no other workflow, so CI never
runs on the bump commit. A ruleset that requires pull requests or status checks rejects it. So
the push uses a token stored as the repository secret `RELEASE_TOKEN`.

A person creates the token and stores it. Hand these steps over; do not create the token, and
never ask for its value or put one in a command.

1. Create a fine-grained personal access token, on github.com under Settings, Developer settings,
   Personal access tokens, Fine-grained tokens:
   - **Resource owner:** the account or organization that owns the repository. An organization
     may have to approve the token before it works.
   - **Repository access:** only this repository.
   - **Permissions:** Contents, read and write. Add Workflows, read and write, only when the
     bump commit changes a file under `.github/workflows`. Nothing else.
   - **Expiration:** a date, not "no expiration". Note the date; the release fails on the day
     after it.
2. Let the token's owner bypass the ruleset on the default branch: in the repository's Settings,
   Rules, Rulesets, open the ruleset and add that person, or a role or team they hold, to the
   bypass list. Without this the push is rejected with `GH013: Repository rule violations`.
3. Store the token as an Actions secret, from a terminal so the value is never displayed:
   `gh secret set RELEASE_TOKEN --repo owner/repository`, which prompts for the value. Do not pass
   it with `--body`, which puts it in shell history.
4. Run the release once and check that the bump commit and the tag are on the default branch.

In the workflow:

- Pass the secret to `actions/checkout` in the first job only, as `token`. The checkout stores it
  for the later `git push`. No publishing job reads it.
- Fail in the first step, with a message that names the secret, when it is empty. Otherwise
  the run fails later, at the checkout or the push, with an error that does not name the cause.

```yaml
- name: Check RELEASE_TOKEN is set
  env:
    RELEASE_TOKEN: ${{ secrets.RELEASE_TOKEN }}
  run: |
    if [ -z "$RELEASE_TOKEN" ]; then
      echo "::error::The RELEASE_TOKEN secret is not set. It must be a token that may push to main."
      exit 1
    fi
```

A GitHub App is the alternative when no one person should own the token: install the app on the
repository with Contents write, add the app to the bypass list, and mint an installation token
in the first job with `actions/create-github-app-token`. It expires within the hour and needs no
renewal date.

## When a release fails partway

- **Before the push:** nothing changed. Fix the cause and start the workflow again.
- **After the push:** the version is committed and tagged but not published. Use "Re-run failed
  jobs". The first job is not run again, and its outputs still name the same SHA. Starting the
  workflow again would bump to the next version and leave a tag with nothing published under it.
- **Make each publish step safe to run twice**: skip a package whose version is already on the
  registry, since a registry rejects a version it already has.
- A workflow that people re-run days later can take an input such as `resume_version`: when it
  is set, the first job finds the existing tag, checks that the version in that commit matches,
  and outputs its SHA without bumping.

## The workflow

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      bump:
        type: choice
        required: true
        default: patch
        options: [patch, minor, major]

permissions: {}

concurrency:
  group: release
  cancel-in-progress: false

jobs:
  prepare:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    permissions:
      contents: write
    outputs:
      sha: ${{ steps.bump.outputs.sha }}
      version: ${{ steps.bump.outputs.version }}
    steps:
      # The RELEASE_TOKEN check above goes here.
      - uses: actions/checkout@v6
        with:
          ref: main
          token: ${{ secrets.RELEASE_TOKEN }}
      - uses: actions/setup-node@v6
        with:
          node-version: 24
      - run: npm ci --ignore-scripts
      - run: npm test
      - id: bump
        env:
          BUMP: ${{ inputs.bump }}
        run: |
          set -euo pipefail
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          npm version "$BUMP" --no-git-tag-version
          version="$(node -p "require('./package.json').version")"
          git commit --all --message "chore(release): v$version"
          git tag --annotate "v$version" --message "v$version"
          git push --atomic origin HEAD:main "v$version"
          echo "sha=$(git rev-parse HEAD)" >> "$GITHUB_OUTPUT"
          echo "version=$version" >> "$GITHUB_OUTPUT"

  publish:
    needs: prepare
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v6
        with:
          ref: ${{ needs.prepare.outputs.sha }}
          persist-credentials: false
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          registry-url: https://registry.npmjs.org
          package-manager-cache: false
      - run: npm ci --ignore-scripts
      - run: npm run build
      - run: npm publish --access public
```

Pin each action to a commit SHA in a real workflow. The input reaches the script through `env`,
not through `${{ }}` inside `run`, so its text is never parsed as shell.

A small package can do all of this in one job: bump, push, then publish from the same checkout.
The published files still come from the pushed commit, because nothing checks out again. Split
the jobs once the release builds on several runners or publishes several packages.
