import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const read = (path: string) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), 'utf8'))

describe('Codex plugin wiring', () => {
  it('points the manifest at a hooks file that runs the engine as the codex harness', () => {
    const manifest = read('.codex-plugin/plugin.json')
    expect(manifest.hooks).toBe('./hooks/codex-hooks.json')
    const hooks = read(manifest.hooks).hooks
    expect(Object.keys(hooks)).toEqual(['PreToolUse', 'PostToolUse'])
    for (const [event, flag] of [
      ['PreToolUse', 'pre-tool-use'],
      ['PostToolUse', 'post-tool-use'],
    ] as const) {
      const group = hooks[event][0]
      expect(group.matcher).toBe('Bash|apply_patch')
      expect(group.hooks[0].command).toContain('${PLUGIN_ROOT}/bin/hook.mts')
      expect(group.hooks[0].command).toContain(`${flag} --harness codex`)
    }
  })

  it('keeps the Claude hooks file on the claude harness', () => {
    const text = JSON.stringify(read('hooks/hooks.json'))
    expect(text).toContain('--harness claude')
    expect(text).not.toContain('--harness codex')
  })
})
