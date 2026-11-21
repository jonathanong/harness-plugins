---
type: llm
---

Grade the final message.

PASS if the commands or steps check, before the create command, that `lib/http/retry.ts` still
exists on the default branch of `acme/sdk` and that it still ignores `Retry-After` (for example
`gh api repos/acme/sdk/contents/lib/http/retry.ts`, `gh search code`, or reading the file), and
the response says to correct or drop the issue if the code has moved or been fixed. The issue body
(or its template) states the problem, the desired outcome, and how to verify the fix.

FAIL if the first command creates the issue and the response never says to check the named path and
behavior against the current code, or if it writes the body as only the symptom.
