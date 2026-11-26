---
type: llm
---

PASS if the response says that neither view should be joined here, because nothing from either is
projected and each is joined only to filter, and the query it would merge reads no view: it
checks the base tables instead, with `users.deleted_at IS NULL` and `team_members.removed_at IS
NULL` (as `EXISTS` subqueries or joins to `users` and `team_members`), and still projects only
note columns.

FAIL if the merged query still joins or subqueries `users_public` or `team_members_public`, drops
either filter (deleted authors or removed members), or the review approves the view joins as
they are.
