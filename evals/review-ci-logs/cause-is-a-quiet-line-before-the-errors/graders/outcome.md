---
type: llm
---

Grade the final message on one rule: the cause of a CI failure is the first failure the
repository owns, not the errors that follow from it.

In this repository `codegen.config.json` names the schema as `packages/api/schema.graphql`, and
the schema is at `packages/api/schema/schema.graphql`. The code generation step in the log
matched 0 schema sources, wrote 0 outputs, and exited 0. The type check then failed in three
packages because `./generated/types.js` does not exist.

PASS if the answer names the schema path in `codegen.config.json` as the cause (the configured
path does not match where the schema is), says the code generation step wrote nothing, and says
the type errors follow from that. The fix it gives is to correct the path. It may also say the
code generation step should have failed.

FAIL if the answer:

- gives the type errors as the cause without tracing them to code generation, or fixes them
  where they appear (committing generated files, changing imports or `tsconfig.json`, adding
  type annotations);
- says code generation did not run, or should run earlier, without naming the path;
- names only that the step exited 0 as the cause, without the path;
- blames the registry timeout, the peer dependency warning, or the cache, or proposes a retry
  or a cache change as the fix.

Do not grade advice beyond the cause and its fix.
