---
type: llm
---

Old rows in `report_runs` that a report still points at must survive, and such rows can sit in
every month.

PASS if the response does all three:

1. Says dropping old partitions does not work here, because referenced runs are spread across
   every old range, so no old partition can ever be dropped (or the `RESTRICT` keys block it).
2. Proposes a bounded delete sweep instead: deletes in batches with a `LIMIT` (or an equivalent
   per-run cap) and skips rows that a report still references.
3. Records the reason on the table itself, with `COMMENT ON TABLE report_runs` (or a comment in the
   migration that adds the table comment) saying why retention is a delete sweep and not
   partition drops.

FAIL if it endorses partition drops as the retention mechanism, proposes an unbounded single
`DELETE`, or does not record the reason on the table.
