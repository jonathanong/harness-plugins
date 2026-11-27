---
description: Tests that need files on disk read saved fixture files and do not create them in the test body.
tags: [test-authoring, skill-fired, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

write vitest tests for readManifest. happy path, a manifest where one entry has no name, and no manifest.json in the dir.

```ts
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export type ManifestResult = { names: string[]; skipped: number }

export async function readManifest(dir: string): Promise<ManifestResult> {
  let raw: string
  try {
    raw = await readFile(join(dir, 'manifest.json'), 'utf8')
  } catch {
    return { names: [], skipped: 0 }
  }
  const entries = JSON.parse(raw).entries as Array<{ name?: string }>
  const names = entries.flatMap((e) => (e.name ? [e.name] : []))
  return { names, skipped: entries.length - names.length }
}
```

Reply in your message; you don't need to create files.
