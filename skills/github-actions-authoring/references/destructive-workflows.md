# Destructive workflows

Read before the first push of a `workflow_dispatch` workflow that resets a database, promotes or
rolls back production, unlocks state, or forces infrastructure recovery. A stricter repository rule
wins.

- Require typed confirmation for an irreversible or wide action. The phrase names the exact target
  and action. Offer no free-form environment input when only one environment is valid.
- Bind the workflow to its target twice: in YAML (the environment gate, the resource names) and in
  the script, before any destructive statement runs.
- Serialize with every workflow that touches the same state. Reuse its concurrency group, and keep
  `cancel-in-progress: false` where cancelling could strand state. A shared group still
  replaces a pending run with a newer one; the [workflow baseline](workflow-baseline.md) says
  how to keep every pending run.
- Capture the original state before mutating, pause dependent services, and restore only from the
  captured values. Do not restore while an unfinished destructive task may still be running.
- Trap cleanup around launched tasks and partial mutations. Stop unfinished work, wait until it has
  stopped, print diagnostics, and fail closed when the stop cannot be proven.
- Print the provider's logs on success and on the failure path, so a finished run can be audited
  without running it again.
- Move more than a couple of shell functions into a tracked, tested script. YAML keeps
  orchestration, permissions, inputs, and step wiring.
- Test the lifecycle: select named steps, inspect their `if:` expressions, and assert the critical
  commands in order, not whole-file string containment.
