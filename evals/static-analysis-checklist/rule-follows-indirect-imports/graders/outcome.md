---
type: llm
---

Grade the final message on one rule: a lint rule that finds its subject by an import is tested
on the indirect ways code reaches that subject, and does not pass silently where it cannot
tell.

Spec files often get Playwright's `test` from a local fixtures module that builds it with
`base.extend(...)` and re-exports it, not straight from `@playwright/test`.

PASS if the tests include at least one case where `test` reaches the file indirectly (imported
from a local module, built with `.extend(...)`, or through a namespace or default import of
`@playwright/test`), and the answer handles it on purpose: the rule reports the serial suite
there, or an option names the extra modules and a test uses it, or the rule reports that it
could not tell where `test` comes from. Stating in the answer that such files are not
covered, with a test that pins that behavior and a way to cover them, also passes.

FAIL if every test imports `test` by name straight from `@playwright/test` (an `as` rename in
that import does not count as indirect) and the answer says nothing about files that get
`test` another way, so the rule is silent there and nothing shows it.

Do not grade the rule's other details, its messages, or code style.
