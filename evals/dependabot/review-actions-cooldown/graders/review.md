---
type: llm
---

The `github-actions` entry has no cooldown. Under `pull_request`, a Dependabot bump of an action
runs that action in this repository's workflows before anyone reviews it, in a run that can read
the write-capable `AUTOMERGE_TOKEN`. A compromised action release could be bumped in on day one.

PASS if the review asks for a cooldown of at least seven days on the `github-actions` entry (for
example `cooldown: { default-days: 7 }`), and ties it to the write token or to bumped actions
running before review. Also asking for a two-stage design (credential-free `pull_request`, then a
trusted default-branch job that holds the token) is fine.

FAIL if the review does not ask for a cooldown on the `github-actions` entry, or treats the npm
cooldown as enough.
