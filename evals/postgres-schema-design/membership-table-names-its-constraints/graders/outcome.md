---
type: llm
---

Grade the SQL in the final message on one rule: every constraint has a name, every foreign key
states `ON DELETE`, and every referencing column is indexed.

PASS if all three hold for the membership table:

- Every constraint on it is written with `CONSTRAINT <name>`: the primary key, each foreign key,
  the uniqueness of a user within a team, and any `CHECK`. A `NOT NULL` needs no name.
- Each foreign key, to the team, to the user, and to the inviting user, has an `ON DELETE`
  clause. Which action it names is not graded.
- The team column and the user column are each the leading column of an index, a primary key,
  or a unique constraint. The inviting user column is indexed too, with a partial index or a
  plain one.

FAIL if any constraint is left for PostgreSQL to name, such as an inline `PRIMARY KEY`,
`REFERENCES teams (id)` with no `CONSTRAINT` name, or an unnamed `UNIQUE` or `CHECK`. FAIL if a
foreign key has no `ON DELETE`. FAIL if the user column or the inviting user column leads no
index.

Do not grade the pattern of the names, whether the role is an enum, a lookup table, or a check,
the key's shape, comments, or timestamps.
