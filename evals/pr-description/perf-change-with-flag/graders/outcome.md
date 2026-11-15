---
type: llm
---

PASS if the description does all of these. It shows the latency numbers as a before and after
comparison in a table, with how they were measured (staging, the largest accounts, or the request
count). It states the impact or blast radius beyond the list endpoint: the export job also reads
the cache when the flag is on. It states that the index migration is not gated by the flag, or
takes effect on deploy regardless of the flag. It does not present routine passing checks (unit
tests, lint, typecheck all green) as a section or bullet of the description.

FAIL if there is no before and after table, if the export job is not mentioned, if the migration
is described as covered by the flag or its relation to the flag is not stated, or if the
description lists that tests, lint, or typecheck passed.
