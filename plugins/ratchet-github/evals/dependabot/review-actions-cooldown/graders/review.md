---
type: llm
---

Under `pull_request`, a Dependabot bump runs the bumped package, action, or image in this
repository's workflows before anyone reviews it, in a run that can read the write-capable
`AUTOMERGE_TOKEN`. A compromised release is usually pulled within days, so every update has to
wait at least seven days. Here, patch updates wait only two days (npm) and one day
(`github-actions`), and the `docker` entry has no cooldown at all.

PASS if the review asks for both:

- a cooldown on the `docker` entry of at least seven days;
- `semver-patch-days` of at least seven (or removing the key so `default-days: 7` applies) on the
  `github-actions` entry, and on the npm entry.

Also asking for a two-stage design (credential-free `pull_request`, then a trusted default-branch
job that holds the token) is fine.

FAIL if the review accepts the short patch delay on either entry, or does not ask for a cooldown
on the `docker` entry.
