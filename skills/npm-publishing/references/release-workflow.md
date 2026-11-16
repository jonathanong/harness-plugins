# Release workflow for trusted publishing

Read this when writing or fixing the GitHub Actions job that publishes the package, or when a
publish from CI fails with `E404` or `ENEEDAUTH`.

## Requirements

- Trusted publishing needs npm 11.5.1 or newer, on Node 22.14.0 or newer.
- Node 22 bundles npm 10, which cannot trusted-publish. Use Node 24, which bundles npm 11, or
  install a newer npm in the job before publishing.
- The job needs `permissions: id-token: write`. Without it the runner cannot issue the OIDC token.
- `actions/setup-node` needs `registry-url`. That input writes the `.npmrc` that tells npm which
  registry to authenticate against; without it npm attempts no OIDC exchange.
- Set no `NODE_AUTH_TOKEN` and no npm token secret. The registry issues a short-lived credential
  for each run.
- Provenance comes with trusted publishing. `--provenance` is not needed.

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
      - run: npm publish ./relative/package-directory --access public
```

`package-manager-cache: false` keeps a cache that another workflow wrote out of the release
build.

## Failures

| Error                   | Meaning                                                | Fix                                                    |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `E404 Not Found` on PUT | npm sent a token the registry rejects; npm is too old. | Node 24, or install npm 11.5.1 or newer, then publish. |
| `ENEEDAUTH`             | npm has no registry to authenticate against.           | Add `registry-url` to `actions/setup-node`.            |

The `E404` is misleading: the package exists. With `registry-url` set and no token provided,
`actions/setup-node` writes a placeholder `NODE_AUTH_TOKEN` (`XXXXX-XXXXX-XXXXX-XXXXX`) so npm does
not warn about an unset variable. npm 10 sends that placeholder as the token and the registry
answers 404. npm 11 detects the GitHub Actions OIDC context and ignores the placeholder.

Do not fix either error by adding a long-lived npm token. That replaces trusted publishing
instead of repairing it.
