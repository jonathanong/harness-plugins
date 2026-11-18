const GIT_GLOBAL_OPTIONS_RE = new RegExp(
  String.raw`\bgit(?:\s+(?:` +
    String.raw`-C\s+(?:"[^"]*"|'[^']*'|\S+)|` +
    String.raw`-c\s+(?!["']?[Cc][Oo][Rr][Ee]\.[Hh][Oo][Oo][Kk][Ss][Pp][Aa][Tt][Hh]\b)(?:"[^"]*"|'[^']*'|[^\s=]+(?:=(?:"[^"]*"|'[^']*'|\S+))?)|` +
    String.raw`--(?:git-dir|work-tree|namespace|exec-path)=[^\s]+|` +
    String.raw`--(?:no-pager|paginate|bare|no-replace-objects|version|help|html-path|man-path|info-path)|` +
    String.raw`-[vhpP]` +
    String.raw`))+`,
  'g',
)

const EDITOR_OVERRIDE_RE = /\s-c\s+(["']?)core\.editor=(["']?)true\2\1(?=\s|$)/i

/**
 * Collapse `git -C <path>` / other globals so banned-subcommand regexes still match. An editor
 * override of `true` survives as a `GIT_EDITOR=true` prefix, which is what it means to git.
 */
export function stripGitGlobalOptionsForPolicy(command: string): string {
  return command.replace(GIT_GLOBAL_OPTIONS_RE, (globals) =>
    EDITOR_OVERRIDE_RE.test(globals) ? 'GIT_EDITOR=true git' : 'git',
  )
}
