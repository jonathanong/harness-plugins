# Static checks for Rust

Add every row whose trigger is true, on top of the baseline in [SKILL.md](../SKILL.md).

| Trigger     | Tool                | Start from                                                                                                                                                                                                                           |
| ----------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Any Rust    | `cargo fmt`         | `cargo fmt --all -- --check`.                                                                                                                                                                                                        |
| Any Rust    | `cargo clippy`      | `cargo clippy --locked --workspace --all-targets --all-features -- -D warnings`. Drop `--locked` when `Cargo.lock` is not tracked. When features exclude each other, run once per supported combination instead of `--all-features`. |
| Any Rust    | `rustc`             | `RUSTFLAGS: "-D warnings"` in CI, so a compiler warning fails the build.                                                                                                                                                             |
| A workspace | `[workspace.lints]` | Declare lint levels once and set `[lints] workspace = true` in each crate. Worth enabling: `clippy::undocumented_unsafe_blocks`, `clippy::allow_attributes_without_reason`, `cargo::unused_dependencies`.                            |
| Any Rust    | a file-size check   | 200 lines per source file, 500 per test file, tests in their own files. Clippy has no such lint; use a graph checker rule or a small script.                                                                                         |
