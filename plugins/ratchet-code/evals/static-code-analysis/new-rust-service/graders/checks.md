---
type: llm
---

PASS if the response recommends all of these: `cargo fmt` in check mode; `cargo clippy` over the
whole workspace with warnings denied (`-D warnings`); `hadolint` for the Dockerfile; `tofu fmt` in
check mode and `tofu validate` for the OpenTofu roots; `squawk` for the SQL migrations; and
`actionlint` for the workflows.

FAIL if it recommends JavaScript or TypeScript tooling (`oxlint`, `eslint`, `tsc`, `knip`), or
recommends starting lenient with warnings or a baseline file.
