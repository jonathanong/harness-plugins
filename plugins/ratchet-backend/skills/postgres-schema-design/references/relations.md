# Relations

An identity that readers join is an FK column or an FK child row. JSON holds structured,
schemaless data and history snapshots, including identities recorded as they were at the time.
Do not use UUID arrays, JSON ids, or type/id pairs for live relations. A relation id that
appears in JSON or in a hashed key also gets an FK column on the same row; the JSON copy may stay,
and dedup keys on the FK columns, plus any other identity fields, rather than a hash of the document. A column never names a
table: use one table per target and generate any per-relation progress enum from the same metadata.
Cursor positions and random fencing tokens are intentionally not live entity references; record
their reviewed exception instead of inventing a foreign key.

Split tables when their columns or FK targets differ; share a table when only a value differs.
Identical lookup values share a row without a source discriminator. Put subtype-only columns in
a subtype table whose primary key also references the base row (`business_accounts.account_id`
references `accounts.id`). A 1:N child remains an ordinary child table.

For one of several sources, use an exclusive arc:

```sql
CONSTRAINT ck_payments__one_source CHECK (num_nonnulls(order_id, invoice_id) = 1)
```

Both source columns have their own FK. If a reference must belong to the same account, enforce
`CONSTRAINT fk_payments__account_id_invoice_id FOREIGN KEY (account_id, invoice_id) REFERENCES
invoices (account_id, id) ON DELETE RESTRICT` with a corresponding unique key on the target. A validation trigger is unnecessary. With nullable `invoice_id`,
default `MATCH SIMPLE` skips that composite check when the reference is absent.

The same pair replaces a trigger that only compares one parent column with a literal or with a
column of the child. For a row that may reference only a business account, copy the compared
column to the child, fix it with a `CHECK`, and let the composite foreign key hold the two
together:

```sql
account_kind account_kind NOT NULL,
CONSTRAINT ck_credit_lines__account_kind CHECK (account_kind = 'business'),
CONSTRAINT fk_credit_lines__account_id_account_kind FOREIGN KEY (account_id, account_kind)
  REFERENCES accounts (id, kind) ON DELETE RESTRICT
```

The target needs a unique key on `(id, kind)`. A change of the parent's `kind` then fails while a
child depends on it, which the trigger on the child never checked.

A ledger that survives deletion references a retained identity row with explicit deletion
behavior. Retained identities preserve history; they do not authorize operations on a deleted
account, order, or invoice. Index every FK column with a leading key usable by referential checks; without one, each parent
`DELETE` and each `RESTRICT` or `SET NULL` check scans the child table. That includes actor columns
that are set to `NULL`: index them sparsely with `WHERE <fk> IS NOT NULL`. A partial index is usable
only when its predicate holds for every row a check can touch, so `WHERE deleted_at IS NULL` does
not qualify: cascades and `RESTRICT` checks reach soft-deleted children too.

Finite code-defined values use enums. Use a lookup table when values carry attributes or arrive
at runtime. Authenticated vendor-defined values are inserted into a shared lookup on first sight,
with validation and concurrent insertion handled explicitly. Do not let untrusted strangers
create unbounded permanent lookup rows; reviewed raw text can be appropriate for their input.
Free text and a lookup's own natural key are not finite sets.

Arrays are for enums or outside-defined lists; live identity collections use FK child rows,
never `uuid[]`. User-submitted URLs go through one registry with centralized normalization and
validation, then use URL FKs. Keep exact external protocol identifiers, capability URLs, and
evidence snapshots unchanged when their contract requires it; document the exception.
Do not duplicate a child collection into a parent column unless a trigger maintains the projection.

## Join on ids, never on text

Keys are ids. A key compared as text runs under collation, and its string is copied into every
referencing row and index. Keep the string as a unique column on the owning table and reference
the row by id:

```sql
-- avoid: orders.account_code text REFERENCES accounts (code)
CREATE TABLE accounts (
  id uuid NOT NULL DEFAULT uuidv7(),
  code text NOT NULL,
  CONSTRAINT pk_accounts PRIMARY KEY (id),
  CONSTRAINT uq_accounts__code UNIQUE (code)
);
CREATE TABLE orders (
  id uuid NOT NULL DEFAULT uuidv7(),
  account_id uuid NOT NULL,
  CONSTRAINT pk_orders PRIMARY KEY (id),
  CONSTRAINT fk_orders__account_id FOREIGN KEY (account_id)
    REFERENCES accounts (id) ON DELETE RESTRICT
);
CREATE INDEX idx_orders__account_id ON orders (account_id);
```

Resolve the string to an id once at the boundary, then join `orders.account_id = accounts.id`.
Values matched as text by nature, such as free-form tags, are the exception; document them. Text
in a join's `Hash Cond` or `Index Cond` is a plan red flag; the single lookup of the unique code
at the boundary is expected and fine. See
[reading plans](../../postgres-node-performance-tuning/references/reading-plans.md#text-join-and-index-conditions).

Generic enforcement in `jongleberry/no-mistakes`: `postgres-column-naming`,
`postgres-array-columns`, `postgres-table-shape`, `postgres-fk-index`, and
`postgres-require-fk-on-delete`. These cover naming, configured shapes, and FK mechanics;
inspect the installed rule versions and options rather than assuming complete semantic coverage.
Comments and reviewed exceptions remain necessary.
