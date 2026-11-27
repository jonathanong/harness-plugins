---
name: static-code-analysis
description: Use when creating a new repository, adding a language or toolchain to one, or auditing which static checks a repository is missing. Choose and wire up static code analysis for a repository - which linters, formatters, type checks, dead-code, dependency, workflow, secret, and infrastructure checks to add, with the settings to start from.
---

# Static code analysis

Pick the checks a repository needs from what it contains, then wire them so they fail the build.
Read every applicable `AGENTS.md` first. Repository-local policy owns tool versions, thresholds,
runner labels, and exceptions, and overrides these defaults.

A new repository has zero findings, so every check starts at its strictest setting for free. Adding
the same check later means a cleanup or a baseline file. Add each check when the thing it inspects
first appears, not when it first causes a problem.

## Choose the checks

1. Inventory what is tracked: languages, package manifests, workflows, shell scripts, Dockerfiles,
   infrastructure roots, migrations, and docs.
2. Add the baseline, then every row below whose trigger is true. Skip a row whose trigger is false;
   a tool with nothing to inspect is noise.
3. Search for an existing owner before adding a tool. Do not run two tools that report the same
   finding.

## Baseline for every repository

| Check                 | Tool                               | Start from                                                                                                                                                     |
| --------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting            | the language formatter             | Check mode in CI (`--check`), never a rewrite. Covers Markdown, JSON, YAML.                                                                                    |
| Workflow syntax       | `actionlint`                       | Every push that touches `.github/workflows`. It runs `shellcheck` on Bash and sh `run:` steps only when `shellcheck` is installed, so install it in that job.  |
| Workflow security     | `zizmor`                           | `--min-severity high --min-confidence high`. Add with the first workflow that holds a secret or a write permission.                                            |
| Committed secrets     | `gitleaks`                         | Default rules, on every push and over history once. Allowlist one finding by fingerprint, or a path together with the rule, with a reason. Never a whole path. |
| File size             | the linter's own rule              | 200 lines per source file, 500 per test file. Keep tests in separate files.                                                                                    |
| File complexity       | `scc --by-file`                    | Fail any source file whose complexity is over 50. Exclude tests and fixtures. One tool covers every language, unlike a per-function linter rule.               |
| Licenses              | the package manager's license list | Deny strong copyleft (GPL, AGPL, SSPL) and unknown licenses; fail closed on an expression it cannot parse. Allow an exception per package, with a reason.      |
| Known vulnerabilities | `osv-scanner`                      | Scan every lockfile. The dependency bot's alerts do not fail a build; this does.                                                                               |

## By what the repository contains

The baseline is not the whole answer for any language. Before choosing, read the reference for
each thing the repository contains; each lists the tools, the trigger for each, and the settings
to start from.

- JavaScript or TypeScript, including React, a workspace, a package published to npm, or browser
  tests: [references/javascript-typescript.md](references/javascript-typescript.md).
- Rust: [references/rust.md](references/rust.md).
- Shell scripts, a Dockerfile or container image, OpenTofu or Terraform, SQL migrations, Swift,
  .NET, Python, Go, Lua, docs with links, public prose, or conventional commit messages:
  [references/other-languages.md](references/other-languages.md).

## Add a custom rule only for a repeated mistake

When review catches the same mistake twice, encode it. Pick the narrowest owner that can express
it, in this order:

1. A built-in rule or option of a linter already in use, such as `no-restricted-imports`.
2. A syntactic pattern rule, such as `ast-grep`, for a shape inside one file.
3. A graph rule, for anything that depends on other files.
4. A test that parses a structured file, such as workflow YAML, and asserts the policy. Parse the
   format. Do not match text.

Write accepted and rejected fixtures before the rule. Keep every suppression and allowlist narrow,
give it a reason, and delete it when the reason is gone.

## Wire them in

- Give every check a package script or task, and one aggregate `lint` command that runs them all.
  CI runs the same commands a developer runs.
- Run the static checks as their own CI job, required for merge. Order by cost: format and lint
  first, type checks next, whole-repository analyzers last.
- Warnings are errors. A check that only warns is not read.
- Pin tool versions in the manifest or the tool-version file, and let the dependency bot update
  them. Group a toolchain that releases together, such as `oxlint` and `oxfmt`.
- Do not start with a baseline or ignore file in a new repository. Fix the finding or change the
  rule.
- A pre-push hook may run the fast checks. CI stays the gate.

## Validate

- Introduce one violation per check and confirm that the aggregate command and the CI job fail.
- Confirm each tool discovers the files you expect. A glob that matches nothing passes silently.
- Record the chosen checks and any exception in the repository's contributor docs.
