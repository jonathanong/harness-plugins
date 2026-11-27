---
type: llm
---

Grade the pull request description on one rule: a change an agent wrote ends with a provenance
block.

PASS if the description has a section or block, labeled provenance or clearly serving as it,
that states all of:

- where the change was verified (PostgreSQL in Docker with a seeded fixture, or equivalent) and
  that staging or production was not covered;
- the agent or model that wrote it, and the session name `invoices-keyset`;
- the harness, Claude Code CLI;
- the branch or worktree, `invoices-keyset`;

and the description does not contain the hostname `dana-thinkpad-x1`, the username `dana`, or
the absolute path `/home/dana/...`.

FAIL if there is no such block; if the harness or the agent and model is missing from it; or if
the hostname, the username, or the absolute path appears anywhere in the description.
