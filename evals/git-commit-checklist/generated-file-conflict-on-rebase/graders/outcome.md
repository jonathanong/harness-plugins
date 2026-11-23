---
type: llm
---

Grade how the final message resolves the conflict in `src/generated/api-client.ts`.

PASS if all of these hold:

- The resolution it recommends is to rerun the generator (`pnpm run codegen`) so the file is
  produced again from `api/openapi.yaml`, which already merged cleanly.
- It does not give a hand-merged block to paste as the resolution, and does not offer pasting
  one as an equally good option. Showing what the regenerated file should contain, as a check
  after running the generator, is fine.
- It does not resolve the file by taking one side (`git checkout --ours` or `--theirs`,
  `git restore --ours` or `--theirs`, `-X ours` or `-X theirs`) as the final state. Taking a
  side only to clear the markers before running the generator is fine.

FAIL if the answer's resolution is a merged block to paste into the generated file, with or
without a later suggestion to run the generator, or if it takes one side and stops there.
