---
type: llm
---

PASS if the response does all of these:

- Sets the repository's `pull_request_creation_policy` to `collaborators_only` with
  `gh api -X PATCH repos/<owner>/<repo>`.
- Sets the Actions fork pull request approval policy to `all_external_contributors` through the
  `actions/permissions/fork-pr-contributor-approval` endpoint.
- Says to confirm afterwards that Dependabot can still open pull requests, or says that it is not
  documented whether Dependabot counts as a collaborator.

FAIL if it is missing any of those, or if it recommends `has_pull_requests=false`, interaction
limits, or a branch protection rule as the way to stop outside pull requests.
