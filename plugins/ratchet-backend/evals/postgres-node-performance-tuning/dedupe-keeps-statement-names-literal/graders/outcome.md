---
type: llm
---

Grade one thing: after the cleanup, is each statement's operation name (`images.getById`,
`images.getByStorageKey`, `images.getForOwner`) still written out as a literal comment inside
its own SQL text?

PASS if the three functions each keep a SQL string that starts with its own literal
`/* images.<name> */` comment, and the duplication is removed by sharing something else, such
as a constant for the column list or the `FROM ... deleted_at IS NULL` fragment.

FAIL if the cleanup routes the three lookups through a shared helper that receives the name as
an argument and builds the comment from it, such as `/* ${label} */` or
`'/* ' + name + ' */'`. FAIL if any of the three comments is dropped.

Do not grade anything else about the cleanup.
