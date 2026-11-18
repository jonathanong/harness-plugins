import { describe, expect, it } from 'vitest'
import { tokenizeShellWords } from '../shell-parse/index.mts'
import { commandCwd } from './index.mts'

const words = (text: string) => tokenizeShellWords(text, { splitRedirections: true })

describe('commandCwd', () => {
  const cwdOf = (text: string, base = '/base') => {
    const tokens = words(text)
    return commandCwd(tokens, tokens.lastIndexOf('gh'), base)
  }

  it('follows sequential cd builtins', () => {
    expect(cwdOf('gh pr view')).toBe('/base')
    expect(cwdOf('cd sub && gh pr view')).toBe('/base/sub')
    expect(cwdOf('cd /abs; gh pr view')).toBe('/abs')
    expect(cwdOf('cd a && cd ../b && gh pr view')).toBe('/base/b')
    expect(cwdOf('cd -- sub && gh pr view')).toBe('/base/sub')
    expect(cwdOf('cd -L sub && gh pr view')).toBe('/base/sub')
    expect(cwdOf('builtin cd sub && gh pr view')).toBe('/base/sub')
  })

  it('treats unknowable directories as unknown', () => {
    expect(cwdOf('cd "$X" && gh pr view')).toBeUndefined()
    expect(cwdOf('cd ~ && gh pr view')).toBeUndefined()
    expect(cwdOf('cd - && gh pr view')).toBeUndefined()
    expect(cwdOf('cd -P sub && gh pr view')).toBeUndefined()
    expect(cwdOf('cd a b && gh pr view')).toBeUndefined()
    expect(cwdOf('cd && gh pr view')).toBeUndefined()
    expect(cwdOf('cd x gh pr view')).toBe('/base')
    expect(cwdOf('cd x gh pr view && true')).toBe('/base')
    expect(cwdOf('cd x & gh pr view')).toBe('/base')
    expect(cwdOf('cd "$X" && cd rel && gh pr view')).toBeUndefined()
    expect(cwdOf('cd x || gh pr view')).toBeUndefined()
    expect(cwdOf('true || cd x && gh pr view')).toBeUndefined()
    expect(cwdOf('if true; then cd x; fi; gh pr view')).toBeUndefined()
    expect(cwdOf('cd a && cd "$X" && gh pr view', '/base')).toBeUndefined()
  })

  it('ignores cd that cannot change the shell directory', () => {
    expect(cwdOf('echo | cd x && gh pr view')).toBe('/base')
    expect(cwdOf('sudo cd x && gh pr view')).toBe('/base')
    expect(cwdOf('cd x &')).toBe('/base')
  })

  it('scopes cd to subshells and skips function bodies', () => {
    expect(cwdOf('(cd sub && true); gh pr view')).toBe('/base')
    expect(cwdOf('(cd sub && gh pr view)')).toBe('/base/sub')
    expect(cwdOf('f() { cd sub; }; gh pr view')).toBe('/base')
    expect(cwdOf('function f { cd sub; }; gh pr view')).toBe('/base')
    expect(cwdOf('{ cd sub; }; gh pr view')).toBe('/base/sub')
    expect(cwdOf('f() { { true; }; cd /tmp; }; gh pr view')).toBe('/base')
    expect(cwdOf(') gh pr view')).toBe('/base')
    expect(cwdOf('} gh pr view')).toBe('/base')
  })

  it('applies env -C to the invocation', () => {
    expect(cwdOf('env -C /abs gh pr view')).toBe('/abs')
    expect(cwdOf('env -C rel gh pr view')).toBe('/base/rel')
    expect(cwdOf('cd "$X" && env -C rel gh pr view')).toBeUndefined()
    expect(cwdOf('cd "$X" && env -C /abs gh pr view')).toBe('/abs')
    expect(cwdOf('env -C "$D" gh pr view')).toBeUndefined()
  })
})
