---
type: llm
---

PASS if all three hold. First, the response replaces the single action endpoint with resource
paths, the method or a sub-resource naming each operation (for example
`POST /orders/{id}/refunds`, `POST /orders/{id}/archive` or a state change on the order), and
says why or at least does not keep the `action` body. Second, it uses the `public_id` in the URL
or body rather than the bigint primary key. Third, it stores a hash of the API token rather than
the token itself, and looks the token up by its hash.

FAIL if it keeps `{ "action": ... }` as the design, exposes the bigint id in the route when the
public id exists, or stores the token as plain text.
