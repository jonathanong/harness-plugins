---
name: lint-rule-authoring
description: Use when writing or reviewing the code of a lint rule, analyzer, or codemod that walks a syntax tree, such as an ESLint or oxlint rule, a Clippy lint, or a custom AST check, including a request to "write a rule that bans X". Covers finding the rule's subject by what a name is bound to, reporting a name it cannot trace, and the fixtures that prove both.
---

# Lint rule authoring

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

This skill is for the code inside a rule that walks a syntax tree. For where a check lives in a
repository, which files it scans, and how it is wired into CI, use
[static-analysis-checklist](../static-analysis-checklist/SKILL.md).

## Find the subject by what the name is bound to

- A rule about a library's function, type, or object finds it by what the name is bound to, not
  by how the name is spelled. Resolve the name through the tool's scope analysis to its
  declaration or import. A match on the identifier's spelling or on source text fires on an
  unrelated thing of the same name and misses a rename.
- Follow the indirect ways code reaches the subject: an alias, a re-export, a namespace import,
  and a local wrapper or factory that returns it.

## A name the rule cannot trace is unknown, not clean

Every name the rule looks at ends in one of three results:

| The name is bound to                                      | The rule                        |
| --------------------------------------------------------- | ------------------------------- |
| The subject                                               | Reports the violation.          |
| Something else it traced, such as another library         | Stays quiet.                    |
| Something it cannot trace, such as an unread local module | Reports that it could not tell. |

- The third row is the one that gets left out. A rule that reads one file cannot see what a
  local module exports, so an import from it is unknown. The rule reports there: either the
  violation, or that it could not tell what the name is bound to. A rule that stays silent
  reads as a clean result, and nobody learns the file was never checked.
- This holds when the rule must stay quiet on other things of the same name: stay quiet on a
  name traced to something else, and report a name that could not be traced.
- An option that lists extra modules does not replace the report, and neither does a note in
  the documentation. An unlisted module then passes with no report.

## Fixtures

- Add a rejected fixture for each indirect form the rule follows, and an accepted fixture for a
  same-named thing it must leave alone.
- Pin the unknown case with a fixture: a name the rule cannot trace, and the report it gives.
