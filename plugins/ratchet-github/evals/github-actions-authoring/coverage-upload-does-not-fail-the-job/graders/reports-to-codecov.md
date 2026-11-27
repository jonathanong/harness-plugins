---
type: llm
---

PASS if the job in the response uploads the coverage report to Codecov, for example with
`codecov/codecov-action`.

FAIL if it uses another coverage service, only posts a comment or a job summary, or only uploads
an artifact. Do not grade whether the upload step can fail the job.
