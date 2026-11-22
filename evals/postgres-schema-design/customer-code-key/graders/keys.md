---
type: llm
---

Grade only how the tables are keyed and referenced.

PASS if every table has a generated id primary key (uuid or identity), the customer code is a
`NOT NULL UNIQUE` column on `customers`, and `invoices` references `customers` by that id
(`customer_id`), not by the code.

FAIL if `customers.code` is the primary key, or any other table has a foreign key or a column
that stores the customer code and references it.
