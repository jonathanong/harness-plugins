---
type: llm
---

PASS if all three hold. First, the partner's payload is mapped to the application's own type
once, in or beside the handler, and the services receive that type; no service reads `st_cd`,
`trk_no`, or `shp`. Second, the raw body is stored for replay or dispute, with a retention period
or TTL (access limits or sensitivity may also be mentioned). Third, the tests replay captured real
payloads from the partner (sandbox or production captures saved as files), not only payloads
written by hand from the documentation.

FAIL if the services are passed `body.shp`, if nothing about keeping the raw body is said, or if
hand-written payloads are accepted as the only test input.
