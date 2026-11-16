---
name: feature-rollout
description: Ship new behavior behind a flag that starts off, treat deploying and enabling as separate steps, and add no table or service that no entry point reaches. Use when adding or reviewing a feature flag, a flag's default, rollout or rollback steps, or a change that adds a table, migration, service, or write path.
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

## Reachable from an entry point

Do not add a table, a service, or a write path that no entry point reaches. Build the entry
point in the same change: an API route, an MCP tool, a CLI command, or a job.

- An entry point is registered: the route is mounted, the tool is listed, the job is scheduled. A
  handler that nothing mounts does not count, and neither does a test.
- Test the new code through the entry point, so the test covers the registration too.
- An entry point that nothing calls yet is fine. An API with no page that uses it is reachable;
  a service with no route is not.
- When the entry point must not be used yet, put it behind a flag that starts off. The flag is
  for that case only; a route that is safe to call needs none.

Code that nothing reaches cannot run in production, so its schema and its interface are guesses
about a caller that does not exist yet, and a review cannot check them against real use. Ship
one thin path from entry point to table instead of the schema first and the callers later.

## Scope of a flag

- State what the flag gates and what it does not. A migration, a new column, a changed job
  schedule, or a client release is usually outside the flag and takes effect on deploy.
- Test both states while the flag exists.
- Remove the flag and the old path once the behavior is fully on and stable. Record who removes
  it and when at the time the flag is added.
