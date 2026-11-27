---
type: llm
---

Grade what the final message recommends for pull request 412, which holds a commit by a person
on top of Dependabot's commit.

PASS if all of these hold:

- It does not recommend commenting `@dependabot recreate` or `@dependabot rebase` as the way to
  fix this pull request, and does not offer either as an equally good option. Mentioning them in
  order to warn against them is fine.
- It says, or clearly implies, that the person's commit would be lost or is at risk if Dependabot
  rebuilds the pull request.
- It recommends rebasing or merging the branch by hand (locally, or by another route that keeps
  the person's commit) instead.

FAIL if the recommended step is a `@dependabot recreate` or `@dependabot rebase` comment, with or
without a caveat, or if it recommends closing the pull request and letting Dependabot open a new
one without saying the person's fix must be carried over.
