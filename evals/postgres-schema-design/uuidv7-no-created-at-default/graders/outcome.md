---
type: llm
---

PASS if the migration does not give the table a separate creation-time column with a wall-clock
default (`created_at ... DEFAULT now()` or `DEFAULT CURRENT_TIMESTAMP`). Omitting a creation
column, or exposing `created_at` as a generated column over `uuid_extract_timestamp(id)`, passes.

FAIL if the table has `created_at timestamptz ... DEFAULT now()` (or equivalent) beside the UUIDv7
`id`.
