# Persistent runner workspaces

An ephemeral hosted runner starts from a clean workspace and needs no cleanup step. These rules
apply only when a job runs on a self-hosted or otherwise persistent runner.

- A persistent workspace checks out the full tree. Do not configure sparse checkout. Enforce that
  with a YAML-aware check over the tracked workflow and action files, with accepted and rejected
  fixtures.
- Fix workspace ownership at the producer. A writable workspace bind mount uses a non-root identity
  whose ownership and write access match the runner workspace.
- Do not add an unconditional pre-checkout workspace-wide permission or ownership traversal.
- Migrate a contaminated workspace once, while the runner is drained.
- Routine repair may cover bounded known generated paths. A workspace-wide fallback must be
  failure-gated, same-filesystem, directory-only, and batched, and must record path count and
  timing.
- Moving a job from a persistent runner to a hosted one drops every piece of runner-local state the
  job assumed: browser installs, package-manager stores, build directories, preinstalled packages,
  and warm image stores. Replace each assumption with a keyed cache step, and re-derive
  `timeout-minutes` from a real passing run on the new runner.
