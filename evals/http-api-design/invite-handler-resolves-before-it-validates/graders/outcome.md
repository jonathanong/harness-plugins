---
type: llm
---

Grade the handler in the final message on one rule: the order of its steps.

PASS if the handler works in this order: it authenticates the caller, then looks up the project
named in the URL and answers 404 when there is none, then validates the body, then creates the
invite. Authentication done by middleware mounted on the route counts as the first step.
Checking that `projectId` has the shape of an id before the lookup is part of resolving the
project and is fine.

FAIL if the body is parsed or validated before the project is looked up, so a caller with a bad
body learns about the body before learning the project does not exist. FAIL if the project is
looked up before the caller is authenticated. FAIL if any step is missing.

Do not grade the response status for success, the shape of the response, or how the zod error
is turned into details.
