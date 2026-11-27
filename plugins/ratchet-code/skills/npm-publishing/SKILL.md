---
name: npm-publishing
description: Use when publishing a new package, moving a package to trusted publishing, writing or reviewing a release workflow that bumps a version and publishes it, or fixing a CI publish that fails with E404 or ENEEDAUTH. Prepare a first npm publish and trusted publishing (OIDC) for a human to run, and set up the GitHub Actions workflow that bumps, tags, and publishes.
---

# npm publishing bootstrap

Prepare the local package. Leave public registry writes and trusted-publisher mutations to the
human. Read every applicable `AGENTS.md` from the repository root through the
package. Repository-local policy owns the package path and name, npm scope, GitHub repository,
release workflow, build commands, and whether a laptop may publish, and overrides these defaults.

## Prepare the package

- Resolve the absolute repository root, the package directory relative to that root, the exact npm
  package name, `owner/repository`, and the release workflow filename. The workflow value is the
  case-sensitive filename under `.github/workflows`, not a path. Leave no placeholders in the final
  commands.
- Confirm the local npm has `npm trust` with `--allow-publish` (npm 11.15 or newer),
  account-level two-factor authentication, and write access to the package or scope.
- On the default branch, the workflow must grant `id-token: write`, use a supported runner, set
  `registry-url` on `actions/setup-node`, run an npm that publishes with OIDC and no token (npm 11.5.1 or newer; check `npm --version`,
  since Node 22 bundles npm 10, which cannot), and publish this package with no npm token.
  [references/release-workflow.md](references/release-workflow.md) has the publishing job and
  explains the `E404` and `ENEEDAUTH` failures; read it when a publish from CI fails.
- When the package does not exist in the registry, create the smallest useful stub in its intended
  directory. Follow neighboring packages for metadata, source, exports, types, license, README,
  build output, and workspace registration.
- Do not replace an existing module with a stub. Do not publish a version already in the registry.
- Build the package, then inspect the payload with
  `npm publish <package-directory> --access public --dry-run`. Stop if it includes secrets,
  environment files, source maps, unrelated workspace files, or a missing runtime or type
  entrypoint. The dry run must include `prepublishOnly`. A pack-only check misses that script.
- Read the package's `prepublishOnly`, `prepare`, `prepack`, `publish`, and `postpublish` scripts
  before the dry run, which executes the pre-publish ones. Hand off any script that changes
  something outside the working tree instead of running it.
- If the package already exists, have the human run `npm trust list <package-name>` before any
  mutation. Omit the initial publish command. If trust already exists, report it and omit trust
  creation. Do not revoke or replace it.

## The release workflow

A release is one run of one workflow. A person starts it; the workflow does the rest.

- The workflow bumps the version, commits it, tags it, and pushes both to the default branch. Do
  not bump the version by hand in a pull request: a hand bump can merge with no release behind
  it, and two open pull requests can claim the same version.
- Publish from the commit the workflow pushed, by its SHA. Do not check out the branch again, and
  do not publish on a tag push: the branch may have moved since the bump, and a tag can be moved.
- Authenticate to the registry with OIDC wherever the registry supports it. Keep a long-lived
  token only for a registry that has no trusted publishing, in a secret that only the publishing
  job reads.
- Give the push and the publish to different jobs when the release has more than one job: the job
  that can write to the repository gets no `id-token`, and the job that publishes gets no write
  access to the repository.
- The push to the default branch uses a token in the `RELEASE_TOKEN` secret, read by the pushing
  job only. A person creates it: a fine-grained token limited to this repository with Contents
  read and write, owned by someone on the branch ruleset's bypass list. Hand over those steps;
  never ask for the token's value.
- After a failed publish, re-run the failed jobs. Do not start the workflow again: that bumps the
  version a second time and leaves a tag with nothing published under it.

[references/release-flow.md](references/release-flow.md) has the workflow and the reasons; read it
when writing or reviewing a release workflow.

## Hand off the mutations

- Do not run a real `npm publish` or a mutating `npm trust` subcommand.
- Say that the first command creates an externally visible, effectively irreversible package
  version, and the second grants the named workflow publish authority.
- Include the publish command only when bootstrapping a package that does not exist. An existing
  package with an empty trust list goes straight to trust setup.
- The commands read the one-time password from the `OTP` shell variable. Tell the human to set it
  first with `read -s OTP`, which keeps the code out of shell history, and to set it again before
  the second command if the code has expired. Tell them not to share or record the code. Warn that
  `--otp` still exposes the code in process arguments while the command runs, and to follow local
  secret-handling policy. Never ask for the code or put a value in the commands.
- An account that signs in with a security key has no code to type. Tell that human to drop
  `--otp=$OTP` and complete the browser prompt npm opens.
- Give the applicable commands with resolved values, in this order:

```sh
cd /absolute/repository/root
read -s OTP
npm publish ./relative/package-directory --access public --otp=$OTP
npm trust github @scope/package \
  --repo owner/repository \
  --file release.yml \
  --allow-publish \
  --yes \
  --otp=$OTP
```

- The `cd` target is the directory from which the relative publish path resolves.
- If local policy prohibits publishing from this machine, say so and name the approved environment.
  Keep the same command order.
- Ask the human to confirm the payload, package name, repository, workflow filename, and publish
  permission immediately before running the commands.
- Afterward, have the human verify any newly published version and run `npm trust list` again.
- Do not retry an authorization or registry failure blindly. Do not fall back to a long-lived npm
  token without explicit direction.
