---
type: llm
---

Grade the final message on one rule: a lint rule that finds its subject by an import is tested
on the indirect ways code reaches that subject, and does not pass silently where it cannot
tell.

Spec files often get Playwright's `test` from a local fixtures module that builds it with
`base.extend(...)` and re-exports it, not straight from `@playwright/test`. A rule that looks
at one file cannot see what such a module exports.

PASS only if both hold:

1. The tests include at least one case where `test` reaches the file indirectly: imported
   from a local module, or built with `.extend(...)`, or through a namespace or default import
   of `@playwright/test`.
2. For a `test` imported from a module the rule cannot see into, with no configuration, the
   rule does not stay silent on a serial suite: it reports the serial suite anyway, or it
   reports that it could not tell where `test` comes from. A test pins that behavior. A rule
   that needs no import at all to report (it matches the call shape) satisfies this.

FAIL if every test imports `test` by name straight from `@playwright/test` (an `as` rename in
that import does not count as indirect). FAIL if a serial suite on a `test` imported from an
unlisted local module produces no report at all, even when an option exists to list that
module and the answer explains the option: unconfigured, the rule reads as a clean result.

Do not grade the rule's other details, its messages, or code style.
