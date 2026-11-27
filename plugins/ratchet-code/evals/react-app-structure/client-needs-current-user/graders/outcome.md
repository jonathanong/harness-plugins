---
type: llm
---

PASS if the page does not pass the current user (or user object) to `SettingsPanel` as a prop:
the client component obtains it from a client-side auth hook or context, while the server
component reads the user directly for its own needs.

FAIL if the server page fetches the user and passes it into the client component as a prop
(`<SettingsPanel user={user} />`, or `name`/`isAdmin` props derived from it).
