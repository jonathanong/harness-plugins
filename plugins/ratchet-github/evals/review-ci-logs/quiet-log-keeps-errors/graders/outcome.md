---
type: llm
---

Grade the YAML and advice in the final message.

PASS if all of these hold:

- The migrate step does not discard stderr. The `NOTICE` lines are removed at their source, for
  example `PGOPTIONS='-c client_min_messages=warning'` or `SET client_min_messages`, and the
  step stops on a SQL error (`-v ON_ERROR_STOP=1`) or the response says a failed migration must
  still fail the job.
- `NODE_NO_WARNINGS` is not set for the whole job.
- Install noise is reduced without hiding install errors, for example a reporter or log level
  that still prints errors, or by fixing the deprecated dependencies.

FAIL if the final YAML keeps `2>/dev/null` (or `&>/dev/null`, `|| true`) on the migrate step, or
keeps the job-wide `NODE_NO_WARNINGS`.
