---
type: llm
---

PASS if the response recommends all of these: `oxlint` with warnings treated as errors; a formatter
run in check mode (`oxfmt --check`); a `tsc` type check with `strict` plus at least one stricter
flag such as `noUncheckedIndexedAccess` or `exactOptionalPropertyTypes`; `actionlint` for the
workflows; `shellcheck` for the shell scripts; and a file-size limit of about 200 lines per source
file. It must say the checks start strict, or fail CI, from the first commit.

FAIL if it recommends a tool for something this repository does not contain (for example `clippy`,
`hadolint`, `tofu`, `swiftlint`, or `squawk`), recommends starting lenient with warnings or a
baseline file, or makes ESLint with Prettier its primary recommendation.
