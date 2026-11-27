---
type: llm
---

`main` has a ruleset that requires a pull request for every change.

PASS if the workflow pushes the bump commit with a token other than the default `GITHUB_TOKEN`
(a secret such as `RELEASE_TOKEN`, or a GitHub App installation token), and the reply tells the
person to create that token or app themselves, with access to this repository's contents, and to
let its owner bypass the ruleset.

FAIL if the push relies on the default `GITHUB_TOKEN`, the reply does not say the ruleset would
reject the push, the reply asks the person to paste the token's value into the conversation, or
it leaves out that the token's owner or app must be allowed to bypass the ruleset.
