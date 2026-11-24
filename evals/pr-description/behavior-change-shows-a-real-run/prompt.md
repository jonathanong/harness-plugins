---
description: A description for a change in a command's behavior shows the real input, the exact command that was run, and its real output before and after, not only a summary table or checklist.
tags: [pr-description, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the pull request description for this change to our `depcheck` CLI. Notes from my work:

- `depcheck unused` reported a package as unused when it was only imported through a re-export (`export * from "pkg"`). People deleted packages that were in use. Issue #212.
- The import scanner now follows `export ... from` statements, both `export *` and named re-exports. Type-only re-exports (`export type { X } from "pkg"`) count as a use only with `--include-types`, same as type-only imports today.
- No change to `depcheck missing` or to the JSON output's shape.
- I checked it on the fixture `fixtures/reexport/`, which has this `src/index.ts`:

```ts
export * from 'left-pad-lite'
export { parse } from 'tiny-args'
export type { Options } from 'opts-types'
```

and `left-pad-lite`, `tiny-args`, `opts-types` and `unused-thing` in `package.json`.

On `main`:

```console
$ depcheck unused fixtures/reexport
Unused dependencies (4):
  left-pad-lite
  opts-types
  tiny-args
  unused-thing
exit status 1
```

On this branch:

```console
$ depcheck unused fixtures/reexport
Unused dependencies (2):
  opts-types
  unused-thing
exit status 1
$ depcheck unused fixtures/reexport --include-types
Unused dependencies (1):
  unused-thing
exit status 1
```

- Added 6 unit tests for the scanner and the fixture above. Tests, lint and typecheck are green.

Reply in your message; you don't need to create files.
