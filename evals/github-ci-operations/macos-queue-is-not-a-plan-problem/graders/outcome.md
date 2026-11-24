---
type: llm
---

Grade the final message on one rule: a queue of macOS jobs is not fixed by moving from the Free
plan to the Team plan, because the limit on concurrent macOS jobs is the same on both.

PASS if the answer says that the Team plan does not raise the number of macOS jobs that can run
at once (it is 5 on Free and on Team), so the upgrade will not clear this queue, and it
recommends running fewer macOS jobs or freeing the macOS runners instead, for example fewer
macOS jobs per pull request, a smaller macOS tier on pull requests, or cancelling runs for
superseded pushes.

FAIL if the answer recommends the Team plan as the fix for the macOS queue, or says the upgrade
will raise macOS concurrency. FAIL if it never says the macOS limit stays the same on Team.

Do not grade the exact numbers for total concurrent jobs, prices, whether it mentions larger or
self-hosted runners as a further option, or the commands it suggests.
