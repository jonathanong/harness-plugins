---
type: llm
---

PASS if the import does each I/O step once for the whole list: one `crm.getContacts`, one
`crm.upsertContacts`, and one bulk enqueue (such as `addBulk`), in a list-taking function that
owns the logic. `syncContact` must then be changed into a thin wrapper that calls that function
with `[id]`, so there is one code path.

FAIL if the import runs `syncContact` per contact, whether in a loop, with `Promise.all`, or
behind a concurrency limiter, or if it adds a batch function but leaves `syncContact` unchanged
with its own `getContact`, `upsertContact`, and `add` calls.
