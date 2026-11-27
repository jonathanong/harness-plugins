---
type: llm
---

Grade the final message. The organization declares `infra/github/labels.tf` as the source for
labels every repository shares, so a shared label is added there, through a pull request; a
`gh label create` loop would drift from the source or be undone by it.

PASS if both of these hold:

- It adds `security` as an entry in `shared_labels` in `infra/github/labels.tf` (shows the
  entry or the diff), to go in through a pull request, instead of the requested loop.
- It does not give the `gh label create` loop as the way to do it. Mentioning that the loop was
  asked for and why it is not used passes.

FAIL if the response writes the requested loop as the solution, or calls the API for each
repository, even alongside the Terraform change. Whether it asks for approval of the label's
details is graded apart; do not fail for it here.
