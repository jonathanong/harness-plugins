---
type: llm
---

Grade the SQL in the final message on one rule: every table and column is commented in the
database.

PASS if the migration has a `COMMENT ON TABLE` for the membership table and a
`COMMENT ON COLUMN` for every column it creates on that table. A new enum type or lookup table
needs no comment to pass, and neither do indexes or constraints.

FAIL if the table has no `COMMENT ON TABLE`, or any column of it has no `COMMENT ON COLUMN`.
SQL comments in the migration text (`-- ...`) are not database comments and do not count.

Do not grade the wording of the comments, the table's shape, its constraints, or its indexes.
