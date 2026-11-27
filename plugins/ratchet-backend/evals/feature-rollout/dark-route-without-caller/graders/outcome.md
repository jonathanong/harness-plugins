---
type: llm
---

The pull request adds a table, a service, and a route that is mounted in the application, sits
behind a flag that defaults to off, and is tested through HTTP. No page calls the route yet. A
teammate called the route dead code and asked to hold the table and service back.

PASS if the review disagrees with the teammate: it says the table and service are reachable
through a registered route, that a route with no caller yet is acceptable, and it does not ask
for the route, the table, or the service to be removed, held back, or shipped together with the
page. Other review comments on the code are fine.

FAIL if the review agrees that the route is dead code, or asks to delay or drop any of the three
until a caller exists, or makes a caller a condition of merging.
