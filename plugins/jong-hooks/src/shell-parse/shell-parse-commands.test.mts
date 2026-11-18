import { describe, expect, it } from 'vitest'
import {
  commandsToInspectForGitPolicy,
  commandsToInspectPreservingQuotes,
  envPrefixSetsEditor,
  extractShellCommandArguments,
  isInteractiveRebaseContinue,
  shellCommandInheritsEditor,
  stripGitGlobalOptionsForPolicy,
  stripQuotedShellText,
} from './shell-commands.mts'
import {
  parseCommandPrefix,
  readCommandPrefix,
  withoutRedirections,
} from './shell-command-wrappers.mts'
import { heredocSpecsFromLine } from './shell-heredoc-parser.mts'
import { stripNonShellHeredocBodies } from './shell-heredoc.mts'
import { findShellScriptArguments, shellScriptOperandIndex } from './shell-script-operand.mts'
import { shellReadsStdinAt } from './shell-stdin-script.mts'
import { plainShellAssignment } from './shell-token-utils.mts'
import { stripUnquotedShellComments, tokenizeShellWords } from './shell-tokenizer.mts'

describe('shell parser edges', () => {
  it('walks wrapper options, compound commands, and trailing redirections', () => {
    expect(readCommandPrefix(['function', 'name', '{', 'git'])?.commandIndex).toBe(3)
    expect(readCommandPrefix(['coproc', 'name', '{', 'git'])?.commandIndex).toBe(3)
    expect(readCommandPrefix(['if', 'git'])?.commandIndex).toBe(1)
    expect(readCommandPrefix(['time', '!', 'git'])?.commandIndex).toBe(2)
    expect(withoutRedirections(['git', '>'])).toBeNull()
    expect(parseCommandPrefix(['env', '--chdir=/tmp', '--', 'git'])).toBeNull()
    expect(readCommandPrefix(['/usr/bin/env', '-i', 'git'])?.prefix.wrappers).toEqual(['env'])
    expect(readCommandPrefix(['exec', '-a', 'name', 'git'])?.commandIndex).toBe(3)
    expect(readCommandPrefix(['command', '-p', 'git'])?.commandIndex).toBe(2)
    expect(readCommandPrefix(['builtin', 'git'])?.commandIndex).toBe(1)
  })

  it('covers git inspection, editors, and quoted shell scripts', () => {
    expect(stripGitGlobalOptionsForPolicy('git --no-pager -C /tmp status')).toBe('git status')
    expect(stripGitGlobalOptionsForPolicy('git -c core.hooksPath=/tmp status')).toContain(
      'core.hooksPath',
    )
    expect(stripGitGlobalOptionsForPolicy('git -c core.hookspath=/dev/null commit')).toContain(
      'hookspath',
    )
    expect(stripGitGlobalOptionsForPolicy('git -c "core.hooksPath=/dev/null" commit')).toContain(
      'hooksPath',
    )
    expect(stripQuotedShellText("echo 'C:\\' && git push --force")).toContain('git push --force')
    expect(heredocSpecsFromLine('echo hi;# <<EOF')).toEqual([])
    expect(
      stripNonShellHeredocBodies("cat <<'EOF'\nfoo\\\nEOF\ngit push --force").textWithoutBodies,
    ).toContain('git push --force')
    expect(
      stripNonShellHeredocBodies('git commit -m "msg\n<<EOF\n"\ngit push --force\nEOF')
        .textWithoutBodies,
    ).toContain('git push --force')
    expect(tokenizeShellWords("'a\\\nb'")).toEqual(['a\\\nb'])
    const sudo = tokenizeShellWords('sudo bash <<EOF', { splitRedirections: true })
    expect(shellReadsStdinAt(sudo, sudo.indexOf('<<'))).toBe(true)
    const xargs = tokenizeShellWords('cat <<EOF | xargs -0 sh', { splitRedirections: true })
    expect(shellReadsStdinAt(xargs, xargs.indexOf('<<'))).toBe(true)
    expect(plainShellAssignment('FOO+=1')).toBeNull()
    expect(plainShellAssignment('FOO[0]=1')).toBeNull()
    expect(
      shellCommandInheritsEditor("unset GIT_EDITOR; export GIT_EDITOR=false; bash -c 'x'", 48),
    ).toBe(false)
    expect(envPrefixSetsEditor('env GIT_EDITOR=true')).toBe(true)
    expect(envPrefixSetsEditor('')).toBe(false)
    expect(isInteractiveRebaseContinue('export GIT_EDITOR=true; git rebase --continue')).toBe(false)
    expect(isInteractiveRebaseContinue('unset GIT_EDITOR; git rebase --continue')).toBe(true)
    expect(isInteractiveRebaseContinue('')).toBe(false)
    expect(extractShellCommandArguments('bash -c echo\\ hi')[0]?.command).toBe('echo hi')
    expect(findShellScriptArguments('bash --rcfile /tmp/rc -c "echo \\"hi\\""')[0]?.script).toBe(
      'echo "hi"',
    )
    expect(shellScriptOperandIndex(['bash', '--rcfile', '/tmp/rc', '-c', 'echo'], 0)).toBe(4)
    expect(shellScriptOperandIndex(['bash', '-euo', 'pipefail', 'script.sh'], 0)).toBeUndefined()
    expect(findShellScriptArguments("bash -c $'echo hi'")[0]?.script).toBe('echo hi')
    const inspected = commandsToInspectPreservingQuotes(
      "bash <<'EOF'\necho $(echo nested)\nEOF\ngit commit -m 'keep'",
    )
    expect(inspected.some((command) => command.includes('nested'))).toBe(true)
    expect(commandsToInspectForGitPolicy("git commit -m 'keep'").join('\n')).not.toContain("'")
    expect(stripQuotedShellText('echo \\"a\\"')).toContain('\\')
  })

  it('decides when a pipeline or compound command may read stdin', () => {
    const pipeline = tokenizeShellWords('cat <<EOF | bash', { splitRedirections: true })
    const operator = pipeline.findIndex((token) => token === '<<')
    expect(shellReadsStdinAt(pipeline, operator)).toBe(true)
    const open = tokenizeShellWords('{ bash; } <<EOF', { splitRedirections: true })
    expect(
      shellReadsStdinAt(
        open,
        open.findIndex((token) => token === '<<'),
      ),
    ).toBe(true)
    const expanded = tokenizeShellWords('$SHELL <<EOF', { splitRedirections: true })
    expect(
      shellReadsStdinAt(
        expanded,
        expanded.findIndex((token) => token === '<<'),
      ),
    ).toBe(true)
    expect(stripUnquotedShellComments("echo $'a#b' # tail")).toContain("$'a#b'")
    expect(tokenizeShellWords('echo >out', { splitRedirections: true })).toContain('>')
  })
})
