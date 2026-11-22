---
type: llm
---

PASS if the npm ecosystem is configured with a single entry whose `directory` is the repository root
(`/`), the directory that owns `pnpm-lock.yaml`, and the response says or implies that workspace
packages are covered from there. A separate `github-actions` entry is expected.

FAIL if it lists one `npm` entry per workspace package (`/apps/web`, `/apps/api`, ...), or for the
root plus each package.
