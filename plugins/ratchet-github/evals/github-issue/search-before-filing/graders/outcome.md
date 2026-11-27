---
type: llm
---

Grade the final message.

PASS if all of these hold:

- A search of existing issues in `acme/reports` comes before the create command, and the response
  says to stop or reuse the existing issue if a duplicate turns up.
- The issue body states the problem, the desired outcome, and how to verify the fix.
- The response does not assume the `perf-regression` label exists. It checks the repository's
  labels first, and does not create the label without asking for its description and color (or
  says to leave the label off if it does not exist).

FAIL if the first command creates the issue, if the body is only the symptom, or if the response
runs `gh label create` (or `--label` on a label it never checked) without raising it.
