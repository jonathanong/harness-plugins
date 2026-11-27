---
name: rust-authoring
description: Use when writing or reviewing Rust code or tests, including a Node.js addon built on N-API, adding a cache, or running cargo build, test, or coverage jobs, especially from several agents or worktrees at once. Lay out Rust tests and caches, and run heavy cargo builds without exhausting a shared machine.
---

# Rust authoring

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults. For
lints and their settings, use `static-code-analysis`.

## Tests

Keep tests in separate files, not in a `#[cfg(test)] mod tests` block at the bottom of the source
file. Use the crate's `tests/` directory for tests of the public API, and a sibling file
(`foo/tests.rs`, declared with `#[cfg(test)] mod tests;`) for tests that need private items.
Source files stay short enough to read, and a change to a test does not show up as a change to
the code it tests.

## Caches

Cache in memory for the length of one run. Do not persist a cache between runs unless the design
calls for it and says how the cache is keyed, invalidated, and versioned. A persisted cache makes
a result depend on what ran before, and a stale entry looks like a logic bug.

## Node.js addons (N-API)

Every call from JavaScript into an addon crosses the N-API boundary, and that crossing costs
more than most of the work inside a small function.

- Take and return `Buffer`s, not strings. A string is converted between JavaScript's encoding
  and UTF-8 and copied on every crossing; a `Buffer` hands over the bytes.
- Make any call that does real work async: run it on the libuv thread pool (an `AsyncTask` in
  napi-rs) and return a promise. A synchronous call blocks the event loop for its whole length.
- Batch: take a list of items in one call rather than one call per item, so the crossing is paid
  once.

## Heavy builds on a shared machine

A cargo build uses every core and several gigabytes per target directory.

- Do not run several heavy cargo or coverage jobs at once on one machine. Run them one after
  another, or cap each with `--jobs` or `CARGO_BUILD_JOBS`.
- Prefer CI for the full matrix and for coverage. Push early and let it run, and keep local runs
  to the crate and tests being changed.
- Each worktree has its own `target/` directory. Delete the `target/` of a throwaway worktree or
  temporary clone when the work is done; a few of them fill a disk.
