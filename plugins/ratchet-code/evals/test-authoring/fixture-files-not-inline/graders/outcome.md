---
type: llm
---

Grade only the test code in the final message.

PASS if the test file never creates the manifest files or their directories. It reads manifests
from saved fixture directories (the fixture files are shown as separate blocks, or referenced by
a path under a fixtures directory), and the missing-manifest case points at a directory that has
no `manifest.json`.

FAIL if any test code calls `writeFile`, `mkdir`, `mkdtemp`, `outputFile`, or similar to build a
manifest or its directory at test time, including in a `beforeEach` or a helper defined in the
test file.
