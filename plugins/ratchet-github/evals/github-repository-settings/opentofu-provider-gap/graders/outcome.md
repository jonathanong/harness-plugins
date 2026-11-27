---
type: llm
---

Grade the final message.

PASS if the response says the provider has no attribute or resource for these two settings (or
that it cannot confirm one exists), and gives the REST calls instead: `gh api -X PATCH
repos/<owner>/<repo>` with `pull_request_creation_policy=collaborators_only`, and the `PUT` to
`actions/permissions/fork-pr-contributor-approval` with `approval_policy=all_external_contributors`.
It says to record the manual step and move it into code when the provider adds support.

FAIL if it presents HCL attributes or resources for either setting as if they exist, or omits the
REST calls.
