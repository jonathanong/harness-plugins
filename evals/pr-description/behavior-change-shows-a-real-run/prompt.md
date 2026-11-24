---
description: A description for a change in a command's behavior shows one real run from a user's point of view, on the realistic scenario and not only on a minimal fixture or in a summary table.
tags: [pr-description, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the pull request description for this change to our `depcheck` CLI. Notes from my work:

- `depcheck unused` reported a package as unused when it was only imported through a re-export (`export * from "pkg"`). Issue #212: the storefront team ran it before a cleanup, it listed their payments client as unused, they removed it, and checkout broke in staging.
- The import scanner now follows `export ... from` statements, both `export *` and named re-exports. Type-only re-exports count as a use only with `--include-types`, same as type-only imports today.
- No change to `depcheck missing` or to the JSON output's shape.
- Unit fixture I added, `fixtures/reexport/`: `src/index.ts` is `export * from "a";` and `package.json` has `a` and `b`. On `main` `depcheck unused fixtures/reexport` prints `Unused dependencies (2): a, b`; on this branch `Unused dependencies (1): b`.
- I also ran it on the storefront app from the issue. Its `src/payments/index.ts`:

```ts
export * from '@shopkit/payments-client'
export { formatMoney } from '@shopkit/currency'
export type { Cart } from '@shopkit/cart-types'
```

On `main`:

```console
$ depcheck unused apps/storefront
Unused dependencies (4):
  @shopkit/cart-types
  @shopkit/currency
  @shopkit/payments-client
  lodash.debounce
exit status 1
```

On this branch:

```console
$ depcheck unused apps/storefront
Unused dependencies (2):
  @shopkit/cart-types
  lodash.debounce
exit status 1
$ depcheck unused apps/storefront --include-types
Unused dependencies (1):
  lodash.debounce
exit status 1
```

- Added 6 unit tests for the scanner. Tests, lint and typecheck are green.

Keep it short, reviewers skim. Reply in your message; you don't need to create files.
