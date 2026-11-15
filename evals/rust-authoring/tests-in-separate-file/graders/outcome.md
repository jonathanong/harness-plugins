---
type: llm
---

PASS if the tests are placed in a separate file from `src/parser.rs` (for example
`src/parser/tests.rs` declared from the source with `#[cfg(test)] mod tests;`, or a `#[path]`
attribute pointing at a test file), so that the test bodies are not in `src/parser.rs`.

FAIL if the test functions are written inside an inline `#[cfg(test)] mod tests { ... }` block in
`src/parser.rs`, or if the function is made `pub` only so an integration test can reach it.
