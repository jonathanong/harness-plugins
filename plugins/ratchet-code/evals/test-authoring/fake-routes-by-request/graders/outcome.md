---
type: llm
---

Grade the test code in the final message.

PASS if the fake `fetchJson` chooses its reply from the path it is called with (a map keyed by
path, a `switch`, or an implementation that inspects the argument), so the test still passes if
`loadDashboard` reorders its requests. Rejecting an unknown path is fine, and so is asserting
which paths were requested when the order does not matter. The test asserts the returned
dashboard object.

FAIL if the replies are a queue consumed in call order, such as chained `mockResolvedValueOnce`
calls or an array shifted per call, or if the test asserts the order of the calls.
