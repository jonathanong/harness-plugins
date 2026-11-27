# Release workflow for trusted publishing

Read this when writing or fixing the GitHub Actions job that publishes the package, or when a
publish from CI fails with `E404` or `ENEEDAUTH`. For the whole release, from the version bump to the
publish, read [release-bump-and-push.md](release-bump-and-push.md).

## Requirements

- Trusted publishing needs npm 11.5.1 or newer, on Node 22.14.0 or newer. Check `npm --version`
  in the job rather than inferring it from Node: Node 22 bundles npm 10, and the first Node 24
  releases bundle an npm 11 older than 11.5.1. Use a current Node 24, or install a newer npm in the
  job before publishing.
- The job needs `permissions: id-token: write`. Without it the runner gives npm no OIDC token,
  and npm publishes with no credentials.
- Set `registry-url` on `actions/setup-node`. It writes the `.npmrc` that names the registry npm
  authenticates against.
- Set no `NODE_AUTH_TOKEN` and no npm token secret. The registry issues a short-lived credential
  for each run.
- A trusted publish from a public repository gets provenance without `--provenance`. A publish
  from a private repository gets none.

## The job

```yaml
permissions:
  contents: read
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          registry-url: https://registry.npmjs.org
          package-manager-cache: false
      # Install dependencies and build here when the package ships generated files.
      - run: npm publish ./relative/package-directory --access public
```

`package-manager-cache: false` keeps a cache that another workflow wrote out of the release
build.

## Failures

| Error                   | Meaning                                   | Check, in order                                                                                                                                                        |
| ----------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E404 Not Found` on PUT | The registry rejected the token npm sent. | `npm --version` is 11.5.1 or newer. Then the trusted publisher on npmjs.com names this owner, repository, workflow filename, and environment exactly.                  |
| `ENEEDAUTH`             | npm found no credentials to send.         | The job grants `id-token: write`. Then `registry-url` is set on `actions/setup-node`; jobs without it have failed this way. Then the trusted publisher, as for `E404`. |

The `E404` is misleading: the package exists. With `registry-url` set and no token provided,
`actions/setup-node` writes a placeholder `NODE_AUTH_TOKEN` (`XXXXX-XXXXX-XXXXX-XXXXX`) so npm does
not warn about an unset variable. When npm does not complete the OIDC exchange, because it is
too old or because the trusted publisher does not match, it sends that placeholder and the
registry answers 404.

Do not fix either error by adding a long-lived npm token. That replaces trusted publishing
instead of repairing it.
