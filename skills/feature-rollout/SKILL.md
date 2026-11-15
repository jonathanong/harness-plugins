---
name: feature-rollout
description: Ship new behavior behind a flag that starts off, and treat deploying and enabling as separate steps. Use when adding or reviewing a feature flag, choosing a flag's default, planning how a change reaches users, or writing rollout and rollback steps.
---

# Feature rollout

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Deploying code and turning behavior on are two decisions. Keep them apart so each can be made,
watched, and undone alone.

## Defaults

- A new flag ships with the new behavior off. Merging and deploying then change nothing for
  users, and a bad deploy is not also a behavior change.
- The exception is a security or data-integrity fix. There the flag defaults to the safe
  behavior, and the flag exists only to turn the fix off if it misfires.
- A missing or unreadable flag value resolves to the same default as an unset one. Do not let a
  flag-service outage turn a feature on.

## Deployed is not active

- Ship dark, confirm the deploy is healthy, then enable. Enable for a small scope first when the
  flag system allows it.
- Say "deployed" and "enabled" as separate states in pull requests, release notes, and status
  updates. "Shipped" for code that is merged but off misleads whoever reads it.
- The rollback for a behavior problem is turning the flag off. Check before enabling that off
  still works: the old path is still present and still tested.

## Scope of a flag

- State what the flag gates and what it does not. A migration, a new column, a changed job
  schedule, or a client release is usually outside the flag and takes effect on deploy.
- Test both states while the flag exists.
- Remove the flag and the old path once the behavior is fully on and stable. Record who removes
  it and when at the time the flag is added.
