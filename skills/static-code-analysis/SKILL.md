---
name: static-code-analysis
description: Choose and wire up static code analysis for a repository - which linters, formatters, type checks, dead-code, dependency, workflow, secret, and infrastructure checks to add, with the settings to start from. Use when creating a new repository, adding a language or toolchain to one, or auditing which static checks a repository is missing.
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

### JavaScript and TypeScript

| Trigger                                      | Tool                       | Start from                                                                                                                                                                                                                                                                                  |
| -------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Any JavaScript or TypeScript                 | `oxlint`                   | `--deny-warnings`. Categories `correctness`, `suspicious`, and `perf` as errors. `max-lines` 200, with a 500 override for test files. Enable the plugin for each framework in use: `typescript`, `import`, `node`, `promise`, `unicorn`, `vitest` or `jest`, `react`, `nextjs`, `jsx-a11y`. |
| Any JavaScript or TypeScript                 | `oxfmt`                    | `oxfmt --check` in CI.                                                                                                                                                                                                                                                                      |
| TypeScript                                   | `tsc --noEmit`             | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `isolatedModules`, `verbatimModuleSyntax`, `erasableSyntaxOnly`. Type-check tests and scripts too.     |
| TypeScript                                   | `oxlint --type-aware`      | Adds rules that need types, such as unawaited promises.                                                                                                                                                                                                                                     |
| More than a handful of modules               | `knip`                     | Unused files, exports, and dependencies. Run it twice: default, and `--production` to find code only tests use. Model entry points in its config instead of tagging exports.                                                                                                                |
| Two or more packages or layers               | `dependency-cruiser`       | `no-circular` as an error, plus one rule per boundary that must hold, such as "shared code does not import an app".                                                                                                                                                                         |
| A workspace with several `package.json`      | `syncpack`                 | One version of each dependency across the workspace.                                                                                                                                                                                                                                        |
| A pnpm lockfile                              | `pnpm dedupe --check`      | Fails when the lockfile holds duplicates that can be collapsed. Other package managers have their own check, such as `yarn dedupe --check`.                                                                                                                                                 |
| A codebase past its first few thousand lines | `jscpd`                    | Copy-paste detection. Start near 50 lines and 0.8 similarity.                                                                                                                                                                                                                               |
| React                                        | oxlint JS plugins          | `oxlint-plugin-react-doctor` for security and performance rules, and `eslint-plugin-react-you-might-not-need-an-effect` for effects that should be derived state or event handlers.                                                                                                         |
| A package published to npm                   | `publint`, `attw`          | `publint` checks `package.json` fields against the files shipped; `@arethetypeswrong/cli` checks that the types resolve in each module format. Run both on the packed tarball.                                                                                                              |
| Browser tests                                | the Playwright lint plugin | Missing awaits, hard waits, and focused tests.                                                                                                                                                                                                                                              |

Cross-file rules that no per-file linter can express (who imports this, is this export reachable
from an entry point, does each source file have a test) belong to a graph-based checker such as
`no-mistakes`, not to a text search.

### Rust

| Trigger     | Tool                | Start from                                                                                                                                                                                                                           |
| ----------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Any Rust    | `cargo fmt`         | `cargo fmt --all -- --check`.                                                                                                                                                                                                        |
| Any Rust    | `cargo clippy`      | `cargo clippy --locked --workspace --all-targets --all-features -- -D warnings`. Drop `--locked` when `Cargo.lock` is not tracked. When features exclude each other, run once per supported combination instead of `--all-features`. |
| Any Rust    | `rustc`             | `RUSTFLAGS: "-D warnings"` in CI, so a compiler warning fails the build.                                                                                                                                                             |
| A workspace | `[workspace.lints]` | Declare lint levels once and set `[lints] workspace = true` in each crate. Worth enabling: `clippy::undocumented_unsafe_blocks`, `clippy::allow_attributes_without_reason`, `cargo::unused_dependencies`.                            |
| Any Rust    | a file-size check   | 200 lines per source file, 500 per test file, tests in their own files. Clippy has no such lint; use a graph checker rule or a small script.                                                                                         |

### Other languages and files

| Trigger                       | Tool                                    | Start from                                                                                                                                                                                  |
| ----------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell scripts                 | `shellcheck`                            | Every tracked `*.sh`. Put `shell=bash` and source paths in `.shellcheckrc`.                                                                                                                 |
| A Dockerfile                  | `hadolint`                              | Default rules. Ignore a rule in `.hadolint.yaml` with a reason, not inline.                                                                                                                 |
| A built container image       | `trivy`                                 | Scan the image in the build workflow. Keep ignores in a tracked file with an expiry.                                                                                                        |
| OpenTofu or Terraform         | `tofu fmt`, `tofu validate`             | `tofu fmt -check -recursive`, then `tofu init -backend=false` and `tofu validate` per root. Run them before any cloud credential is granted to the job.                                     |
| SQL migrations for PostgreSQL | `squawk`                                | Set the server version. Exclude a rule only with a written reason.                                                                                                                          |
| Swift                         | `swiftformat`, `swiftlint`, `periphery` | `file_length` 200 warning and 250 error, `function_body_length` 50 and 80. `periphery` finds unused code.                                                                                   |
| .NET                          | `dotnet format`, analyzers              | `dotnet format --verify-no-changes`. `TreatWarningsAsErrors` and `AnalysisMode` `AllEnabledByDefault` in `Directory.Build.props`, plus an analyzer package such as Meziantou or Roslynator. |
| Python                        | `ruff`, `pyright`                       | `ruff check` and `ruff format --check`. `pyright` in strict mode.                                                                                                                           |
| Go                            | `gofmt`, `golangci-lint`                | `gofmt -l` must print nothing. `golangci-lint run` with its default linters plus `gocyclo`.                                                                                                 |
| Lua                           | `selene`                                | Declare the standard library in `selene.toml`.                                                                                                                                              |
| Docs with links               | `lychee`                                | Offline mode for relative links on every push. Check external links on a schedule, because they fail for reasons outside the change.                                                        |
| Public prose                  | `cspell`                                | README and docs only. Keep the word list in the repository.                                                                                                                                 |
| Conventional commit messages  | `commitlint`                            | Only when a release tool reads the commit history.                                                                                                                                          |

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
