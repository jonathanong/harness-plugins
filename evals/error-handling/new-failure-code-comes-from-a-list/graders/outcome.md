---
type: llm
---

Grade how the new "team is full" failure is identified. The existing code identifies failures
by searching the message text. Do not grade whether the response also migrates the existing
"expired" check, and do not grade the wording of the message.

PASS if both hold:

1. The new failure carries a code, and that code is a member of one defined list of codes: an
   enum, a union of string literals, or a constant array or object the type is derived from.
   The error's code field is typed with that list, so a code outside it does not type-check.
2. The web client decides to show the "team is full" screen by comparing the code (or a typed
   field carrying it), not by searching or comparing the message text.

FAIL if the code field is typed `string` (or is optional `string`) and the code is a literal
written where the error is thrown, with no list that defines the allowed codes. FAIL if there
is no code and the client branches on the HTTP status or on the message. FAIL if the client
finds the failure with `includes(...)`, a regular expression, or equality on the message.
