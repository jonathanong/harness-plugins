---
type: llm
---

Grade the SQL in the final message on one rule: every constraint is named, and the name follows
the pattern `pk_<table>`, `fk_<table>__<column>`, `uq_<table>__<columns>`,
`ck_<table>__<purpose>`.

PASS if every constraint on the membership table is written with `CONSTRAINT <name>`, its
primary key included, and each name starts with the prefix for its kind: `pk_` for the primary
key, `fk_` for a foreign key, `uq_` for a unique constraint, `ck_` for a check. A `NOT NULL`
needs no name. A uniqueness rule written as a unique index named `uq_...` instead of a
constraint is fine.

FAIL if any constraint is left for PostgreSQL to name, such as an inline `PRIMARY KEY`,
`REFERENCES teams (id)` with no `CONSTRAINT` name, or an unnamed `UNIQUE` or `CHECK`. FAIL if a
constraint has a name in another pattern, such as `team_memberships_pkey` or
`team_memberships_team_id_fkey`.

Do not grade `ON DELETE`, indexes, the exact words after the prefix, whether the role is an
enum, a lookup table, or a check, the key's shape, comments, or timestamps.
